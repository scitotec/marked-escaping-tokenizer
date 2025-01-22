import escapeHtml from 'escape-html'
import { Tokenizer } from 'marked';

export class EscapingTokenizer extends Tokenizer {

    escaper = (s) => escapeHtml(s)
  
    html(src) {
      const token = super.html(src)
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
  
    tag(src, inLink, inRawBlock) {
      const token = super.tag(src, inLink, inRawBlock)
      return (!token) ? undefined : {
        ...token,
        type: 'text',
        text: this.escaper(token.raw),
      }
    }
  
    inlineText(src, inRawBlock, smartypants) {
      const token = super.inlineText(src, inRawBlock, smartypants)
      return (!token) ? undefined : {
        ...token,
        text: inRawBlock ? this.escaper(token.raw) : token.text,
      }
    }
  }