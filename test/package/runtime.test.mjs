import { rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { expect } from 'chai'
import { install, pack, run } from './helpers.mjs'

// Loads the packed package from CommonJS and from ESM. Besides escaping, it has to share marked with the
// project: with a second copy of marked, EscapingTokenizer would extend a different Tokenizer.
const imports = {
  'require()': ['project.cjs', `
const { marked, Tokenizer } = require('marked')
const { EscapingTokenizer } = require('marked-escaping-tokenizer')`],
  'import': ['project.mjs', `
import { marked, Tokenizer } from 'marked'
import { EscapingTokenizer } from 'marked-escaping-tokenizer'`],
}

const usage = `
const tokenizer = new EscapingTokenizer()
console.log(JSON.stringify({
  sameMarked: tokenizer instanceof Tokenizer,
  html: marked.parse('<b>x</b> <kbd>**b**<img src=x onerror=alert(1)//', { tokenizer }),
}))
`

describe(`runtime with Node.js ${process.versions.node}`, function () {
  this.timeout(180_000)
  let packed

  before(() => { packed = pack() })
  after(() => packed && rmSync(packed.dir, { recursive: true, force: true }))

  for (const markedVersion of [4, 15, 18]) {
    describe(`and marked@${markedVersion}`, () => {
      let dir

      before(() => {
        dir = install(path.join(packed.dir, `marked-${markedVersion}`), [packed.tarball, `marked@${markedVersion}`])
      })

      for (const [name, [file, code]] of Object.entries(imports)) {
        it(`works with ${name}`, function () {
          // marked 16+ is ESM only, and require() of ESM needs Node.js 20.19+ or 22.12+
          if (name === 'require()' && markedVersion >= 16 && !process.features.require_module) this.skip()

          writeFileSync(path.join(dir, file), code + usage)
          const { status, stdout, output } = run(process.execPath, [file], dir)
          expect(status, output).to.equal(0)
          expect(JSON.parse(stdout)).to.deep.equal({
            sameMarked: true,
            html: '<p>&lt;b&gt;x&lt;/b&gt; &lt;kbd&gt;<strong>b</strong>&lt;img src=x onerror=alert(1)//</p>\n',
          })
        })
      }
    })
  }
})
