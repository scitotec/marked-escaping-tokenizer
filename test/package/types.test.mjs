import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { expect } from 'chai'
import { install, pack, run } from './helpers.mjs'

// Type-checks projects that use the packed package. Mainly guards against EscapingTokenizer not being assignable
// to marked's `tokenizer` option, which happens when the package's types see a different copy of marked's types.
const code = `
import { marked, Marked, type MarkedOptions } from 'marked'
import { EscapingTokenizer } from 'marked-escaping-tokenizer'

const tokenizer = new EscapingTokenizer()
tokenizer.escaper = (s: string): string => s.replace(/</g, '&lt;')
const options: MarkedOptions = { tokenizer }
export const a = marked.parse('<b>x</b>', options)
export const b = new Marked({ tokenizer }).parse('<b>x</b>')
`

const typescriptVersions = [5, 6, 7]
const markedVersions = [15, 18] // marked 15 still ships CommonJS, 16 and later are ESM only

// project: package.json "type" and compiler options
const projects = {
  'nodenext (ESM)': ['module', { module: 'nodenext', moduleResolution: 'nodenext' }],
  'nodenext (CommonJS)': ['commonjs', { module: 'nodenext', moduleResolution: 'nodenext' }],
  'node16 (ESM)': ['module', { module: 'node16', moduleResolution: 'node16' }],
  'node16 (CommonJS)': ['commonjs', { module: 'node16', moduleResolution: 'node16' }],
  'bundler': ['module', { module: 'esnext', moduleResolution: 'bundler', verbatimModuleSyntax: true }],
  'node10 (CommonJS)': ['commonjs', { module: 'commonjs', moduleResolution: 'node10' }],
}

// Combinations that fail no matter what this package does
function unsupported(project, typescript, markedVersion) {
  // node16 can't require() ESM, so the project's own import of marked 16+ fails
  if (project === 'node16 (CommonJS)' && markedVersion >= 16) return true
  // TypeScript 7 removed node10
  return project === 'node10 (CommonJS)' && typescript >= 7
}

describe('types', function () {
  this.timeout(300_000)
  let packed, tsc

  before(() => {
    packed = pack()
    const dir = install(path.join(packed.dir, 'typescript'),
      typescriptVersions.map((version) => `typescript-${version}@npm:typescript@${version}`))
    tsc = (version) => path.join(dir, 'node_modules', `typescript-${version}`, 'bin', 'tsc')
  })
  after(() => packed && rmSync(packed.dir, { recursive: true, force: true }))

  for (const markedVersion of markedVersions) {
    describe(`with marked@${markedVersion}`, () => {
      const dirs = {}

      before(() => {
        const dir = install(path.join(packed.dir, `marked-${markedVersion}`), [packed.tarball, `marked@${markedVersion}`])
        for (const [name, [type, compilerOptions]] of Object.entries(projects)) {
          dirs[name] = path.join(dir, name.replace(/\W+/g, '-'))
          mkdirSync(dirs[name])
          writeFileSync(path.join(dirs[name], 'package.json'), JSON.stringify({ type }))
          writeFileSync(path.join(dirs[name], 'tsconfig.json'), JSON.stringify({
            compilerOptions: {
              ...compilerOptions,
              target: 'es2022', lib: ['es2022'], types: [], strict: true, noEmit: true,
              skipLibCheck: false, // check the package's .d.ts files too
            },
            files: ['index.ts'],
          }))
          writeFileSync(path.join(dirs[name], 'index.ts'), code)
        }
      })

      for (const typescript of typescriptVersions) {
        for (const name of Object.keys(projects)) {
          if (unsupported(name, typescript, markedVersion)) continue

          it(`TypeScript ${typescript}, ${name}`, () => {
            // node10 is deprecated in TypeScript 6
            const flags = typescript === 6 && name.startsWith('node10') ? ['--ignoreDeprecations', '6.0'] : []
            const { status, output } = run(process.execPath, [tsc(typescript), '-p', '.', ...flags], dirs[name])
            expect(status, output).to.equal(0)
          })
        }
      }
    })
  }
})
