import { Tokenizer } from 'marked';

export class EscapingTokenizer extends Tokenizer {
  
    html(src) {
      const token = super.html(src)
      return (!token) ? undefined : {
        ...token,
        type: 'paragraph',
        pre: false,
        text: this.escaper(token.raw),
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