'use client'

import { useRowLabel } from '@payloadcms/ui'

/** Shows the answer text on collapsed rows, and marks the recommended play. */
export const ChoiceRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ label?: string; isCorrect?: boolean }>()

  if (!data?.label) return <span>Choice {(rowNumber ?? 0) + 1}</span>

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <strong>{data.label}</strong>
      {data.isCorrect && (
        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>— recommended</span>
      )}
    </span>
  )
}
