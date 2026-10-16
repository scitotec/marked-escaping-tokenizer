# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Dependencies are not checked in — run `npm install` first (Node version pinned in `.nvmrc`: v20.17.0).
There is no lockfile (`package-lock.json` is gitignored), so use `npm install`, not `npm ci`.

```bash
npm test                                   # mocha, auto-discovers test/*.mjs
npx mocha --grep "escaped html"            # run a single test / describe block by name
npm run build                              # rm -rf dist/ && rollup -c (cjs + esm bundles) + ESM types copy
./run-tests.sh                             # run the suite against marked@4 … marked@18
npm run test:types                         # build + pack, type-check TS projects using the package
npm run test:runtime                       # build + pack, require()/import it on the current Node
```

`run-tests.sh` (bash) reinstalls `marked` repeatedly (`--no-save`) and restores the normal
dependency set with a plain `npm install` at the end. Its `script -q /dev/null <cmd>` call
is BSD/macOS syntax.

Publishing (from README): date the new version's `CHANGELOG.md` entry and commit it first
(`npm version` needs a clean working tree), then

```bash
npm version <major|minor|patch> && npm run build && npm publish && git push --follow-tags
```

npm can take ~10 minutes to serve a new version, and `npm view` may stay stale even longer;
check `https://registry.npmjs.org/marked-escaping-tokenizer` instead.

## Architecture

One real source file: `src/EscapingTokenizer.mjs`. It subclasses marked's `Tokenizer`
and overrides exactly three methods so that HTML in Markdown input is rendered as
visible, escaped text instead of live markup — useful both for non-HTML render targets
(PDF) and for untrusted input.

- `html()` — block-level HTML. Rewrites the token to `type: 'paragraph'` with escaped
  text, then re-lexes that text inline via `this.lexer.inline(...)` so Markdown *inside*
  the escaped block still renders. The `if (this.lexer)` guard exists for older marked
  versions where the lexer back-reference may be absent.
- `tag()` — inline tags. Rewritten to `type: 'text'`.
- `inlineText()` — escapes text that marked would emit unescaped: after an inline `<pre>`,
  `<code>`, `<kbd>` or `<script>` tag marked is "in a raw block" (`this.lexer.state.inRawBlock`,
  and the token is flagged `escaped` since marked 15). Without this, such text is raw HTML (XSS).

The overrides forward `...args` to `super` and read lexer state instead of parameters:
marked changed these signatures over time (`inlineText` got `smartypants` until marked 7 and
nothing since marked 8; the old `inRawBlock` parameter silently stopped working).

Three invariants to preserve when editing:

1. **Escape `token.raw`, never `token.text`.** `raw` is the original source; `text` has
   already been partially processed by marked and loses the literal markup.
2. **Return `undefined` when `super` returns falsy.** marked treats a returned object as
   "this tokenizer matched", so swallowing a non-match breaks the tokenizer chain.
3. **Never flag the converted tag token `escaped: true`.** Since marked 15 the lexer appends
   following text tokens to the previous text token and keeps that token's flags, so text after
   an inline tag lands in the converted tag token, still unescaped. With the flag the renderer
   outputs it raw: `<b>x</b><img/src=x/onerror=alert(1)>` becomes live HTML.

`escaper` is a public instance field (default `escape-html`) that callers may reassign —
it is part of the API surface and is declared in `index.d.ts`.

Link URLs are deliberately not filtered (`[x](javascript:...)` stays a live link): that is out
of scope, and the README points users to a Content Security Policy or DOMPurify instead.

### Multi-version marked support

`peerDependencies` is `marked >=4 <19`, and the `Tokenizer` method signatures differ
across that range (e.g. `smartypants` only exists in older versions); marked 16+ is ESM
only. Any change to the overrides must be validated with `./run-tests.sh` (or CI), not just
`npm test` — a single-version pass proves nothing about the supported range.

Widening or narrowing the range means updating `package.json` (peer range and the `marked`
devDependency), the loop bounds in `run-tests.sh`, the `marked` matrix in
`.github/workflows/ci.yml`, the marked versions in `test/package/*.test.mjs` and the
compatibility note in `README.md`.

### Build and packaging

`rollup.config.mjs` emits `dist/cjs/EscapingTokenizer.js` (`main`) and
`dist/esm/EscapingTokenizer.mjs` (`module`), both minified with terser and with sourcemaps.
The `exports` map routes `import` to the ESM build and everything else to the CJS build.
`resolveOnly: (module) => module != 'marked'` keeps `marked` external (peer dep) while
bundling `escape-html` into the output.

`index.d.ts` is hand-written, not generated — new public members must be added there
manually. `npm run build` copies it to `dist/esm/EscapingTokenizer.d.mts`: ESM consumers
need ESM-format types, otherwise the `import 'marked'` inside resolves to marked's CJS types
and `EscapingTokenizer` is not assignable to marked's `tokenizer` option (TS2322 under
`node16`/`nodenext`). The `files` field in `package.json` whitelists what gets published.

A local `lib/` directory, if present, is a stale artifact of the pre-rollup Babel build; it is
gitignored and not in `files`, so ignore it.

Tests in `test/*.mjs` import from `../src/EscapingTokenizer.mjs` directly, so `npm test` never
exercises the bundle. They are integration tests: Markdown in, rendered HTML asserted with
`contains` / `not.contains`.

`test/package/` tests the published package instead: it packs it like `npm publish` and installs
the tarball into temporary projects. `types.test.mjs` type-checks TypeScript projects with
different module settings (catches the TS2322 problem above), `runtime.test.mjs` loads it with
`require()` and `import` and checks the escaping and that project and package share one copy of
marked. Mocha's default spec isn't recursive, so `npm test` doesn't run them. They install
packages from the npm registry, so they need network access.

CI (`.github/workflows/ci.yml`) runs the unit tests once per marked version, the type checks
once and the runtime checks on Node 20, 22 and 24.

Update `CHANGELOG.md` for user-visible changes (Semantic Versioning, dated entries).
