import type { CollectionConfig } from 'payload'

/**
 * One document per vote.
 *
 * The brief requires that "results must never expose personal information", so we
 * store only a one-way hash of an anonymous cookie id — no IP, no email, nothing
 * that can be traced back to a reader. Votes are created server-side through the
 * Local API in /api/vote; nothing here is writable from the browser.
 */
export const Votes: CollectionConfig = {
  slug: 'votes',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['hand', 'choiceIndex', 'createdAt'],
    group: 'Results',
    description:
      'Read-only record of every vote. Use the list filters to view one hand, and Export to download a CSV.',
  },
  access: {
    // Owner and editors can read and export. Nobody can create, edit or delete by
    // hand — tallies stay trustworthy.
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'hand',
      type: 'relationship',
      relationTo: 'hands',
      required: true,
      index: true,
    },
    {
      name: 'choiceIndex',
      type: 'number',
      required: true,
      admin: { description: 'Zero-based position of the chosen answer.' },
    },
    {
      name: 'voterHash',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description:
          'SHA-256 of an anonymous cookie id + this hand + a server salt. Not reversible, not personal data.',
      },
    },
  ],
}
