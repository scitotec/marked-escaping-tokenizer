import escapeHtml from 'escape-html'
import { Tokenizer } from 'marked';

export class EscapingTokenizer extends Tokenizer {

    escaper = (s) => escapeHtml(s)
  
    html(...args) {
      const token = super.html(...args)
      if (!token) return undefined
      const text = this.escaper(token.raw)
      let tokens
      if (this.lexer) {
        tokens = token.tokens || []
        this.lexer.inline(text, tokens)
      }
      return {
        ...token,
        type: 'paragraph',
        pre: false,
        text,
        tokens,
      }
    }
  
    tag(...args) {
      const token = super.tag(...args)
      return (!token) ? undefined : {
        ...token,
        type: 'text',
        text: this.escaper(token.raw),
      }
    }
  
    inlineText(...args) {
      const token = super.inlineText(...args)
      if (!token) return undefined
      // After an inline <pre>, <code>, <kbd> or <script> tag marked is "in a raw block" and
      // passes the text through unescaped (flagged `escaped` since marked 15).
      if (!token.escaped && !this.lexer?.state?.inRawBlock) return token
      return {
        ...token,
        text: this.escaper(token.raw),
        escaped: true,
      }
    }
  }