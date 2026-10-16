# marked-escaping-tokenizer

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## 0.4.0 (unreleased)
* Add support for marked@16, marked@17 and marked@18
* Add an `exports` map with a native ESM build and ESM type definitions. This fixes `EscapingTokenizer` not being
  assignable to marked's `tokenizer` option in TypeScript projects using `moduleResolution` `node16`/`nodenext`.
  **breaking**: files in `dist/` can no longer be imported directly, and the ESM build is now `dist/esm/EscapingTokenizer.mjs`.

## 0.3.2 2026-10-16
* **Security**: escape text after an inline `<pre>`, `<code>`, `<kbd>` or `<script>` tag. With marked 8 and later it was
  passed through as raw HTML, e.g. `<kbd>**b**<img src=x onerror=alert(1)//` rendered a live `<img>`.
* Fix HTML blocks being escaped twice with marked 4 to 7

## 0.3.1 2025-06-10
* Fix types

## 0.3.0 2025-02-26
* Add types to package

## 0.2.0 2025-01-22
* Add support for ESM and CJS
* Add support for marked@15
* Add default escaper
  **breaking**: we include [escape-html](https://www.npmjs.com/package/escape-html) as a default escaper.
