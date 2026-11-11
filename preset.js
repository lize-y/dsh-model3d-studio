/**
 * Agent-side half of the 3D modeling preset.
 *
 * This plugin is mounted only for Sessions created with the `model3d` agent
 * preset. It contributes the build tool, the workflow instructions, and this
 * Session's own modeling folder, while the profile-level plugin serves the
 * HTTP API and Client tabs.
 */
import { mkdir } from 'node:fs/promises'
import {
  MODEL3D_SYSTEM,
  compileSessionModel,
  resolvePython,
  resolveWorkRoot,
  sessionWorkDir,
} from './index.js'

export const inject = ['tools', 'systemPrompt']

/**
 * Convert the readable property map into a raw JSON Schema object.
 *
 * `ctx.tools.register` stores a definition as-is (unlike `defineTool`, which
 * compiles an authoring property map), and model providers reject a tool whose
 * `parameters` is not `type: "object"`.
 */
function parameterSchema(map) {
  const properties = {}
  const required = []
  for (const [name, definition] of Object.entries(map)) {
    const { required: isRequired, ...rest } = definition
    properties[name] = rest
    if (isRequired === true) required.push(name)
  }
  return {
    type: 'object',
    additionalProperties: false,
    properties,
    ...(required.length > 0 ? { required } : {}),
  }
}

const SKILL_BODY = `# 用 build123d 建模（本工作区约定）

这个会话是 3D 建模会话：你直接写 \`part.py\`，然后用 \`model3d_build\` 编译、校验、导出模型。

## 必守约定

- 单位一律毫米（mm），所有尺寸写成带注释的变量。
- 坐标系：Z 轴向上。零件通常以底面 \`Z=0\` 或几何中心为基准，选一个并在 \`part.spec.md\` 里写明。
- 文件只写在本会话目录（\`{{model3d_dir}}\`），不要读或改其他会话目录里的 \`part.py\`/\`part.json\`——那些是别的零件的产物，与你无关。
- 最终实体必须赋给变量 \`part\`。
- 只导入 \`build123d\` 和 \`math\`。不要导入 \`os\`/\`sys\`/\`subprocess\`，不要 \`open\`、\`exec\`、\`eval\`、\`__import__\`。
- 不要自己导出 STL/STEP（禁止 \`export_stl\`、\`export_step\`），\`model3d_build\` 会做。
- 不要 \`print\` 调试；失败信息由工具返回。

## 最小模板

\`\`\`python
from build123d import *

L = 40.0      # 长 (X)
W = 40.0      # 宽 (Y)
H = 20.0      # 高 (Z)
T = 1.2       # 壁厚

with BuildPart() as bp:
    with BuildSketch(Plane.XY):
        Rectangle(L, W)
        Rectangle(L - 2 * T, W - 2 * T, mode=Mode.SUBTRACT)
    extrude(amount=H)

part = bp.part
\`\`\`

## 常用 API 速查

| 需求 | 写法 |
| --- | --- |
| 长方体 | \`Box(L, W, H)\` 或草图 \`Rectangle(L, W)\` + \`extrude(amount=H)\` |
| 圆柱 | \`Cylinder(radius, height)\` 或 \`Circle(r)\` + \`extrude\` |
| 圆形 / 方形孔 | 草图中 \`Circle(r, mode=Mode.SUBTRACT)\` |
| 圆角矩形 | \`RectangleRounded(L, W, radius)\` |
| 多边形 / 三角形 | \`Polygon((x1,y1), (x2,y2), (x3,y3), align=None)\` |
| 定位阵列 | \`with Locations((x, y)): ...\`、\`GridLocations(dx, dy, nx, ny)\`、\`PolarLocations(radius, count)\` |
| 拉伸 | \`extrude(amount=H)\`；双向 \`both=True\` |
| 切除 | \`extrude(amount=-D, mode=Mode.SUBTRACT)\` |
| 圆角 | \`fillet(shape.edges().filter_by(...), radius=R)\` |
| 倒角 | \`chamfer(edges, length=C)\` |
| 沉头孔 | \`CounterSinkHole(radius, counter_sink_radius, depth)\` |
| 螺纹孔（示意） | \`Hole(radius)\` |
| 阵列实体 | \`mirror(obj, about=Plane.YZ)\` 或循环 \`with Locations(...)\` |
| 对齐 | \`align=(Align.CENTER, Align.CENTER, Align.MIN)\` |

## 典型结构模式

- **L 型支架**：底板 \`Box\` + 立板 \`Box\` 叠加；两块板单独建再 \`+=\`，或在同一 \`BuildPart\` 里连续 \`Box(...)\`。
- **法兰 / 板件**：一块板 + 中心大孔 + 角部孔阵列（\`Locations\` 循环最稳）。
- **薄壁壳**：外壳实心体 → 内腔用比外壳小 \`2*T\` 的实体 \`Mode.SUBTRACT\` 切掉；不要用抽壳 API 做复杂拓扑。
- **安装柱（boss）**：在草图里 \`Rectangle(boss, boss, mode=Mode.ADD)\` 与壁合并，再拉伸成全高，最后打孔。

## 常见陷阱

1. **圆角失败**：在布尔交线、薄壁尖角处 fillet 容易失败。做法：先完成所有布尔运算，最后对“明确的边”筛选后 fillet；失败就减小半径或省略（写进 assumptions）。
2. **布尔顺序**：先加实体（\`Mode.ADD\`），再减特征（\`Mode.SUBTRACT\`）；孔一定要在实体合并完成之后切。
3. **草图平面**：\`Plane.XY\` 拉伸是 +Z；要沿 X 方向打孔用 \`Cylinder(..., rotation=(0, 90, 0))\` 或 \`Plane.YZ\`。
4. **薄壁干涉**：孔边到外壁至少留 1.5 mm，否则打印件会破。
5. **对齐歧义**：\`Box\` 默认居中；要底面贴 \`Z=0\` 用 \`align=(Align.CENTER, Align.CENTER, Align.MIN)\`。
6. **超大/超小坐标**：单位搞错（写成米）会导致 bbox 巨大；一切按 mm。

## 规格文件 \`part.spec.md\`

用 Markdown，供“规格”标签页显示，也给图纸标题栏提供图名和材料：

\`\`\`markdown
# 零件名（≤ 20 字）

## 总体尺寸
40 × 40 × 20 mm

## 几何特征
- 外框：40×40×20，四角 R2
- 内腔：37.6×37.6 贯通，内角 R1
- 安装孔：4×Ø4.3，孔距 32

## 材料
PETG

## 工艺
FDM，0.4 mm 喷嘴

## 公差
线性 ±0.3，孔距 ±0.15

## 假设
- 未注圆角 R2
\`\`\`

## 工作流程

1. 澄清关键尺寸（每轮 ≤ 2 个问题）。
2. 写 \`part.py\` 和 \`part.spec.md\`。
3. 调 \`model3d_build\`。
4. 报错 → 改 \`part.py\` → 重试（最多 3 次）。
5. 成功后告诉用户：模型已生成、三视图在“规格”标签、STL 在“模型”标签、文件在会话目录。
`

export function apply(ctx, config = {}) {
  const root = resolveWorkRoot(ctx, config)
  const python = resolvePython(ctx, config, root)

  function requiredCwd(exec) {
    const agent = exec.agent
    const cwd = agent ? ctx.get('workingDirectory')?.get(agent.session) : undefined
    if (!cwd) throw new Error('当前会话没有可用工作目录')
    return cwd
  }

  ctx.effect(
    () =>
      ctx.tools.register({
        name: 'model3d_build',
        description:
          'Compile and run the build123d script you already wrote as part.py in the current workspace, validate the geometry, export STL/STEP, and refresh the Model tab. This tool takes no code: write part.py (and optionally part.spec.md) with the normal file tools first, then call this.',
        parameters: parameterSchema({
          path: {
            type: 'string',
            description: 'Optional script path relative to the workspace; defaults to part.py.',
          },
        }),
        output: {
          schema: {
            type: 'object',
            additionalProperties: true,
            properties: {
              ok: { type: 'boolean' },
              title: { type: 'string' },
              summary: { type: 'string' },
              stlUrl: { type: 'string' },
              stepUrl: { type: 'string' },
              codeUrl: { type: 'string' },
            },
            required: ['ok', 'title'],
          },
          render(_args, value) {
            const size = value.meta?.bbox?.size
            const bbox = Array.isArray(size) ? size.map((part) => Number(part).toFixed(1)).join(' × ') : 'unknown'
            return [
              {
                type: 'text',
                text: `Model generated: ${value.title} (${bbox} mm). Files: part.py, part.stl, part.step in the workspace root. Open the Spec / Model tabs to inspect.`,
              },
            ]
          },
        },
        timeoutMs: 900000,
        isConcurrencySafe() {
          return false
        },
        async execute(args, exec) {
          const cwd = requiredCwd(exec)
          const scriptPath = typeof args?.path === 'string' && args.path.trim() ? args.path.trim() : undefined
          return await compileSessionModel(ctx, config, root, python, cwd, exec.agent.id, scriptPath)
        },
      }),
    'model3d-preset: build tool',
  )

  // A runtime skill teaches the modeling contract in one place: the API
  // surface, the workspace conventions, and the pitfalls. Loading it replaces
  // scavenging other sessions' part.py files for examples.
  ctx.effect(() => {
    const skills = ctx.get('skills')
    if (!skills || typeof skills.register !== 'function') return () => {}
    return skills.register({
      name: 'model3d-modeling',
      description:
        'build123d modeling contract for this workspace: coordinate conventions, API quick reference, feature patterns, pitfalls, part.spec.md format, and the model3d_build loop.',
      whenToUse:
        'Before writing or revising part.py, or when a build fails and you need the correct build123d idiom.',
      content: SKILL_BODY,
      source: 'runtime',
    })
  }, 'model3d-preset: modeling skill')

  // The preset's plugin context is per Agent, so one session owns one folder:
  // <workspace>/model3d/<session-id>/. The absolute path reaches the prompt
  // through an interpolated variable, and the build tool reads the same path.
  ctx.effect(() => {
    const disposers = new Map()
    const onCreated = ctx.on('agent/created', async (payload) => {
      const agent = payload && payload.agent
      if (!agent || typeof agent.id !== 'string') return
      try {
        const base = ctx.get('workingDirectory')?.get(agent.session) ?? ctx.get('workingDirectory')?.defaultDirectory
        if (!base) return
        const dir = sessionWorkDir(base, agent.id)
        await mkdir(dir, { recursive: true })
        const dispose = agent.ctx.effect(() => {
          const disposeVariable = agent.ctx.systemPrompt.variable('model3d_dir', () => dir)
          const disposeSection = agent.ctx.systemPrompt.section({
            name: 'model3d-workflow',
            order: 850,
            text: MODEL3D_SYSTEM,
          })
          return () => {
            disposeSection?.()
            disposeVariable?.()
          }
        })
        disposers.set(agent.id, dispose)
      } catch (error) {
        const logger = ctx.logger
        if (logger && typeof logger.warn === 'function') logger.warn(error)
      }
    })
    return () => {
      for (const dispose of disposers.values()) {
        try {
          dispose()
        } catch {
          // Ignore teardown failures.
        }
      }
      disposers.clear()
      if (typeof onCreated === 'function') onCreated()
    }
  }, 'model3d-preset: per-session modeling folder')
}
