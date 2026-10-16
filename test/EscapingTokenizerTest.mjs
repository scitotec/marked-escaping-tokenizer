
import { marked } from 'marked'
import escapeHtml from 'escape-html'
import { EscapingTokenizer } from '../src/EscapingTokenizer.mjs'
import { expect } from 'chai'


describe('EscapingTokenizer integration with escapeHtml', () => {
  let markedOptions

  beforeEach(() => {
    markedOptions = {
      tokenizer: new EscapingTokenizer(),
      mangle: false,
      headerIds: false,
    }
    markedOptions.tokenizer.escaper = s => escapeHtml(s)
  })

  function toMarkdown(input) {
    return marked(input, markedOptions)
  }

  it('should escape a full html block', () => {
    const dirty = `<div><br><span>some <b>bold</b> or <i>italic</i>Text</span><br><a href="some.link">some Link</a><br><script>alert("XSS attack");</script><br></div>`
    const content = toMarkdown(dirty)

    expect(content).not.contains('<div')
    expect(content).not.contains('<b>')
    expect(content).not.contains('<i>')
    expect(content).not.contains('<a ')
    expect(content).not.contains('<script>')
    expect(content).not.contains('<br>')
  })

  it('escapes an html block exactly once', () => {
    const content = toMarkdown('<div>hi</div>')
    expect(content).contains('&lt;div&gt;hi&lt;/div&gt;')
    expect(content).not.contains('&amp;')
  })

  describe('escapes text after an inline <pre>, <code>, <kbd> or <script>: ', () => {
    it('in the same paragraph', () => {
      const content = toMarkdown('<kbd>**b**<img src=x onerror=alert(1)//')
      expect(content).not.contains('<img')
      expect(content).contains('&lt;img')
    })

    it('in a later paragraph', () => {
      const content = toMarkdown('x <code>\n\n*a*<img src=x onerror=alert(1)//')
      expect(content).not.contains('<img')
      expect(content).contains('&lt;img')
    })
  })

  it('escapes text after an inline tag', () => {
    // marked 15+ appends this text to the token tag() returns, so that token must not be flagged `escaped`
    const content = toMarkdown('<b>x</b><img/src=x/onerror=alert(1)>')
    expect(content).not.contains('<img')
    expect(content).contains('&lt;img')
  })

  it('may contain tables', () => {
    const content = toMarkdown(`
|price|
|------|
|12.00|
      `)
    expect(content).contains('<table')
  })
  describe('handles breaks: ', () => {
    it('not for newline', () => {
      const content = toMarkdown('Hello chief\nasdfg')
      expect(content).not.contains('<br')
    })

    it('slash breaks', () => {
      const content = toMarkdown('Hello chief\\\nasdfg')
      expect(content).contains('<br')
    })

    it('space breaks', () => {
      const content = toMarkdown('Hello chief  \nasdfg')
      expect(content).contains('<br')
    })
  })

  it('can contain html in a code block', () => {
    const content = toMarkdown(`
My happy text

\`\`\`html
<script>and some html code</script>
\`\`\`
      `)
    expect(content).not.contains('<script')
    expect(content).contains('and some html code')
  })

  it('html gets purged', () => {
    const content = toMarkdown(`
My happy text <script>foo

bar baz
      `)
    expect(content).not.contains('<script')
    expect(content).contains('foo')
    expect(content).contains('bar baz')
  })


  it('shall not respect written html', () => {
    const content = toMarkdown(`# Hello <strong>foo</strong>`)
    expect(content).not.contains('<strong')

    const contentMd = toMarkdown(`# Hello **foo**`)
    expect(contentMd).contains('<strong')
  })


  it('may contain escaped html', () => {
    const content = toMarkdown(`# Hello \\<script> world`)
    expect(content).contains('&lt;script')
  })
})
