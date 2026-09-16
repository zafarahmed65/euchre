import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation & Footer',
  admin: { group: 'Settings' },
  access: { read: () => true },
  fields: [
    {
      name: 'headerLinks',
      type: 'array',
      maxRows: 6,
      defaultValue: [
        { label: "Today's Hand", href: '/hands' },
        { label: 'Strategy', href: '/category/strategy' },
        { label: 'Learn', href: '/category/learn' },
        { label: 'About', href: '/about' },
      ],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'headerCta',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Euchre Next' },
        { name: 'href', type: 'text', defaultValue: '#euchre-next' },
      ],
    },
    {
      name: 'footerLinks',
      type: 'array',
      defaultValue: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'X', value: 'x' },
          ],
          required: true,
        },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
}
