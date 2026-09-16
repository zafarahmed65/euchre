import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { readingTimeFromLexical } from '../lib/lexical'
import { slugField } from '../lib/slug'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: 'Content',
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      maxLength: 200,
      admin: { description: 'One or two lines. Shown on the homepage and category pages.' },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. If left blank the article shows a card illustration instead.' },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'relatedArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      maxDepth: 1,
    },
    // ── sidebar ──
    slugField('title'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: 'Midwest Euchre Company',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'MMMM d, yyyy' },
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculated from the body on save.',
      },
      hooks: {
        beforeChange: [({ siblingData }) => readingTimeFromLexical(siblingData?.body)],
      },
    },
  ],
}
