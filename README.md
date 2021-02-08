[![npm version](https://img.shields.io/npm/v/marked-escaping-tokenizer.svg)](https://www.npmjs.com/package/marked-escaping-tokenizer)
[![license](https://img.shields.io/npm/l/marked-escaping-tokenizer.svg)](./LICENSE)

# marked-escaping-tokenizer
A custom tokenizer to disable custom HTML in [Marked Markdown](https://www.npmjs.com/package/marked) made by [Scitotec GmbH](https://scitotec.de).

## Why?

Because we like to use markdown as a simple markup language without the preordained target HTML. The target might be a PDF or something completely different. None of these other targets support HTML.

Another reason is, that generally escaped Markdown provides a much more secure way to render markdown input by users which may not be trusted.

## How to use it with Marked?

You can just create a new `EscapingTokenizer` with an escaper of your choice. We recommend [escape-html](https://www.npmjs.com/package/escape-html).

Install with your package manager:

```bash
npm install --save marked-escaping-tokenizer
npm install --save escape-html
```

Configure and use:

```js
import { EscapingTokenizer } from 'marked-escaping-tokenizer'
import * as escapeHtml from 'escape-html'
import * as marked from 'marked'

// init your tokenizer
const tokenizer = new EscapingTokenizer()
tokenizer.escaper = (s) => escapeHtml(s)


// use marked as you wish
const html = marked(input, { tokenizer: tokenizer })
```

