/**
 * Agent-side half of the 3D modeling preset.
 *
 * This plugin is mounted only for Sessions created with the `model3d` agent
 * preset. It contributes the build tool, the workflow instructions, and this
 * Session's own modeling folder, while the profile-level plugin serves the
 * HTTP API and Client tabs.
 */
import { readFileSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
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

const HERE = path.dirname(fileURLToPath(import.meta.url))

/** Load the modeling guide shipped beside this plugin. */
function skillBody() {
  try {
    return readFileSync(path.join(HERE, 'skills', 'model3d-modeling', 'SKILL.md'), 'utf8')
  } catch {
    return '# 3D 建模\n\n技能内容缺失；按 build123d 常规写法建模，最终实体赋给 part。'
  }
}

/** Whether this session already locked an engineering specification. */
async function hasSpecFile(dir) {
  for (const name of ['part.spec.md', 'part.md', 'SPEC.md', path.join('.model3d', 'spec.md')]) {
    try {
      const text = await readFile(path.join(dir, name), 'utf8')
      if (text.trim().length >= 20) return true
    } catch {
      continue
    }
  }
  return false
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
          'Compile and run the build123d script you already wrote as part.py in this session folder, validate the geometry, export STL/STEP, and refresh the Model tab. Requires part.spec.md to exist first. This tool takes no code: write the files with the normal file tools, then call this in the same turn as the script write.',
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
          const dir = sessionWorkDir(cwd, exec.agent.id)
          // Spec first: the build refuses to run until the engineering
          // specification exists, so a session cannot jump straight to code.
          const specFound = await hasSpecFile(dir)
          if (!specFound) {
            throw new Error(
              '规格还没有锁定：请先把工程规格写成 part.spec.md，再调用 model3d_build。',
            )
          }
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
      content: skillBody(),
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
