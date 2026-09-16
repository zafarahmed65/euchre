import type { CollectionConfig } from 'payload'
import { slugField } from '../lib/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: 'Content',
  },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Shown at the top of the category page and used for SEO.' },
    },
  ],
}
