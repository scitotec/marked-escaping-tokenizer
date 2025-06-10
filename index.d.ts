import {Tokenizer} from 'marked';

declare class EscapingTokenizer extends Tokenizer {
    escaper: (input: string) => string;
}

export {EscapingTokenizer}
