type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

/** Walks a Lexical document and pulls out plain text — used for reading time and excerpts. */
export const lexicalToPlainText = (doc: unknown): string => {
  const root = (doc as { root?: LexicalNode } | null)?.root
  if (!root) return ''

  const parts: string[] = []
  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') parts.push(node.text)
    node.children?.forEach(walk)
  }
  walk(root)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/** 200 wpm, rounded up, floored at 1 — matches the "5 min read" label in the mockup. */
export const readingTimeFromLexical = (doc: unknown): number => {
  const words = lexicalToPlainText(doc).split(' ').filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}
