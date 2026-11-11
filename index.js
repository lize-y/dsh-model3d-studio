/**
 * Model3D Studio — Host half.
 *
 * The plugin exposes a small same-origin JSON API used by its Web panel:
 *   GET  /api/model3d/status
 *   GET  /api/model3d/models
 *   POST /api/model3d/chat
 *   POST /api/model3d/generate
 *   GET  /api/model3d/files/<run-id>/<file>
 *
 * Requirements gathering and build123d authoring are delegated to the
 * deployment's default LLM. Generated code is statically screened, executed in
 * a resource-limited subprocess, and exported to STL + STEP for the viewer.
 */
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROUTE = '/api/model3d'
const RUN_ID = /^[a-z0-9][a-z0-9-]{5,80}$/i
const PROJECT_ID = /^[a-z0-9][a-z0-9-]{5,80}$/i
const PROJECT_STATE_VERSION = 1
const DEFAULT_PROJECT_TITLE = '未命名建模会话'
const SERVED_FILES = new Set(['model.stl', 'model.step', 'generated.py', 'meta.json'])
const SESSION_FILES = {
  'part.stl': 'model/stl',
  'part.step': 'application/step',
  'part.py': 'text/plain; charset=utf-8',
  'part.json': 'application/json; charset=utf-8',
  'drawing.svg': 'image/svg+xml',
  'drawing-front.svg': 'image/svg+xml',
  'drawing-top.svg': 'image/svg+xml',
  'drawing-right.svg': 'image/svg+xml',
}
const DRAWING_FILES = ['drawing.svg']
const MIME = {
  'model.stl': 'model/stl',
  'model.step': 'application/step',
  'generated.py': 'text/plain; charset=utf-8',
  'meta.json': 'application/json; charset=utf-8',
}

export const inject = ['webServer']

export const MODEL3D_SYSTEM = `## 3D 建模工作区

这是两阶段工作流：先把需求整理成工程规格，再写代码建模。不要在需求还没定时就开始设计 Python。

### 阶段 1 需求澄清（禁止写代码）

- 先读出用户已经给出的尺寸，只问仍然缺失、且会改变几何或装配的关键项；每轮最多 2 个问题。
- 能用工程默认值处理的细节直接写进规格的"假设"，不要追问。
- 本阶段禁止：写 part.py、写 part.spec.md、调用 model3d_build。只做文字回复和提问。
- 当总体尺寸、关键特征、材料/工艺都能定了，或用户明确说"直接做 / 按推荐"，进入阶段 2。

### 阶段 2 锁定规格

- 把规格写成 {{model3d_dir}}/part.spec.md，用 Markdown：标题、总体尺寸、几何特征（每项一行，含尺寸与位置）、材料、工艺、公差、表面、假设、制图备注。保持精炼，总长 1200 字以内，不要写 JSON。
- 回复用户一段简短摘要：总体尺寸 + 关键特征 + 主要假设，并说明"规格已锁定，可以看规格页的示意三视图，接着开始建模"。规格页会在这一步就画出草图（不依赖代码）。
- 用户此时若要改，先改 part.spec.md 再继续，不要带着旧规格写代码。

### 阶段 3 写代码并编译

- 一次性写完整的 part.py：参数化、毫米、注释只保留参数行与关键步骤，控制在 150 行以内，最终实体赋给变量 part。
- 写完立即调用 model3d_build。它只负责编译运行该目录下的 part.py、校验几何、导出 STL/STEP 并刷新"模型"标签页。
- 失败时按错误信息修改 part.py 再编译，最多 3 次。不要伪造成功结果。
- 成功后回报：模型已生成、三视图在"规格"标签、STL 在"模型"标签、文件在会话目录。

### 输出预算（重要）

- 一次回复只交付一件事：这一轮只写 part.spec.md，下一轮只写 part.py，再下一轮只编译。不要在同一轮里既写规格又写代码。
- 正文控制在 100 字以内。代码已经写在文件里，不要在回复中再粘贴一遍，也不要逐步讲解实现。
- 写 part.py 时直接给出最终版本，不要先写骨架再补；避免"先看看能不能跑"的半成品。

### 硬性约束

- 只导入 build123d 与 math；不要调用导出函数（export_stl / export_step / export_gltf / export_brep），不要写文件、联网，不要用 exec / eval / open / subprocess / __import__。
- 需要 build123d 用法、坐标约定或常见陷阱时，加载 model3d-modeling 技能（skill 工具）。
- 不要为了找示例去读其他会话目录里的 part.py / part.json，那是别的零件，不是参考模板。
`

class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

function log(ctx, level, error) {
  const logger = ctx.logger
  if (logger && typeof logger[level] === 'function') logger[level](error)
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  res.end(body)
}

async function readJson(req, limit = 1_500_000) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > limit) throw new HttpError(413, 'payload-too-large', '请求内容过大')
    chunks.push(chunk)
  }
  if (total === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new HttpError(400, 'invalid-json', '请求不是有效的 JSON')
  }
}

function clip(value, max) {
  const text = typeof value === 'string' ? value : String(value ?? '')
  return text.length > max ? `${text.slice(0, max)}\n…` : text
}

function findLastJson(text) {
  const lines = String(text).trim().split(/\r?\n/).filter(Boolean)
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim()
    if (!line.startsWith('{')) continue
    try {
      return JSON.parse(line)
    } catch {
      // keep scanning
    }
  }
  return undefined
}

function newId() {
  return `${new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '')}-${randomBytes(3).toString('hex')}`
}

function extractJson(text) {
  const source = String(text ?? '').trim()
  if (!source) return undefined
  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenced ? fenced[1] : source).trim()
  try {
    return JSON.parse(candidate)
  } catch {
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1))
      } catch {
        return undefined
      }
    }
  }
  return undefined
}

function extractCode(text) {
  const source = String(text ?? '').trim()
  const fenced = source.match(/```(?:python|py)?\s*([\s\S]*?)```/i)
  if (fenced) return fenced[1].trim()
  if (/^(?:from\s+build123d|import\s+build123d)/m.test(source)) return source
  return ''
}

function normalizeOption(option) {
  if (typeof option === 'string') return { label: option, value: option }
  if (!option || typeof option !== 'object') return undefined
  const label = clip(option.label ?? option.text ?? option.value ?? '', 160).trim()
  const value = clip(option.value ?? option.label ?? option.text ?? '', 300).trim()
  return label && value ? { label, value } : undefined
}

function normalizeQuestions(value) {
  if (!Array.isArray(value)) return []
  return value
    .slice(0, 3)
    .map((question, index) => {
      if (!question || typeof question !== 'object') return undefined
      const text = clip(question.text ?? question.question ?? question.label ?? '', 500).trim()
      if (!text) return undefined
      const options = Array.isArray(question.options)
        ? question.options.map(normalizeOption).filter(Boolean).slice(0, 4)
        : []
      return {
        id: clip(question.id ?? `q${index + 1}`, 80),
        text,
        options,
      }
    })
    .filter(Boolean)
}

export function normalizeSpec(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const spec = { ...value }
  if (!spec.units) spec.units = 'mm'
  if (!spec.title && typeof spec.name === 'string') spec.title = spec.name
  return spec
}

function listOfStrings(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item : item && typeof item === 'object' ? JSON.stringify(item) : String(item ?? '')))
    .map((item) => clip(item.trim(), maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

function parseOverall(value, length, width, height) {
  const numbers = (input) => {
    if (Array.isArray(input)) return input.map(Number).filter(Number.isFinite)
    if (typeof input === 'number' && Number.isFinite(input)) return [input]
    if (typeof input !== 'string') return []
    return (input.match(/[-+]?\d+(?:\.\d+)?/g) || []).map(Number).filter(Number.isFinite)
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) return value
  const triple = numbers(value)
  const size = {
    length: Number.isFinite(Number(length)) ? Number(length) : triple[0],
    width: Number.isFinite(Number(width)) ? Number(width) : triple[1],
    height: Number.isFinite(Number(height)) ? Number(height) : triple[2],
  }
  if (size.length === undefined && size.width === undefined && size.height === undefined) return undefined
  return size
}

function parseFeatures(value) {
  if (!Array.isArray(value)) return []
  return value
    .slice(0, 20)
    .map((item) => {
      if (typeof item === 'string') {
        const text = item.trim()
        const split = text.split(/[：:]/, 2)
        if (split.length === 2 && split[0].trim().length <= 40) {
          return { name: clip(split[0].trim(), 80), description: clip(split.slice(1).join(':').trim(), 600) }
        }
        return { name: clip(text, 120) }
      }
      if (item && typeof item === 'object') {
        return {
          name: clip(item.name ?? item.label ?? '', 120),
          description: clip(item.description ?? item.detail ?? '', 600),
          ...(item.kind ? { kind: clip(item.kind, 40) } : {}),
          ...(item.dimensions ? { dimensions: item.dimensions } : {}),
          ...(item.position ? { position: clip(item.position, 300) } : {}),
        }
      }
      return null
    })
    .filter(Boolean)
}

/**
 * Build a canonical spec from the compact flat tool arguments.
 *
 * A flat `title` / `summary` / `overall` / `features` form keeps the model's
 * tool-call JSON shallow, which prevents the malformed, over-long nested
 * arguments that deep object graphs produce. A legacy nested `spec` object
 * remains accepted for compatibility.
 */
export function normalizeSpecArgs(args) {
  if (!args || typeof args !== 'object') return null
  const legacy = normalizeSpec(args.spec)
  if (legacy && typeof legacy.title === 'string' && legacy.title.trim()) return legacy
  const title = clip(args.title ?? '', 160).trim()
  if (!title) return null
  const spec = {
    title,
    summary: clip(args.summary ?? '', 900),
    units: clip(args.units ?? 'mm', 16) || 'mm',
    overall: parseOverall(args.overall, args.length, args.width, args.height),
    features: parseFeatures(args.features),
    material: clip(args.material ?? '', 500),
    process: clip(args.process ?? '', 700),
    tolerances: clip(args.tolerances ?? '', 500),
    surface: clip(args.surface ?? '', 500),
    assumptions: listOfStrings(args.assumptions, 12, 500),
    drawingNotes: listOfStrings(args.drawingNotes, 12, 500),
  }
  for (const key of ['overall', 'material', 'process', 'tolerances', 'surface']) {
    if (!spec[key] || (typeof spec[key] === 'string' && !spec[key].trim())) delete spec[key]
  }
  if (!spec.features.length) delete spec.features
  if (!spec.assumptions.length) delete spec.assumptions
  if (!spec.drawingNotes.length) delete spec.drawingNotes
  return spec
}

function normalizeClarify(text) {
  let parsed = extractJson(text)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    // Some models answer with a JSON-encoded string in `message`; unwrap that
    // shape so a valid nested specification is not mistaken for prose.
    if (!parsed.spec && typeof parsed.message === 'string' && parsed.message.trim().startsWith('{')) {
      const nested = extractJson(parsed.message)
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) parsed = nested
    }
    const spec = normalizeSpec(parsed.spec)
    const questions = normalizeQuestions(parsed.questions)
    const message = clip(parsed.message ?? parsed.reply ?? parsed.question ?? '', 3000).trim()
    const ready = parsed.state === 'ready' || parsed.ready === true
    return {
      message: message || (ready ? '需求已经足够明确，我整理了工程规格。' : '为了继续，我还需要确认几个尺寸。'),
      state: ready && spec ? 'ready' : 'clarifying',
      questions: ready && spec ? [] : questions,
      missing: Array.isArray(parsed.missing)
        ? parsed.missing.map((item) => clip(item, 160)).filter(Boolean).slice(0, 8)
        : [],
      spec: ready && spec ? spec : spec ?? null,
    }
  }
  const fallback = clip(text, 3000).trim()
  return {
    message: fallback || '我需要再确认一个关键尺寸，才能把需求转成可建模的工程图。',
    state: 'clarifying',
    questions: [],
    missing: [],
    spec: null,
  }
}

const CLARIFY_SYSTEM = `你是一位资深机械设计工程师和 CAD 制图审核员。你的任务是通过少量、逐步的追问，把用户模糊的 3D 建模需求变成一份可以直接交给 build123d 建模的工程制图描述。

工作原则：
1. 所有尺寸默认使用毫米（mm）。绝不擅自改变用户给出的数值。
2. 每轮最多提出 2 个真正影响几何形状、装配或强度的问题。优先给出 2-4 个带推荐值的选项，让用户可以快速点选。
3. 不要重复询问用户已经回答过的信息。能从上下文合理推断的内容，写进 assumptions，不要追问。
4. 只追问会改变几何结果的信息：总体尺寸、关键特征（孔/槽/凸台/圆角/倒角）、孔位与孔径、壁厚、配合关系、安装接口、受力方向。材料/表面处理仅在影响几何或强度时询问。
5. 当信息足以建模时，必须输出完整 spec，并把 state 设为 "ready"；否则 state 为 "clarifying"。不要为了多问而拖延。
6. 面向用户的消息要简洁、专业、具体，使用用户的语言（默认中文）。不要输出 Markdown 代码围栏，不要输出 JSON 以外的任何文字。
7. 当输入带有【用户要求立即定稿】，或用户明确表示“不再追问 / 按推荐处理 / 直接开始建模”时，必须停止提问，令 state 为 "ready" 并输出完整 spec；未决细节采用最合理的工程默认值写入 assumptions 与 drawingNotes。此时 questions 必须为空。

只输出一个严格合法的 JSON 对象，结构如下：
{
  "message": "给用户看的中文说明或问题；ready 时简要说明规格已锁定",
  "state": "clarifying" | "ready",
  "questions": [
    {
      "id": "短英文 id",
      "text": "要确认的具体问题",
      "options": [{"label": "20 mm（推荐）", "value": "内孔直径 20 mm"}, ...]
    }
  ],
  "missing": ["仍然缺失的关键信息"],
  "spec": null 或 {
    "title": "零件名称",
    "summary": "一句话功能与结构说明",
    "units": "mm",
    "overall": {"length": 100, "width": 60, "height": 20},
    "features": [
      {"name": "中心通孔", "kind": "through-hole", "description": "用于穿过 M12 螺栓", "dimensions": "Ø12，贯穿", "position": "中心 (0,0)"}
    ],
    "material": "6061-T6 铝合金",
    "process": "CNC 铣削",
    "tolerances": "一般公差 ±0.2 mm；配合孔 H7",
    "surface": "Ra 3.2",
    "assumptions": ["未注圆角 R2", "以底面为基准"],
    "drawingNotes": ["总长 100", "两孔中心距 70"]
  }
}

spec 必须尽量包含可建模的数值：总体外形、每个特征的尺寸/位置/深度、基准与对称关系。若信息不足，宁可在 questions 里问，不要把关键尺寸留空。`

const CODE_SYSTEM = `你是 build123d 0.13 的高级 CAD 工程师。请根据工程规格编写一个可在无图形界面环境运行的完整 Python 脚本。

硬性要求：
1. 仅允许 import build123d 和 math。使用 \`from build123d import *\` 最方便。
2. 输出必须是一个脚本，最终把单一实体赋值给变量 \`part\`。part 必须是 Solid、Part、Compound 或 BuildPart 的 .part，不能是列表。
3. 所有尺寸单位为毫米。所有关键尺寸在脚本顶部定义为具名参数，并在注释中写明含义。
4. 不要导出文件、不要 print/input、不要读写文件、不要联网、不要使用 os/sys/subprocess/pathlib/open/exec/eval。
5. 必须生成有效、非空、无零厚度薄壁的实体。孔要贯穿或明确深度；孔位与外形保持合理余量。
6. 优先使用参数化、可读的 build123d 写法。布尔运算失败时，调整顺序或加微小余量，但不得改变规格意图。
7. 代码必须完整，包含必要的 import、参数、几何构建和 \`part = ...\`。
8. 只输出一个 Python 代码围栏（三个反引号 + python），不要输出解释文字。`

function buildClarifyPrompt({ history, spec, brief, forceReady }) {
  const lines = []
  if (brief) lines.push(`【最初需求】\n${clip(brief, 4000)}`)
  if (spec) lines.push(`【当前工程规格草稿】\n${JSON.stringify(spec, null, 2)}`)
  const turns = Array.isArray(history) ? history.slice(-24) : []
  if (turns.length > 0) {
    lines.push('【最近对话】')
    for (const turn of turns) {
      const role = turn?.role === 'assistant' ? '助手' : '用户'
      const content = clip(turn?.content, 2500).trim()
      if (content) lines.push(`${role}：${content}`)
    }
  }
  if (forceReady) {
    lines.push(
      '【用户要求立即定稿】\n用户已经要求停止追问。请立即输出完整 spec，state 必须为 "ready"，questions 必须为空。若参数之间存在冲突，采用最合理的工程方案解决，并在 assumptions 与 drawingNotes 中写明取舍，不得再向用户提问。',
    )
  } else {
    lines.push(
      '【任务】\n请基于以上信息继续需求澄清。检查当前规格是否已经足以精确建模；若足够，输出完整 spec 并令 state 为 ready；若不足，只问最多 2 个最关键的问题。只输出规定结构的 JSON。',
    )
  }
  if (forceReady) lines.push('只输出规定结构的 JSON，不要输出任何额外文字。')
  return lines.join('\n\n')
}

function buildCodePrompt({ spec, brief, history, previousCode, previousError }) {
  const lines = []
  if (spec) lines.push(`【工程规格】\n${JSON.stringify(spec, null, 2)}`)
  if (brief) lines.push(`【原始需求】\n${clip(brief, 3000)}`)
  if (Array.isArray(history) && history.length > 0) {
    const turns = history
      .slice(-14)
      .map((turn) => `${turn?.role === 'assistant' ? '助手' : '用户'}：${clip(turn?.content, 1200)}`)
      .filter(Boolean)
    if (turns.length > 0) lines.push(`【需求对话摘要】\n${turns.join('\n')}`)
  }
  if (previousCode) {
    lines.push(`【上一版代码】\n\`\`\`python\n${clip(previousCode, 24_000)}\n\`\`\``)
  }
  if (previousError) {
    lines.push(`【上一版失败原因】\n${clip(previousError, 5000)}`)
  }
  lines.push(
    '【任务】\n生成一份可直接执行的 build123d 脚本。严格按工程规格中的数值建模；若规格有未注细节，采用合理机械默认值并在注释中说明。最终实体赋值给 part。只输出 Python 代码围栏。',
  )
  return lines.join('\n\n')
}

function safeModel(selection) {
  if (!selection || typeof selection !== 'object') return undefined
  if (typeof selection.provider !== 'string' || typeof selection.model !== 'string') {
    return undefined
  }
  return { provider: selection.provider, model: selection.model }
}

export function resolveWorkRoot(ctx, config) {
  const base =
    (typeof config.workDir === 'string' && config.workDir.trim()) ||
    ctx.get('workingDirectory')?.defaultDirectory ||
    process.env.DSH_WORKSPACE ||
    process.cwd()
  return path.resolve(base, 'model3d-studio')
}

export function resolvePython(ctx, config, root) {
  if (typeof config.pythonPath === 'string' && config.pythonPath.trim()) {
    return config.pythonPath.trim()
  }
  if (process.env.DSH_MODEL3D_PYTHON) return process.env.DSH_MODEL3D_PYTHON
  const candidates = [
    path.join(root, '..', '.model3d-venv', 'bin', 'python'),
    path.join(process.cwd(), '.model3d-venv', 'bin', 'python'),
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return 'python3'
}

function libraryPath(root, config) {
  const parts = []
  if (typeof config.ldLibraryPath === 'string' && config.ldLibraryPath.trim()) {
    parts.push(config.ldLibraryPath.trim())
  }
  const candidates = [
    path.join(root, '..', '.model3d-libs', 'usr', 'lib', 'x86_64-linux-gnu'),
    path.join(process.cwd(), '.model3d-libs', 'usr', 'lib', 'x86_64-linux-gnu'),
    '/usr/lib/x86_64-linux-gnu',
    '/usr/lib',
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) parts.push(candidate)
  }
  if (process.env.LD_LIBRARY_PATH) parts.push(process.env.LD_LIBRARY_PATH)
  return [...new Set(parts)].join(path.delimiter)
}

function subprocessEnv(root, workDir, runDir, config) {
  const cache = path.join(runDir, '.cache')
  return {
    PATH: process.env.PATH ?? '/usr/local/bin:/usr/bin:/bin',
    HOME: runDir,
    TMPDIR: cache,
    XDG_CACHE_HOME: cache,
    JOBLIB_TEMP_FOLDER: cache,
    JOBLIB_MULTIPROCESSING: '0',
    MPLBACKEND: 'Agg',
    MPLCONFIGDIR: cache,
    NUMBA_CACHE_DIR: cache,
    PYTHONDONTWRITEBYTECODE: '1',
    PYTHONUNBUFFERED: '1',
    PYTHONNOUSERSITE: '1',
    OMP_NUM_THREADS: '1',
    OPENBLAS_NUM_THREADS: '1',
    MKL_NUM_THREADS: '1',
    LD_LIBRARY_PATH: libraryPath(root, config),
  }
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      child.kill('SIGKILL')
      resolve({
        code: -1,
        stdout,
        stderr: `${stderr}\nProcess timed out after ${options.timeoutMs ?? 120000} ms`,
        timedOut: true,
      })
    }, options.timeoutMs ?? 120000)
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8')
      if (stdout.length > 400_000) stdout = stdout.slice(-400_000)
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8')
      if (stderr.length > 200_000) stderr = stderr.slice(-200_000)
    })
    child.on('error', (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ code: -1, stdout, stderr: `${stderr}\n${error.message}`, spawnError: true })
    })
    child.on('close', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ code: code ?? -1, stdout, stderr })
    })
  })
}

async function dirExists(target) {
  try {
    return (await stat(target)).isDirectory()
  } catch {
    return false
  }
}

async function readMeta(runDir) {
  try {
    return JSON.parse(await readFile(path.join(runDir, 'meta.json'), 'utf8'))
  } catch {
    return undefined
  }
}

async function listRuns(root) {
  const runsDir = path.join(root, 'runs')
  if (!(await dirExists(runsDir))) return []
  const entries = await readdir(runsDir, { withFileTypes: true })
  const runs = []
  for (const entry of entries) {
    if (!entry.isDirectory() || !RUN_ID.test(entry.name)) continue
    const runDir = path.join(runsDir, entry.name)
    try {
      const record = JSON.parse(await readFile(path.join(runDir, 'run.json'), 'utf8'))
      if (!record || typeof record !== 'object') continue
      runs.push({
        id: entry.name,
        title: typeof record.title === 'string' ? record.title : '3D Model',
        summary: typeof record.summary === 'string' ? record.summary : '',
        createdAt: record.createdAt ?? Date.now(),
        meta: record.meta ?? (await readMeta(runDir)),
        stlUrl: `${ROUTE}/files/${entry.name}/model.stl`,
        stepUrl: `${ROUTE}/files/${entry.name}/model.step`,
      })
    } catch {
      // Ignore incomplete runs.
    }
  }
  return runs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 12)
}

function projectPaths(root, id) {
  const dir = path.join(root, 'projects', id)
  const metaDir = path.join(dir, '.model3d')
  return {
    dir,
    metaDir,
    file: path.join(metaDir, 'project.json'),
    models: path.join(dir, 'models'),
  }
}

function normalizeProjectId(value) {
  if (typeof value !== 'string' || !PROJECT_ID.test(value)) {
    throw new HttpError(404, 'project-not-found', '建模会话不存在')
  }
  return value
}

function sanitizeQuestionList(value) {
  if (!Array.isArray(value)) return undefined
  return value
    .slice(0, 2)
    .filter((question) => question && typeof question === 'object')
    .map((question, index) => ({
      id: clip(question.id ?? `q${index + 1}`, 80),
      text: clip(question.text ?? '', 2000),
      options: Array.isArray(question.options)
        ? question.options.slice(0, 8).map((option) => ({
            label: clip(option?.label ?? '', 500),
            value: clip(option?.value ?? option?.label ?? '', 2000),
          }))
        : [],
    }))
}

function sanitizeMessages(value) {
  if (!Array.isArray(value)) return []
  return value
    .slice(-200)
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message, index) => {
      const item = {
        id: clip(message.id ?? `m${index}`, 80),
        role: message.role,
        content: clip(message.content ?? '', 20000),
      }
      if (typeof message.kind === 'string') item.kind = clip(message.kind, 40)
      const questions = sanitizeQuestionList(message.questions)
      if (questions?.length) item.questions = questions
      if (Array.isArray(message.missing)) {
        item.missing = message.missing.slice(0, 10).map((part) => clip(part, 300))
      }
      return item
    })
    .filter((message) => message.kind !== 'welcome' && (message.content || message.questions?.length))
    .map((message, index, list) => {
      // Once the user has replied, the question card has served its purpose.
      // Keep the transcript, but drop the now-stale option controls on reload.
      if (message.questions && list.slice(index + 1).some((later) => later.role === 'user')) {
        const { questions, ...rest } = message
        return rest
      }
      return message
    })
}

function sanitizeModelRecord(value) {
  if (!value || typeof value !== 'object') return null
  const safeUrl = (url) =>
    typeof url === 'string' && url.startsWith(`${ROUTE}/files/`) ? url : ''
  return {
    id: typeof value.id === 'string' ? clip(value.id, 80) : '',
    title: clip(value.title ?? '3D 模型', 160),
    summary: clip(value.summary ?? '', 800),
    spec: normalizeSpec(value.spec),
    code: typeof value.code === 'string' ? clip(value.code, 60000) : '',
    meta: value.meta && typeof value.meta === 'object' ? value.meta : null,
    stlUrl: safeUrl(value.stlUrl),
    stepUrl: safeUrl(value.stepUrl),
    codeUrl: safeUrl(value.codeUrl),
    createdAt: Number.isFinite(value.createdAt) ? value.createdAt : Date.now(),
  }
}

function normalizeProjectRecord(raw, id, dir) {
  const model = sanitizeModelRecord(raw?.model)
  const spec = normalizeSpec(raw?.spec)
  let stage = ['chat', 'ready', 'done', 'error'].includes(raw?.stage) ? raw.stage : 'chat'
  if (stage === 'generating') stage = model ? 'done' : spec ? 'ready' : 'chat'
  if (stage === 'done' && !model) stage = 'chat'
  return {
    version: PROJECT_STATE_VERSION,
    id,
    title: clip(raw?.title ?? DEFAULT_PROJECT_TITLE, 120).trim() || DEFAULT_PROJECT_TITLE,
    createdAt: Number.isFinite(raw?.createdAt) ? raw.createdAt : Date.now(),
    updatedAt: Number.isFinite(raw?.updatedAt) ? raw.updatedAt : Date.now(),
    workspaceId: typeof raw?.workspaceId === 'string' ? raw.workspaceId : null,
    workspacePath: dir,
    stage,
    messages: sanitizeMessages(raw?.messages),
    spec,
    model,
    code: typeof raw?.code === 'string' ? clip(raw.code, 60000) : model?.code ?? '',
    activeTab: ['model', 'spec', 'code'].includes(raw?.activeTab) ? raw.activeTab : 'model',
    generationError: typeof raw?.generationError === 'string' ? clip(raw.generationError, 6000) : '',
  }
}

async function readProject(root, id) {
  normalizeProjectId(id)
  const paths = projectPaths(root, id)
  let raw
  try {
    raw = JSON.parse(await readFile(paths.file, 'utf8'))
  } catch (error) {
    if (error && error.code === 'ENOENT') throw new HttpError(404, 'project-not-found', '建模会话不存在')
    throw new HttpError(500, 'project-unreadable', '无法读取建模会话')
  }
  return normalizeProjectRecord(raw, id, paths.dir)
}

async function writeProject(root, record) {
  const paths = projectPaths(root, record.id)
  await mkdir(paths.metaDir, { recursive: true })
  await mkdir(paths.models, { recursive: true })
  const next = { ...record, version: PROJECT_STATE_VERSION, updatedAt: Date.now() }
  const temp = `${paths.file}.${process.pid}.tmp`
  await writeFile(temp, JSON.stringify(next, null, 2), 'utf8')
  await rename(temp, paths.file)
  return next
}

function projectSummary(record) {
  return {
    id: record.id,
    title: record.title,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    stage: record.stage,
    modelTitle: record.model?.title ?? '',
    modelId: record.model?.id ?? '',
    hasModel: Boolean(record.model),
    workspaceId: record.workspaceId ?? null,
  }
}

function projectView(record, root, full = false) {
  const paths = projectPaths(root, record.id)
  if (!full) return { ...projectSummary(record), path: paths.dir }
  return {
    ...record,
    path: paths.dir,
    workspacePath: paths.dir,
    modelTitle: record.model?.title ?? '',
    hasModel: Boolean(record.model),
  }
}

async function listProjects(root) {
  await mkdir(path.join(root, 'projects'), { recursive: true })
  const entries = await readdir(path.join(root, 'projects'), { withFileTypes: true })
  const records = []
  for (const entry of entries) {
    if (!entry.isDirectory() || !PROJECT_ID.test(entry.name)) continue
    try {
      records.push(await readProject(root, entry.name))
    } catch {
      // Ignore incomplete or malformed projects.
    }
  }
  return records.sort((a, b) => b.updatedAt - a.updatedAt)
}

async function createProject(root, title) {
  const id = newId()
  const paths = projectPaths(root, id)
  await mkdir(paths.metaDir, { recursive: true })
  await mkdir(paths.models, { recursive: true })
  const record = await writeProject(root, {
    version: PROJECT_STATE_VERSION,
    id,
    title: clip(title ?? DEFAULT_PROJECT_TITLE, 120).trim() || DEFAULT_PROJECT_TITLE,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    workspaceId: null,
    stage: 'chat',
    messages: [],
    spec: null,
    model: null,
    code: '',
    activeTab: 'model',
    generationError: '',
  })
  return record
}

async function ensureDefaultProject(root) {
  const projects = await listProjects(root)
  if (projects.length > 0) return projects[0]
  return createProject(root, DEFAULT_PROJECT_TITLE)
}

async function saveProjectState(root, id, body) {
  const current = await readProject(root, id)
  const spec = normalizeSpec(body?.spec) ?? current.spec
  const model = body?.model === null ? null : sanitizeModelRecord(body?.model) ?? current.model
  const messages = Array.isArray(body?.messages) ? sanitizeMessages(body.messages) : current.messages
  const code = typeof body?.code === 'string' ? clip(body.code, 60000) : current.code
  let title = typeof body?.title === 'string' && body.title.trim() ? clip(body.title.trim(), 120) : current.title
  if (!title || title === DEFAULT_PROJECT_TITLE) {
    if (spec?.title) title = clip(spec.title, 120)
    else {
      const first = messages.find((message) => message.role === 'user')
      if (first?.content) title = clip(first.content.replace(/\s+/g, ' ').trim(), 60)
    }
  }
  let stage = ['chat', 'ready', 'done', 'error'].includes(body?.stage) ? body.stage : current.stage
  if (stage === 'generating') stage = model ? 'done' : spec ? 'ready' : 'chat'
  if (stage === 'done' && !model) stage = 'chat'
  const activeTab = ['model', 'spec', 'code'].includes(body?.activeTab)
    ? body.activeTab
    : current.activeTab
  const next = await writeProject(root, {
    ...current,
    title: title || DEFAULT_PROJECT_TITLE,
    stage,
    messages,
    spec,
    model,
    code: model?.code || code,
    activeTab: model ? activeTab : activeTab === 'code' ? 'spec' : activeTab,
    generationError: typeof body?.generationError === 'string'
      ? clip(body.generationError, 6000)
      : current.generationError,
  })
  return next
}

async function ensureProjectWorkspace(ctx, root, record) {
  const registry = ctx.get('workspaceRegistry')
  if (!registry) return { ok: false, reason: '当前 Harness 没有工作区服务' }
  const paths = projectPaths(root, record.id)
  await mkdir(paths.dir, { recursive: true })
  const workspace = await registry.create(paths.dir, record.title)
  const next = await writeProject(root, { ...record, workspaceId: workspace.id })
  return {
    ok: true,
    project: next,
    workspaceId: workspace.id,
    path: workspace.path,
    title: workspace.title,
  }
}

function validateGeneratedCode(code) {
  if (!code || typeof code !== 'string') return '模型没有返回 Python 代码'
  if (code.length > 60_000) return '生成的代码过长'
  if (!/build123d/.test(code)) return '生成的代码没有使用 build123d'
  if (!/(?:^|\n)\s*part\s*=|as\s+part\b/.test(code)) {
    return '生成的代码没有把最终实体赋值给 part'
  }
  if (/\b(?:open|exec|eval|compile|__import__|input)\s*\(/.test(code)) {
    return '生成的代码包含不允许的动态执行或文件操作'
  }
  const imports = [...code.matchAll(/^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm)]
  for (const match of imports) {
    const name = match[1] ?? match[2] ?? ''
    if (!name.startsWith('build123d') && name !== 'math') {
      return `生成的代码引入了不允许的模块：${name}`
    }
  }
  if (/\b(?:export_stl|export_step|export_gltf|export_brep|write_text|write_bytes|subprocess|socket|requests)\b/.test(code)) {
    return '生成的代码包含导出、写文件或联网操作'
  }
  if (/__[a-zA-Z]+__/.test(code)) return '生成的代码包含不允许的反射访问'
  return undefined
}

async function generateRun(ctx, config, root, python, payload) {
  const spec = normalizeSpec(payload.spec)
  if (!spec) throw new HttpError(400, 'missing-spec', '缺少工程规格，无法建模')
  const history = Array.isArray(payload.history) ? payload.history : []
  const brief = clip(payload.brief ?? '', 4000)

  const llm = ctx.get('llm')
  if (!llm) throw new HttpError(503, 'model-unavailable', '当前 Harness 没有可用的 LLM 服务')
  const selection = safeModel(ctx.get('agentDefaultModel')?.currentSelection())
  if (!selection) throw new HttpError(503, 'model-unavailable', '没有找到默认模型，请先在 DSH 中选择模型')

  const projectId = payload.projectId ? normalizeProjectId(payload.projectId) : undefined
  const project = projectId ? await readProject(root, projectId) : await ensureDefaultProject(root)
  const paths = projectPaths(root, project.id)
  const id = newId()
  const runDir = path.join(paths.models, id)
  await mkdir(path.join(runDir, '.cache'), { recursive: true })
  const codePath = path.join(runDir, 'generated.py')

  let previousCode = ''
  let previousError = ''
  let lastRaw = ''
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const prompt = buildCodePrompt({ spec, brief, history, previousCode, previousError })
    let raw = ''
    try {
      raw = await callModel(ctx, {
        system: CODE_SYSTEM,
        prompt,
        maxTokens: 12000,
        timeoutMs: 180000,
        selection,
      })
    } catch (error) {
      previousError = error instanceof Error ? error.message : String(error)
      if (attempt === 2) {
        throw new HttpError(502, 'code-generation-failed', `AI 代码生成失败：${previousError}`)
      }
      continue
    }
    lastRaw = raw
    const code = extractCode(raw)
    const invalid = validateGeneratedCode(code)
    if (invalid) {
      previousError = invalid
      previousCode = code
      continue
    }

    await writeFile(codePath, `${code.trim()}\n`, 'utf8')
    const result = await runProcess(python, [path.join(HERE, 'runner.py'), codePath], {
      cwd: runDir,
      env: subprocessEnv(root, root, runDir, config),
      timeoutMs: config.timeoutMs ?? 180000,
    })
    const json = findLastJson(result.stdout)
    if (result.code === 0 && json?.ok) {
      const meta = json.meta ?? (await readMeta(runDir))
      const title = clip(spec.title ?? '3D 模型', 160)
      const summary = clip(spec.summary ?? '', 800)
      const createdAt = Date.now()
      const stlUrl = `${ROUTE}/files/${project.id}/${id}/model.stl`
      const stepUrl = `${ROUTE}/files/${project.id}/${id}/model.step`
      const codeUrl = `${ROUTE}/files/${project.id}/${id}/generated.py`
      const runRecord = {
        id,
        projectId: project.id,
        title,
        summary,
        createdAt,
        spec,
        code,
        meta,
      }
      await writeFile(path.join(runDir, 'run.json'), JSON.stringify(runRecord, null, 2), 'utf8')
      // Keep easy-to-find copies at the workspace root so the generated source
      // and exchange files are visible in DSH's workspace file browser.
      await copyFile(path.join(runDir, 'model.stl'), path.join(paths.dir, 'part.stl'))
      await copyFile(path.join(runDir, 'model.step'), path.join(paths.dir, 'part.step'))
      await copyFile(codePath, path.join(paths.dir, 'part.py'))
      await writeFile(path.join(paths.dir, 'part.json'), JSON.stringify(runRecord, null, 2), 'utf8')
      const model = { id, title, summary, spec, code, meta, stlUrl, stepUrl, codeUrl, createdAt }
      const projectTitle = project.title === DEFAULT_PROJECT_TITLE ? title : project.title
      const savedProject = await writeProject(root, {
        ...project,
        title: projectTitle,
        stage: 'done',
        spec,
        model,
        code,
        activeTab: 'model',
        generationError: '',
      })
      // Adding a workspace is an explicit user action; a successful build should
      // not create a new sidebar entry behind the user's back.
      const workspace = null
      return {
        ok: true,
        id,
        projectId: project.id,
        title,
        summary,
        spec,
        code,
        meta,
        attempts: attempt,
        stlUrl,
        stepUrl,
        codeUrl,
        workspace,
        workspacePath: savedProject.workspacePath,
      }
    }

    previousCode = code
    previousError = clip(
      json?.error ?? result.stderr ?? result.stdout ?? 'build123d 执行失败',
      6000,
    )
  }

  throw new HttpError(
    422,
    'model-build-failed',
    `build123d 连续两次未能生成有效模型。\n${previousError || clip(lastRaw, 3000)}`,
  )
}

function sessionDirectory(ctx, sessionId) {
  if (typeof sessionId !== 'string' || sessionId.length === 0) return undefined
  const session = ctx.get('sessions')?.get(sessionId)
  if (!session) return undefined
  return ctx.get('workingDirectory')?.get(session)
}

export function drawingUrls(sessionId) {
  const base = `${ROUTE}/session-files/${encodeURIComponent(sessionId)}`
  return {
    front: `${base}/drawing-front.svg`,
    top: `${base}/drawing-top.svg`,
    right: `${base}/drawing-right.svg`,
    sheet: `${base}/drawing.svg`,
  }
}

/**
 * Per-session modeling directory: one conversation owns one folder under
 * `<workspace>/model3d/<session-id>/`, so a new session never inherits a
 * previous session's part.py.
 */
export function sessionWorkDir(cwd, sessionId) {
  return path.join(cwd, 'model3d', sessionId)
}

function sessionModelDirectory(cwd, sessionId) {
  return path.join(sessionWorkDir(cwd, sessionId), '.model3d')
}

/**
 * Resolve the directory a session reads its model from, tolerating the older
 * shared-workspace layout where files lived directly in the workspace root.
 */
async function resolveSessionDir(cwd, sessionId) {
  const dir = sessionWorkDir(cwd, sessionId)
  for (const file of ['part.stl', 'part.py', 'part.spec.md']) {
    try {
      await access(path.join(dir, file))
      return { dir, legacy: false }
    } catch {
      // Keep checking this session's own folder first.
    }
  }
  try {
    await access(path.join(cwd, 'part.stl'))
    return { dir: cwd, legacy: true }
  } catch {
    return { dir, legacy: false }
  }
}

const SPEC_FILE_NAMES = ['part.spec.md', 'part.md', 'SPEC.md']

async function readSessionSpecText(cwd, modelDir) {
  const candidates = [...SPEC_FILE_NAMES.map((name) => path.join(cwd, name)), path.join(modelDir, 'spec.md')]
  for (const candidate of candidates) {
    try {
      const text = await readFile(candidate, 'utf8')
      const trimmed = text.trim()
      if (trimmed) return { text: clip(trimmed, 20000), file: candidate }
    } catch {
      // Try the next candidate.
    }
  }
  return undefined
}

/**
 * Compile a build123d script the agent wrote itself, export STL/STEP, and
 * publish the result to the Session's Spec/Model tabs.
 *
 * The agent owns the code: it writes `part.py` with its normal file tools, so
 * no second model call, no long tool argument, and no token budget shared with
 * the main answer. This function only runs and packages the geometry.
 */
export async function compileSessionModel(ctx, config, root, python, baseCwd, sessionId, scriptPath) {
  const dir = sessionWorkDir(baseCwd, sessionId)
  const modelDir = sessionModelDirectory(baseCwd, sessionId)
  await mkdir(dir, { recursive: true })
  const source = scriptPath ? path.resolve(dir, scriptPath) : path.join(dir, 'part.py')
  let code
  try {
    code = await readFile(source, 'utf8')
  } catch {
    // A part.py written at the workspace root by an older layout is adopted
    // into this session's own folder instead of being silently reused.
    if (!scriptPath) {
      try {
        const strayPath = path.join(baseCwd, 'part.py')
        const stray = await readFile(strayPath, 'utf8')
        await writeFile(source, stray, 'utf8')
        code = stray
        // Move, don't copy: the workspace root must not keep a part.py that a
        // later session could mistake for its own model.
        await rm(strayPath, { force: true }).catch(() => {})
      } catch {
        throw new HttpError(400, 'script-missing', '当前会话目录里没有 build123d 脚本，请先写 part.py')
      }
    } else {
      throw new HttpError(400, 'script-missing', '当前会话目录里没有 build123d 脚本，请先写 part.py')
    }
  }
  const invalid = validateGeneratedCode(code)
  if (invalid) throw new HttpError(422, 'invalid-model-script', invalid)

  const id = newId()
  const runDir = path.join(modelDir, 'runs', id)
  await mkdir(path.join(runDir, '.cache'), { recursive: true })
  const codePath = path.join(runDir, 'generated.py')
  await writeFile(codePath, `${code.trim()}\n`, 'utf8')

  const result = await runProcess(python, [path.join(HERE, 'runner.py'), codePath, dir], {
    cwd: runDir,
    env: subprocessEnv(root, root, runDir, config),
    timeoutMs: config.timeoutMs ?? 180000,
  })
  const json = findLastJson(result.stdout)
  if (result.code !== 0 || !json?.ok) {
    throw new HttpError(
      422,
      'model-build-failed',
      clip(json?.error ?? result.stderr ?? result.stdout ?? 'build123d 执行失败', 6000),
    )
  }

  const meta = json.meta ?? (await readMeta(runDir))
  const specText = await readSessionSpecText(dir, modelDir)
  const titleFromSpec = specText?.text
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, '').trim())
    .find((line) => line.length > 0)
  const title = clip(titleFromSpec ?? '3D 模型', 160)
  const createdAt = Date.now()
  const stlUrl = `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.stl`
  const stepUrl = `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.step`
  const codeUrl = `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.py`
  await mkdir(modelDir, { recursive: true })
  const views = []
  for (const file of DRAWING_FILES) {
    try {
      await copyFile(path.join(runDir, file), path.join(modelDir, file))
      views.push(file === 'drawing.svg' ? 'sheet' : file.replace('drawing-', '').replace('.svg', ''))
    } catch {
      // This view did not render; skip it.
    }
  }

  const record = {
    id,
    title,
    specText: specText?.text ?? '',
    code,
    meta,
    stlUrl,
    stepUrl,
    codeUrl,
    views,
    createdAt,
  }
  await copyFile(path.join(runDir, 'model.stl'), path.join(modelDir, 'part.stl'))
  await copyFile(path.join(runDir, 'model.step'), path.join(modelDir, 'part.step'))
  await writeFile(path.join(modelDir, 'part.py'), `${code.trim()}\n`, 'utf8')
  await writeFile(path.join(modelDir, 'part.json'), JSON.stringify(record, null, 2), 'utf8')
  await writeFile(path.join(modelDir, 'state.json'), JSON.stringify(record, null, 2), 'utf8')
  if (specText) await writeFile(path.join(modelDir, 'spec.md'), specText.text, 'utf8')

  await copyFile(path.join(runDir, 'model.stl'), path.join(dir, 'part.stl'))
  await copyFile(path.join(runDir, 'model.step'), path.join(dir, 'part.step'))
  await writeFile(path.join(dir, 'part.json'), JSON.stringify(record, null, 2), 'utf8')

  return {
    ok: true,
    sessionId,
    id,
    title,
    specText: record.specText,
    views,
    code,
    meta,
    stlUrl,
    stepUrl,
    codeUrl,
    attempts: 1,
  }
}

export async function buildSessionModel(ctx, config, root, python, cwd, sessionId, spec) {
  if (!spec) throw new HttpError(400, 'missing-spec', '缺少工程规格，无法建模')
  const llm = ctx.get('llm')
  if (!llm) throw new HttpError(503, 'model-unavailable', '当前 Harness 没有可用的 LLM 服务')
  const selection = safeModel(ctx.get('agentDefaultModel')?.currentSelection())
  if (!selection) throw new HttpError(503, 'model-unavailable', '没有找到默认模型，请先在 DSH 中选择模型')

  const id = newId()
  const modelDir = sessionModelDirectory(cwd, sessionId)
  const runDir = path.join(modelDir, 'runs', id)
  await mkdir(path.join(runDir, '.cache'), { recursive: true })
  const codePath = path.join(runDir, 'generated.py')
  const history = []
  const brief = clip(spec.summary ?? spec.title ?? '', 4000)
  let previousCode = ''
  let previousError = ''
  let lastRaw = ''

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const prompt = buildCodePrompt({ spec, brief, history, previousCode, previousError })
    let raw = ''
    try {
      raw = await callModel(ctx, {
        system: CODE_SYSTEM,
        prompt,
        maxTokens: 12000,
        timeoutMs: 180000,
        selection,
      })
    } catch (error) {
      previousError = error instanceof Error ? error.message : String(error)
      if (attempt === 2) {
        throw new HttpError(502, 'code-generation-failed', `AI 代码生成失败：${previousError}`)
      }
      continue
    }
    lastRaw = raw
    const code = extractCode(raw)
    const invalid = validateGeneratedCode(code)
    if (invalid) {
      previousError = invalid
      previousCode = code
      continue
    }

    await writeFile(codePath, `${code.trim()}\n`, 'utf8')
    const result = await runProcess(python, [path.join(HERE, 'runner.py'), codePath], {
      cwd: runDir,
      env: subprocessEnv(root, root, runDir, config),
      timeoutMs: config.timeoutMs ?? 180000,
    })
    const json = findLastJson(result.stdout)
    if (result.code === 0 && json?.ok) {
      const meta = json.meta ?? (await readMeta(runDir))
      const title = clip(spec.title ?? '3D 模型', 160)
      const summary = clip(spec.summary ?? '', 800)
      const createdAt = Date.now()
      const stlUrl = `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.stl`
      const stepUrl = `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.step`
      const codeUrl = `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.py`
      const record = {
        id,
        title,
        summary,
        spec,
        code,
        meta,
        stlUrl,
        stepUrl,
        codeUrl,
        createdAt,
      }
      await mkdir(modelDir, { recursive: true })
      await copyFile(path.join(runDir, 'model.stl'), path.join(modelDir, 'part.stl'))
      await copyFile(path.join(runDir, 'model.step'), path.join(modelDir, 'part.step'))
      await copyFile(codePath, path.join(modelDir, 'part.py'))
      await writeFile(path.join(modelDir, 'part.json'), JSON.stringify(record, null, 2), 'utf8')
      await writeFile(path.join(modelDir, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8')
      await writeFile(path.join(modelDir, 'state.json'), JSON.stringify(record, null, 2), 'utf8')
      // Keep the latest visible copy at the workspace root for the file browser.
      await copyFile(path.join(runDir, 'model.stl'), path.join(cwd, 'part.stl'))
      await copyFile(path.join(runDir, 'model.step'), path.join(cwd, 'part.step'))
      await copyFile(codePath, path.join(cwd, 'part.py'))
      await writeFile(path.join(cwd, 'part.json'), JSON.stringify(record, null, 2), 'utf8')
      return {
        ok: true,
        sessionId,
        id,
        title,
        summary,
        spec,
        code,
        meta,
        stlUrl,
        stepUrl,
        codeUrl,
        attempts: attempt,
      }
    }

    previousCode = code
    previousError = clip(
      json?.error ?? result.stderr ?? result.stdout ?? 'build123d 执行失败',
      6000,
    )
  }

  throw new HttpError(
    422,
    'model-build-failed',
    `build123d 连续两次未能生成有效模型。\n${previousError || clip(lastRaw, 3000)}`,
  )
}

async function callModel(ctx, { system, prompt, maxTokens, timeoutMs, selection }) {
  const llm = ctx.get('llm')
  if (!llm) throw new Error('LLM service unavailable')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let text = ''
  let reasoning = ''
  let failure
  let finishKind
  try {
    const stream = llm.stream({
      provider: selection.provider,
      model: selection.model,
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      system,
      maxTokens,
      temperature: 0.2,
      signal: controller.signal,
    })
    for await (const chunk of stream) {
      if (chunk.type === 'text-delta') {
        text += chunk.text
      } else if (chunk.type === 'reasoning-delta') {
        reasoning += chunk.text
      } else if (chunk.type === 'finish') {
        finishKind = chunk.reason?.kind
        if (chunk.reason?.kind === 'error' || chunk.reason?.kind === 'aborted') {
          failure = chunk.reason.failure
        }
      }
    }
  } finally {
    clearTimeout(timer)
  }
  if (failure) {
    throw new Error(`${failure.code ?? 'llm-error'}: ${failure.message ?? '模型调用失败'}`)
  }
  if (!text.trim()) {
    // A reasoning model can spend the whole budget on hidden reasoning and
    // never emit visible text. Keep the reasoning so the caller can salvage
    // any code fence it contains, and report a retryable failure otherwise.
    const error = new Error(
      finishKind === 'max-tokens'
        ? `模型在输出可见文本前耗尽了 token 预算（maxTokens=${maxTokens}，finish: max-tokens）`
        : `模型返回了空响应${finishKind ? `（finish: ${finishKind}）` : ''}`,
    )
    error.reasoning = reasoning
    error.finishKind = finishKind
    throw error
  }
  return text
}

export function apply(ctx, config = {}) {
  const root = resolveWorkRoot(ctx, config)
  const python = resolvePython(ctx, config, root)
  let environment

  async function inspectEnvironment() {
    if (environment) return environment
    environment = (async () => {
      const workDirExists = await dirExists(root)
      if (!workDirExists) await mkdir(root, { recursive: true })
      const pythonExists = python.includes(path.sep) ? existsSync(python) : true
      if (!pythonExists) {
        return {
          ok: false,
          python,
          message: `找不到 Python 解释器：${python}`,
          hint: '在插件配置中设置 pythonPath，并安装 build123d。',
        }
      }
      const check = await runProcess(
        python,
        ['-c', 'import sys, json, build123d; print(json.dumps({"python": sys.version.split()[0], "build123d": getattr(build123d, "__version__", "unknown")}))'],
        {
          cwd: root,
          env: subprocessEnv(root, root, root, config),
          timeoutMs: 30000,
        },
      )
      const info = findLastJson(check.stdout)
      if (check.code !== 0 || !info) {
        return {
          ok: false,
          python,
          message: 'Python 环境无法导入 build123d。',
          detail: clip(check.stderr || check.stdout, 3000),
          hint: '安装 build123d 并确保 libGL 可用；可通过 pythonPath 与 ldLibraryPath 配置。',
        }
      }
      return {
        ok: true,
        python,
        pythonVersion: info.python,
        build123d: info.build123d,
        workDir: root,
      }
    })()
    return environment
  }

  async function handleStatus(req, res) {
    const env = await inspectEnvironment()
    const selection = safeModel(ctx.get('agentDefaultModel')?.currentSelection())
    sendJson(res, 200, {
      ...env,
      model: selection ?? null,
      workDir: root,
      projectsDir: path.join(root, 'projects'),
      recent: (await listProjects(root)).slice(0, 8).map(projectSummary),
    })
  }

  async function handleModels(req, res) {
    const projects = await listProjects(root)
    const runs = projects
      .filter((project) => project.model)
      .map((project) => ({
        ...project.model,
        projectId: project.id,
        projectTitle: project.title,
      }))
    sendJson(res, 200, { runs, projects: projects.slice(0, 24).map(projectSummary) })
  }

  async function handlePresets(req, res) {
    if (req.method !== 'GET') throw new HttpError(405, 'method-not-allowed', '仅支持 GET')
    const service = ctx.get('agentPresets')
    if (!service) throw new HttpError(503, 'preset-unavailable', '当前 Harness 没有 Agent 预设服务')
    sendJson(res, 200, { presets: await service.list() })
  }

  async function handleProjects(req, res) {
    if (req.method === 'GET') {
      const projects = await listProjects(root)
      sendJson(res, 200, { projects: projects.map((project) => projectView(project, root)) })
      return
    }
    if (req.method !== 'POST') throw new HttpError(405, 'method-not-allowed', '仅支持 GET 或 POST')
    const payload = await readJson(req)
    const record = await createProject(root, payload.title)
    sendJson(res, 201, { project: projectView(record, root, true) })
  }

  async function handleProject(req, res, id, action) {
    const record = await readProject(root, id)
    if (action === 'workspace') {
      if (req.method !== 'POST') throw new HttpError(405, 'method-not-allowed', '仅支持 POST')
      let registration
      try {
        registration = await ensureProjectWorkspace(ctx, root, record)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new HttpError(503, 'workspace-failed', `加入工作区失败：${message}`)
      }
      if (!registration.ok) {
        throw new HttpError(503, 'workspace-unavailable', registration.reason)
      }
      sendJson(res, 200, {
        ok: true,
        workspaceId: registration.workspaceId,
        path: registration.path,
        title: registration.title,
        project: projectView(registration.project, root, true),
      })
      return
    }
    if (action !== undefined) throw new HttpError(404, 'not-found', '未知项目管理操作')
    if (req.method === 'GET') {
      sendJson(res, 200, { project: projectView(record, root, true) })
      return
    }
    if (req.method === 'PUT') {
      const payload = await readJson(req)
      const saved = await saveProjectState(root, id, payload)
      sendJson(res, 200, { project: projectView(saved, root, true) })
      return
    }
    if (req.method === 'PATCH') {
      const payload = await readJson(req)
      const title = typeof payload.title === 'string' ? clip(payload.title.trim(), 120) : ''
      if (!title) throw new HttpError(400, 'invalid-title', '会话名称不能为空')
      const saved = await writeProject(root, { ...record, title })
      if (saved.workspaceId) {
        try {
          const controller = ctx.get('workspaceController')
          if (controller && typeof controller.rename === 'function') {
            await controller.rename({ workspaceId: saved.workspaceId, title })
          }
        } catch (error) {
          log(ctx, 'warn', error)
        }
      }
      sendJson(res, 200, { project: projectView(saved, root, true) })
      return
    }
    if (req.method === 'DELETE') {
      const registry = ctx.get('workspaceRegistry')
      if (record.workspaceId && registry) {
        try {
          await registry.delete(record.workspaceId)
        } catch (error) {
          log(ctx, 'warn', error)
        }
      }
      await rm(projectPaths(root, id).dir, { recursive: true, force: true })
      sendJson(res, 200, { ok: true, id })
      return
    }
    throw new HttpError(405, 'method-not-allowed', '仅支持 GET、PUT 或 DELETE')
  }

  async function handleChat(req, res) {
    if (req.method !== 'POST') throw new HttpError(405, 'method-not-allowed', '仅支持 POST')
    const payload = await readJson(req)
    const history = Array.isArray(payload.history) ? payload.history.slice(-30) : []
    const spec = normalizeSpec(payload.spec)
    const brief = clip(payload.brief ?? '', 4000)
    const forceReady = payload.forceReady === true
    if (history.length === 0 && !brief.trim()) {
      throw new HttpError(400, 'empty-request', '请先描述你要建模的零件')
    }

    const llm = ctx.get('llm')
    if (!llm) throw new HttpError(503, 'model-unavailable', '当前 Harness 没有可用的 LLM 服务')
    const selection = safeModel(ctx.get('agentDefaultModel')?.currentSelection())
    if (!selection) throw new HttpError(503, 'model-unavailable', '没有找到默认模型，请先在 DSH 中选择模型')

    const prompt = buildClarifyPrompt({ history, spec, brief, forceReady })
    let raw = ''
    let lastError
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        raw = await callModel(ctx, {
          system: CLARIFY_SYSTEM,
          prompt,
          maxTokens: 8000,
          timeoutMs: 150000,
          selection,
        })
        if (raw.trim()) break
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error)
      }
    }
    if (!raw.trim()) {
      const message = lastError ?? '模型没有返回可用内容'
      throw new HttpError(502, 'chat-failed', `AI 需求分析失败：${message}`)
    }
    const answer = normalizeClarify(raw)
    sendJson(res, 200, { ...answer, model: selection })
  }

  async function handleGenerate(req, res) {
    if (req.method !== 'POST') throw new HttpError(405, 'method-not-allowed', '仅支持 POST')
    const payload = await readJson(req)
    const env = await inspectEnvironment()
    if (!env.ok) {
      throw new HttpError(503, 'python-unavailable', env.message, undefined)
    }
    const value = await generateRun(ctx, config, root, python, payload)
    sendJson(res, 201, value)
  }

  async function handleSpecDrawing(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      throw new HttpError(405, 'method-not-allowed', '仅支持 GET')
    }
    const url = new URL(req.url ?? '/', 'http://x')
    const sessionId = url.searchParams.get('sessionId') ?? ''
    const baseCwd = sessionDirectory(ctx, sessionId)
    if (!baseCwd) throw new HttpError(404, 'session-unavailable', '当前会话目录不可用')
    const dir = sessionWorkDir(baseCwd, sessionId)
    const target = path.join(dir, 'spec-drawing.svg')
    try {
      await access(target)
    } catch {
      const rendered = await runProcess(
        python,
        [path.join(HERE, 'specdraw.py'), dir, target],
        { cwd: dir, env: subprocessEnv(root, root, dir, config), timeoutMs: 30000 },
      )
      if (rendered.code !== 0) {
        throw new HttpError(404, 'no-spec', '还没有可绘制的工程规格')
      }
    }
    const info = await stat(target)
    const headers = {
      'content-type': 'image/svg+xml',
      'content-length': info.size,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    }
    res.writeHead(200, headers)
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    const { createReadStream } = await import('node:fs')
    createReadStream(target).pipe(res)
  }

  async function handleSessionState(req, res) {
    if (req.method !== 'GET') throw new HttpError(405, 'method-not-allowed', '仅支持 GET')
    const url = new URL(req.url ?? '/', 'http://x')
    const sessionId = url.searchParams.get('sessionId') ?? ''
    const baseCwd = sessionDirectory(ctx, sessionId)
    if (!baseCwd) throw new HttpError(404, 'session-unavailable', '当前会话目录不可用')
    const resolved = await resolveSessionDir(baseCwd, sessionId)
    const cwd = resolved.dir
    const modelDir = resolved.legacy ? path.join(cwd, '.model3d') : sessionModelDirectory(baseCwd, sessionId)
    let spec = null
    let state = null
    let specText = null
    try {
      spec = normalizeSpec(JSON.parse(await readFile(path.join(modelDir, 'spec.json'), 'utf8')))
    } catch {
      // No saved specification yet.
    }
    try {
      state = JSON.parse(await readFile(path.join(modelDir, 'state.json'), 'utf8'))
    } catch {
      // No generated model yet.
    }
    if (state && typeof state === 'object' && typeof state.specText === 'string' && state.specText.trim()) {
      specText = state.specText
    }
    if (!specText) {
      const found = await readSessionSpecText(cwd, modelDir)
      if (found) specText = found.text
    }
    let model = null
    if (state && typeof state === 'object') {
      try {
        await access(path.join(modelDir, 'part.stl'))
        model = {
          ...state,
          spec: state.spec ?? spec,
          stlUrl: `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.stl`,
          stepUrl: `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.step`,
          codeUrl: `${ROUTE}/session-files/${encodeURIComponent(sessionId)}/part.py`,
        }
      } catch {
        model = null
      }
    }
    sendJson(res, 200, {
      ok: true,
      sessionId,
      path: cwd,
      sessionDir: sessionWorkDir(baseCwd, sessionId),
      legacyLayout: resolved.legacy,
      spec: spec ?? state?.spec ?? null,
      specText,
      drawings: model ? drawingUrls(sessionId) : null,
      specDrawingUrl: specText
        ? `${ROUTE}/spec-drawing?sessionId=${encodeURIComponent(sessionId)}`
        : null,
      model,
      hasSpec: Boolean(spec ?? state?.spec),
      hasModel: Boolean(model),
    })
  }

  async function handleSessionFiles(req, res, rest) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      throw new HttpError(405, 'method-not-allowed', '仅支持 GET')
    }
    const [rawSession, rawFile] = rest.split('/').filter(Boolean).map((part) => decodeURIComponent(part))
    if (!rawSession || !rawFile || !SESSION_FILES[rawFile]) {
      throw new HttpError(404, 'not-found', '文件不存在')
    }
    const baseCwd = sessionDirectory(ctx, rawSession)
    if (!baseCwd) throw new HttpError(404, 'session-unavailable', '当前会话目录不可用')
    const resolved = await resolveSessionDir(baseCwd, rawSession)
    const modelDir = resolved.legacy ? path.join(resolved.dir, '.model3d') : sessionModelDirectory(baseCwd, rawSession)
    const inModelDir = path.join(modelDir, rawFile)
    let target = inModelDir
    try {
      await access(inModelDir)
    } catch {
      target = path.join(resolved.dir, rawFile)
    }
    let info
    try {
      info = await stat(target)
    } catch {
      throw new HttpError(404, 'not-found', '文件不存在')
    }
    if (!info.isFile()) throw new HttpError(404, 'not-found', '文件不存在')
    const url = new URL(req.url ?? '/', 'http://x')
    const download = url.searchParams.get('download') === '1'
    const headers = {
      'content-type': SESSION_FILES[rawFile],
      'content-length': info.size,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': `${download ? 'attachment' : 'inline'}; filename="${rawFile}"`,
    }
    res.writeHead(200, headers)
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    const { createReadStream } = await import('node:fs')
    createReadStream(target).pipe(res)
  }

  async function handleFiles(req, res, rest) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      throw new HttpError(405, 'method-not-allowed', '仅支持 GET')
    }
    const parts = rest.split('/').filter(Boolean).map((part) => decodeURIComponent(part))
    let target
    let rawFile
    if (parts.length === 3) {
      const [projectId, runId, file] = parts
      if (!PROJECT_ID.test(projectId) || !RUN_ID.test(runId) || !SERVED_FILES.has(file)) {
        throw new HttpError(404, 'not-found', '文件不存在')
      }
      target = path.join(root, 'projects', projectId, 'models', runId, file)
      rawFile = file
    } else {
      const [runId, file] = parts
      if (!runId || !file || !RUN_ID.test(runId) || !SERVED_FILES.has(file)) {
        throw new HttpError(404, 'not-found', '文件不存在')
      }
      target = path.join(root, 'runs', runId, file)
      rawFile = file
    }
    let info
    try {
      info = await stat(target)
    } catch {
      throw new HttpError(404, 'not-found', '文件不存在')
    }
    if (!info.isFile()) throw new HttpError(404, 'not-found', '文件不存在')
    const url = new URL(req.url ?? '/', 'http://x')
    const download = url.searchParams.get('download') === '1'
    const headers = {
      'content-type': MIME[rawFile],
      'content-length': info.size,
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'content-disposition': `${download ? 'attachment' : 'inline'}; filename="${rawFile}"`,
    }
    res.writeHead(200, headers)
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    const { createReadStream } = await import('node:fs')
    createReadStream(target).pipe(res)
  }

  async function handle(req, res) {
    try {
      const url = new URL(req.url ?? '/', 'http://x')
      if (!url.pathname.startsWith(ROUTE)) {
        throw new HttpError(404, 'not-found', '未知接口')
      }
      const rest = url.pathname.slice(ROUTE.length).replace(/^\/+/, '')
      if (rest === '' || rest === 'status') return await handleStatus(req, res)
      if (rest === 'models') return await handleModels(req, res)
      if (rest === 'projects') return await handleProjects(req, res)
      if (rest === 'presets') return await handlePresets(req, res)
      if (rest.startsWith('projects/')) {
        const parts = rest.slice('projects/'.length).split('/').filter(Boolean)
        const projectId = normalizeProjectId(parts[0])
        return await handleProject(req, res, projectId, parts[1])
      }
      if (rest === 'chat') return await handleChat(req, res)
      if (rest === 'generate') return await handleGenerate(req, res)
      if (rest === 'session-state') return await handleSessionState(req, res)
      if (rest === 'spec-drawing') return await handleSpecDrawing(req, res)
      if (rest.startsWith('session-files/')) return await handleSessionFiles(req, res, rest.slice('session-files/'.length))
      if (rest.startsWith('files/')) return await handleFiles(req, res, rest.slice(6))
      throw new HttpError(404, 'not-found', '未知接口')
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      const code = error instanceof HttpError ? error.code : 'internal-error'
      const message = error instanceof Error ? error.message : String(error)
      if (status >= 500) log(ctx, 'warn', error)
      if (!res.headersSent) {
        sendJson(res, status, { ok: false, code, error: message })
      } else {
        res.destroy()
      }
    }
  }

  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: ROUTE,
        handler: handle,
      }),
    'model3d-studio: HTTP API',
  )

  void inspectEnvironment()
}
