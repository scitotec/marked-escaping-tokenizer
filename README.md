[![npm version](https://img.shields.io/npm/v/marked-escaping-tokenizer.svg)](https://www.npmjs.com/package/marked-escaping-tokenizer)
[![license](https://img.shields.io/npm/l/marked-escaping-tokenizer.svg)](./LICENSE)

# marked-escaping-tokenizer
A custom tokenizer to disable custom HTML in [Marked Markdown](https://www.npmjs.com/package/marked) made by [Scitotec GmbH](https://scitotec.de).

## Why?

Because we like to use markdown as a simple markup language without the preordained target HTML. The target might be a PDF or something completely different. None of these other targets support HTML.

Another reason is, that generally escaped Markdown provides a much more secure way to render markdown input by users which may not be trusted.

Escaping HTML is not a complete sanitizer, though: marked still renders links like `[click](javascript:alert(1))` as they are. If you show untrusted input in a browser, use a Content Security Policy that forbids inline scripts, which blocks such links, or sanitize the resulting HTML, e.g. with [DOMPurify](https://www.npmjs.com/package/dompurify).

## How to use it with Marked?

You can just create a new `EscapingTokenizer` with an escaper of your choice. We bundle [escape-html](https://www.npmjs.com/package/escape-html) as a default escaper for you.

Install with your package manager:

```bash
npm install --save marked-escaping-tokenizer
```

Configure and use:

```js
import { EscapingTokenizer } from 'marked-escaping-tokenizer'
import { marked } from 'marked'

// init your tokenizer
const tokenizer = new EscapingTokenizer()

// use marked as you wish
const html = marked.parse(input, { tokenizer })
```

Works with marked 4 up to 18. marked 16 and later are ESM only; to `require()` them from CommonJS you need Node.js 20.19+ or 22.12+.

## Advanced usage

### Configure the html escaper

You can swap out the default escaper for an escaper of your choice to escape html in a given string:

```js
import { EscapingTokenizer } from 'marked-escaping-tokenizer'
import { marked } from 'marked'

// init your tokenizer
const tokenizer = new EscapingTokenizer()
tokenizer.escaper = (s) => s.replaceAll('<', '&lt;')


// use marked as you wish
const html = marked.parse(input, { tokenizer })
```


## Publishing

Put the changes under a dated heading for the new version in `CHANGELOG.md` and commit that first, since `npm version` needs a clean working tree. Then:

```
npm version <major|minor|patch>   # bumps package.json, commits it and tags it as v<version>
npm run build
npm publish
git push --follow-tags
```
