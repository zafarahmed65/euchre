import React from 'react'

type Node = {
  type?: string
  tag?: string
  text?: string
  format?: number | string
  children?: Node[]
  listType?: string
}

const inline = (nodes: Node[] = []): React.ReactNode =>
  nodes.map((node, i) => {
    if (typeof node.text === 'string') {
      const format = typeof node.format === 'number' ? node.format : 0
      let el: React.ReactNode = node.text
      if (format & 1) el = <strong key={i}>{el}</strong>
      if (format & 2) el = <em key={i}>{el}</em>
      return <React.Fragment key={i}>{el}</React.Fragment>
    }
    return <React.Fragment key={i}>{inline(node.children)}</React.Fragment>
  })

/** Renders the Lexical documents produced by the CMS. Headings become the TOC anchors. */
export function RichText({ data, className = '' }: { data: unknown; className?: string }) {
  const root = (data as { root?: Node } | null)?.root
  if (!root?.children) return null

  return (
    <div className={className}>
      {root.children.map((node, i) => {
        switch (node.type) {
          case 'heading': {
            const Tag = (node.tag || 'h2') as 'h2' | 'h3'
            const text = (node.children ?? []).map((c) => c.text ?? '').join('')
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
            return (
              <Tag
                key={i}
                id={id}
                className={`scroll-mt-24 ${Tag === 'h2' ? 'mt-9 text-2xl md:text-[1.75rem]' : 'mt-7 text-xl'}`}
              >
                {text}
              </Tag>
            )
          }
          case 'quote':
            return (
              <blockquote
                key={i}
                className="my-6 border-l-4 border-gold pl-5 font-serif text-xl text-navy italic"
              >
                {inline(node.children)}
              </blockquote>
            )
          case 'list': {
            const List = node.listType === 'number' ? 'ol' : 'ul'
            return (
              <List
                key={i}
                className={`my-4 ml-6 space-y-1.5 ${List === 'ol' ? 'list-decimal' : 'list-disc'}`}
              >
                {(node.children ?? []).map((li, j) => (
                  <li key={j}>{inline(li.children)}</li>
                ))}
              </List>
            )
          }
          case 'horizontalrule':
            return <hr key={i} className="my-8 border-rule" />
          default:
            return (
              <p key={i} className="mt-4 leading-relaxed">
                {inline(node.children)}
              </p>
            )
        }
      })}
    </div>
  )
}

/** Pulls h2 headings out of a Lexical document for the article table of contents. */
export function headingsOf(data: unknown): { id: string; text: string }[] {
  const root = (data as { root?: Node } | null)?.root
  if (!root?.children) return []

  return root.children
    .filter((n) => n.type === 'heading' && (n.tag === 'h2' || !n.tag))
    .map((n) => {
      const text = (n.children ?? []).map((c) => c.text ?? '').join('')
      return {
        text,
        id: text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      }
    })
    .filter((h) => h.text.length > 0)
}
