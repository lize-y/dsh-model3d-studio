/**
 * Agent-side half of the 3D modeling preset.
 *
 * This plugin is mounted only for Sessions created with the `model3d` agent
 * preset. It contributes the two modeling tools and the workflow instructions,
 * while the profile-level plugin serves the HTTP API and Client tabs.
 */
import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import {
  MODEL3D_SYSTEM,
  buildSessionModel,
  normalizeSpecArgs,
  resolvePython,
  resolveWorkRoot,
  sessionModelDirectory,
} from './index.js'

export const inject = ['tools', 'systemPrompt']

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
        name: 'model3d_spec',
        description:
          'Save the engineering specification for the part to model. Call it once requirements are clear and before model3d_build. All dimensions are millimetres. Use the flat fields: keep every string short (one line per feature) so the call stays compact.',
        parameters: {
          title: {
            type: 'string',
            required: true,
            description: 'Part name, at most 60 characters.',
          },
          summary: {
            type: 'string',
            description: 'One or two sentences on function and overall structure; at most 200 characters.',
          },
          units: {
            type: 'string',
            description: 'Unit system, normally mm.',
          },
          overall: {
            type: 'string',
            description: 'Envelope size as a compact string such as "40 × 40 × 20" in millimetres.',
          },
          features: {
            type: 'array',
            description:
              'One string per geometric feature, format "名称：说明（尺寸、位置）". At most 8 entries, each at most 120 characters. Do not nest objects.',
            items: { type: 'string' },
          },
          material: {
            type: 'string',
            description: 'Material and its key property; at most 80 characters.',
          },
          process: {
            type: 'string',
            description: 'Manufacturing process; at most 120 characters.',
          },
          tolerances: {
            type: 'string',
            description: 'General and critical tolerances; at most 120 characters.',
          },
          surface: {
            type: 'string',
            description: 'Surface requirement; at most 80 characters.',
          },
          assumptions: {
            type: 'array',
            description: 'Engineering assumptions or defaults taken; at most 6 short entries.',
            items: { type: 'string' },
          },
          drawingNotes: {
            type: 'array',
            description: 'Drawing notes for the modeler; at most 6 short entries.',
            items: { type: 'string' },
          },
        },
        output: {
          schema: {
            type: 'object',
            additionalProperties: true,
            properties: {
              ok: { type: 'boolean' },
              title: { type: 'string' },
              summary: { type: 'string' },
              path: { type: 'string' },
            },
            required: ['ok', 'title'],
          },
          render(_args, value) {
            return [
              {
                type: 'text',
                text: `Engineering specification saved: ${value.title}. Next call model3d_build to generate the model.`,
              },
            ]
          },
        },
        timeoutMs: 60000,
        async execute(args, exec) {
          const cwd = requiredCwd(exec)
          const spec = normalizeSpecArgs(args)
          if (!spec) throw new Error('工程规格缺少 title，无法保存')
          const modelDir = sessionModelDirectory(cwd, exec.agent.id)
          await mkdir(modelDir, { recursive: true })
          await writeFile(path.join(modelDir, 'spec.json'), JSON.stringify(spec, null, 2), 'utf8')
          return {
            ok: true,
            title: spec.title || '3D 模型',
            summary: spec.summary || '',
            path: path.join(modelDir, 'spec.json'),
          }
        },
      }),
    'model3d-preset: specification tool',
  )

  ctx.effect(
    () =>
      ctx.tools.register({
        name: 'model3d_build',
        description:
          'Generate and execute a build123d model from the engineering specification saved by model3d_spec. Writes part.py, part.stl, part.step and part.json into the current workspace root, and exposes the result in the conversation Spec/Model tabs. Call only after model3d_spec.',
        parameters: {
          type: 'object',
          additionalProperties: false,
          properties: {},
        },
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
        async execute(_args, exec) {
          const cwd = requiredCwd(exec)
          let raw
          try {
            raw = JSON.parse(
              await readFile(path.join(sessionModelDirectory(cwd, exec.agent.id), 'spec.json'), 'utf8'),
            )
          } catch {
            throw new Error('请先调用 model3d_spec 保存工程规格，再调用 model3d_build')
          }
          const spec = normalizeSpecArgs({ spec: raw })
          if (!spec) throw new Error('已保存的工程规格无效，请重新调用 model3d_spec')
          return await buildSessionModel(ctx, config, root, python, cwd, exec.agent.id, spec)
        },
      }),
    'model3d-preset: build tool',
  )

  ctx.effect(
    () =>
      ctx.systemPrompt.section({
        name: 'model3d-workflow',
        order: 850,
        text: MODEL3D_SYSTEM,
      }),
    'model3d-preset: modeling instructions',
  )
}
