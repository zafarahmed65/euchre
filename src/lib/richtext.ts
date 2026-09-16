/** Minimal Lexical document builders — enough for seeded editorial copy. */

/** The shape Payload's generated types expect for every Lexical child node. */
type LexNode = { [k: string]: unknown; type: string; version: number }

type TextNode = {
  type: 'text'
  detail: number
  format: number
  mode: 'normal'
  style: string
  text: string
  version: number
}

const text = (value: string): TextNode => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

export const p = (value: string): LexNode => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  textFormat: 0,
  children: [text(value)],
})

export const h = (value: string, tag: 'h2' | 'h3' = 'h2'): LexNode => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr' as const,
  children: [text(value)],
})

export const doc = (children: LexNode[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children,
  },
})

/** Shorthand: plain paragraphs from an array of strings. */
export const paragraphs = (lines: string[]) => doc(lines.map(p))
