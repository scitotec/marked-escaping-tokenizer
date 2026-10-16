import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))

export function run(command, args, cwd) {
  const { status, stdout, stderr, error } = spawnSync(command, args, { cwd, encoding: 'utf8' })
  if (error) throw error
  return { status, stdout, output: stdout + stderr }
}

function npm(args, cwd) {
  const { status, stdout, output } = run('npm', args, cwd)
  if (status !== 0) throw new Error(`npm ${args.join(' ')} failed:\n${output}`)
  return stdout
}

// Packs the package the way `npm publish` would (build it first) into a new temporary directory
export function pack() {
  const dir = mkdtempSync(path.join(tmpdir(), 'marked-escaping-tokenizer-'))
  const [{ filename }] = JSON.parse(npm(['pack', '--json', '--pack-destination', dir], root))
  return { dir, tarball: path.join(dir, filename) }
}

// Creates a project in `dir` with the given packages installed
export function install(dir, packages) {
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'package.json'), '{ "private": true }\n')
  npm(['install', '--no-audit', '--no-fund', '--no-package-lock', ...packages], dir)
  return dir
}
