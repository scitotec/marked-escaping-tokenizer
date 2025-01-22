[![npm version](https://img.shields.io/npm/v/marked-escaping-tokenizer.svg)](https://www.npmjs.com/package/marked-escaping-tokenizer)
[![license](https://img.shields.io/npm/l/marked-escaping-tokenizer.svg)](./LICENSE)

# marked-escaping-tokenizer
A custom tokenizer to disable custom HTML in [Marked Markdown](https://www.npmjs.com/package/marked) made by [Scitotec GmbH](https://scitotec.de).

## Why?

Because we like to use markdown as a simple markup language without the preordained target HTML. The target might be a PDF or something completely different. None of these other targets support HTML.

Another reason is, that generally escaped Markdown provides a much more secure way to render markdown input by users which may not be trusted.

## How to use it with Marked?

You can just create a new `EscapingTokenizer` with an escaper of your choice. We bundle [escape-html](https://www.npmjs.com/package/escape-html) as a default escaper for you.

Install with your package manager:

```bash
npm install --save marked-escaping-tokenizer
```

Configure and use:

```js
import { EscapingTokenizer } from 'marked-escaping-tokenizer'
import * as marked from 'marked'

// init your tokenizer
const tokenizer = new EscapingTokenizer()

// use marked as you wish
const html = marked(input, { tokenizer: tokenizer })
```

## Advanced usage

### Configure the html escaper

You can swap out the default escaper for an escaper of your choice to escape html in a given string:

```js
import { EscapingTokenizer } from 'marked-escaping-tokenizer'
import * as marked from 'marked'

// init your tokenizer
const tokenizer = new EscapingTokenizer()
tokenizer.escaper = (s) => s.replaceAll('<', '&lt;')


// use marked as you wish
const html = marked(input, { tokenizer: tokenizer })
```


## Publishing

```
npm version <major|minor|patch>
npm run build
git push <version>
git push
npm publish
```
