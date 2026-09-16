import type { GlobalConfig } from 'payload'

/**
 * The owner's entire control surface for the homepage: hero wording, which story
 * is featured, and the app banner. Section order and layout are deliberately not
 * editable — the brief asks for a fixed approved hierarchy, and locking it means
 * the owner cannot accidentally break the design on a Tuesday night.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  admin: { group: 'Settings' },
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroHeading',
              type: 'textarea',
              required: true,
              defaultValue: 'Everything Euchre.\nAll in One Place.',
              admin: { description: 'Line breaks are kept, so you can control where it wraps.' },
            },
            {
              name: 'heroSubheading',
              type: 'textarea',
              required: true,
              defaultValue:
                'Learn the game, sharpen your strategy, and join the next generation of euchre.',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'heroCtaLabel',
                  type: 'text',
                  defaultValue: 'Explore Euchre',
                  admin: { width: '50%' },
                },
                {
                  name: 'heroCtaHref',
                  type: 'text',
                  defaultValue: '/hands',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Featured',
          fields: [
            {
              name: 'featuredArticle',
              type: 'relationship',
              relationTo: 'articles',
              admin: {
                description:
                  'The one priority story in the Featured band. Leave blank to use the newest article.',
              },
            },
          ],
        },
        {
          label: 'Euchre Next',
          fields: [
            {
              name: 'appBannerEnabled',
              label: 'Show the Euchre Next banner',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'appBannerHeading',
              type: 'text',
              defaultValue: 'Meet Euchre Next',
            },
            {
              name: 'appBannerSubheading',
              type: 'text',
              defaultValue: 'A smarter way to play, learn, and compete.',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'appBannerCtaLabel',
                  type: 'text',
                  defaultValue: 'Coming Soon',
                  admin: { width: '50%' },
                },
                {
                  name: 'appBannerCtaHref',
                  type: 'text',
                  defaultValue: '#',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
