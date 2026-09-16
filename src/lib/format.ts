export const SEAT_LABEL: Record<string, string> = {
  first: 'First seat',
  second: 'Second seat',
  third: 'Third seat',
  dealer: 'Dealer',
}

export const POSITION_LABEL: Record<string, string> = {
  you: 'You',
  partner: 'Partner',
  'left-opponent': 'Left opponent',
  'right-opponent': 'Right opponent',
}

export const DECISION_LABEL: Record<string, string> = {
  ordering: 'Ordering up',
  'second-round': 'Second round',
  'going-alone': 'Going alone',
  'opening-lead': 'Opening lead',
  defense: 'Defense',
  discard: 'Discard',
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export const formatDate = (value?: string | null): string =>
  value ? dateFormatter.format(new Date(value)) : ''
