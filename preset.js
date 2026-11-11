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
  compileSessionModel,
  resolvePython,
  resolveWorkRoot,
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
