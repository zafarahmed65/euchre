import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { rankOptions, suitOptions } from '../lib/cards'
import { slugField } from '../lib/slug'

export const DECISION_TYPES = [
  { label: 'Ordering up', value: 'ordering' },
  { label: 'Second round', value: 'second-round' },
  { label: 'Going alone', value: 'going-alone' },
  { label: 'Opening lead', value: 'opening-lead' },
  { label: 'Defense', value: 'defense' },
  { label: 'Discard', value: 'discard' },
]

const SEATS = [
  { label: 'First seat (left of dealer)', value: 'first' },
  { label: 'Second seat', value: 'second' },
  { label: 'Third seat', value: 'third' },
  { label: 'Dealer', value: 'dealer' },
]

const POSITIONS = [
  { label: 'You', value: 'you' },
  { label: 'Partner', value: 'partner' },
  { label: 'Left opponent', value: 'left-opponent' },
  { label: 'Right opponent', value: 'right-opponent' },
]

/** One card = two dropdowns. No uploading, no image picking, no design decisions. */
const cardFields = [
  {
    type: 'row' as const,
    fields: [
      {
        name: 'rank',
        type: 'select' as const,
        required: true,
        options: rankOptions,
        admin: { width: '50%' },
      },
      {
        name: 'suit',
        type: 'select' as const,
        required: true,
        options: suitOptions,
        admin: { width: '50%' },
      },
    ],
  },
]

export const Hands: CollectionConfig = {
  slug: 'hands',
  labels: { singular: "Today's Hand", plural: "Today's Hands" },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishDate', 'decisionType', 'votingOpen', '_status'],
    group: 'Content',
    description:
      'Each entry is one weekly scenario. The newest published hand becomes "Today’s Hand" on the homepage; older ones move to the archive automatically.',
  },
  access: { read: () => true },
  versions: { drafts: true },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Internal + page title, e.g. "Order up the Jack of Hearts?"' },
    },
    {
      type: 'tabs',
      tabs: [
        // ── 1. The situation ────────────────────────────────────────────────
        {
          label: 'The Situation',
          description: 'The table facts a player needs before deciding.',
          fields: [
            {
              name: 'label',
              type: 'text',
              defaultValue: 'Weekly Euchre Challenge',
              admin: { description: 'The small gold label above the hand. Leave blank to hide it.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'scoreUs',
                  label: 'Our score',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 10,
                  defaultValue: 0,
                  admin: { width: '50%' },
                },
                {
                  name: 'scoreThem',
                  label: 'Their score',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 10,
                  defaultValue: 0,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'seat',
                  type: 'select',
                  required: true,
                  defaultValue: 'first',
                  options: SEATS,
                  admin: { width: '50%' },
                },
                {
                  name: 'dealer',
                  type: 'select',
                  required: true,
                  defaultValue: 'partner',
                  options: POSITIONS,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'biddingRound',
              type: 'select',
              required: true,
              defaultValue: 'first',
              options: [
                { label: 'First round (upcard showing)', value: 'first' },
                { label: 'Second round (upcard turned down)', value: 'second' },
              ],
            },
            {
              name: 'upcard',
              type: 'group',
              label: 'Dealer upcard',
              admin: { description: 'The card turned up beside the kitty.' },
              fields: cardFields,
            },
            {
              name: 'hand',
              label: 'Your five cards',
              type: 'array',
              required: true,
              minRows: 5,
              maxRows: 5,
              // Pre-filled so the form shows five card pickers immediately —
              // the owner changes dropdowns rather than adding rows.
              defaultValue: [
                { rank: 'A', suit: 'spades' },
                { rank: 'K', suit: 'spades' },
                { rank: 'Q', suit: 'spades' },
                { rank: '10', suit: 'diamonds' },
                { rank: '9', suit: 'clubs' },
              ],
              admin: {
                description: 'Exactly five cards, left to right as they appear on the page.',
                components: {
                  RowLabel: '/components/admin/CardRowLabel#CardRowLabel',
                },
              },
              fields: cardFields,
            },
          ],
        },

        // ── 2. The question ─────────────────────────────────────────────────
        {
          label: 'Question & Choices',
          description: 'What the reader votes on.',
          fields: [
            {
              name: 'question',
              type: 'text',
              required: true,
              admin: { description: 'e.g. "Would you order up the Jack of Hearts?"' },
            },
            {
              name: 'choices',
              type: 'array',
              required: true,
              minRows: 2,
              maxRows: 4,
              defaultValue: [{ label: 'Order it up' }, { label: 'Pass' }],
              admin: {
                description: 'Between two and four answers. The first is the primary button.',
                components: {
                  RowLabel: '/components/admin/ChoiceRowLabel#ChoiceRowLabel',
                },
              },
              fields: [
                { name: 'label', type: 'text', required: true },
                {
                  name: 'isCorrect',
                  label: 'This is the recommended play',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },

        // ── 3. The answer ───────────────────────────────────────────────────
        {
          label: 'Expert Analysis',
          description: 'Shown on the hand’s own page, below the results.',
          fields: [
            {
              name: 'expertAnalysis',
              type: 'richText',
              editor: lexicalEditor({}),
            },
            {
              name: 'expectedValue',
              type: 'text',
              admin: {
                description:
                  'Optional, e.g. "+0.42 points per hand". Leave blank if you have no figure.',
              },
            },
            {
              name: 'analysisSource',
              type: 'select',
              defaultValue: 'expert',
              options: [
                { label: 'Expert judgment', value: 'expert' },
                { label: 'Simulator-supported', value: 'simulator' },
              ],
              admin: { description: 'Disclosed to readers beneath the analysis.' },
            },
            {
              name: 'methodologyNote',
              type: 'textarea',
              admin: { description: 'Optional: assumptions behind the analysis.' },
            },
          ],
        },
      ],
    },

    // ── Sidebar: publishing + classification ────────────────────────────────
    slugField('title'),
    {
      name: 'publishDate',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'MMMM d, yyyy' },
        description:
          'The newest published hand on or before today is the one shown on the homepage.',
      },
    },
    {
      name: 'decisionType',
      type: 'select',
      required: true,
      defaultValue: 'ordering',
      options: DECISION_TYPES,
      admin: { position: 'sidebar', description: 'Used by the archive filters.' },
    },
    {
      name: 'difficulty',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'votingOpen',
      label: 'Voting open',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Untick to close voting on this hand.' },
    },
    {
      name: 'showResults',
      label: 'Show results to readers',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Untick to hide percentages and totals.' },
    },
    {
      name: 'relatedHands',
      type: 'relationship',
      relationTo: 'hands',
      hasMany: true,
      maxDepth: 1,
      admin: { position: 'sidebar' },
    },
  ],
}
