import type { CollectionConfig } from 'payload'

const isAdmin = ({ req }: { req: { user?: { role?: string } | null } }) =>
  req.user?.role === 'admin'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Sign in with a username rather than an email address. The email is still
    // stored — Payload needs it to send a password reset — but it is never typed
    // at the login screen.
    loginWithUsername: {
      allowEmailLogin: false,
      requireEmail: true,
      requireUsername: true,
    },
  },
  admin: {
    useAsTitle: 'username',
    group: 'Settings',
    // The brief requires an editor account for future contributors that does not
    // share the owner login — so only admins can see or manage accounts.
    hidden: ({ user }) => (user as { role?: string })?.role !== 'admin',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    update: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
    read: ({ req }) => (req.user?.role === 'admin' ? true : { id: { equals: req.user?.id } }),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Owner / Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        // An editor must never be able to promote themselves.
        update: isAdmin,
      },
    },
  ],
}
