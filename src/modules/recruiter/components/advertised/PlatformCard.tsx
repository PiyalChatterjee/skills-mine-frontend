import type { ExternalJobProvider } from '@/services/api/externalJobsApi'
import styles from './PlatformCard.module.css'

type PlatformCardProps = {
  provider: ExternalJobProvider
  selected: boolean
  onSelect: (providerCode: string) => void
}

const LOGO_COLORS = ['#e8590c', '#0d8c7e', '#7c3aed', '#c01343', '#1565c0', '#2f9e44']

// Stable colour per provider so a card keeps the same logo tile across renders.
const colorFor = (code: string) => {
  let hash = 0
  for (const char of code) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return LOGO_COLORS[hash % LOGO_COLORS.length]
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export const PlatformCard = ({ provider, selected, onSelect }: PlatformCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    disabled={!provider.is_enabled}
    className={`${styles.card} ${selected ? styles.cardSelected : ''}`}
    onClick={() => onSelect(provider.provider_code)}
  >
    <span
      className={styles.logo}
      style={{ background: colorFor(provider.provider_code) }}
      aria-hidden="true"
    >
      {provider.display_name.slice(0, 2)}
    </span>
    <span className={styles.body}>
      <span className={styles.name}>{provider.display_name}</span>
      <span className={styles.description}>{hostOf(provider.base_url)}</span>
    </span>
    <span className={`${styles.radio} ${selected ? styles.radioSelected : ''}`} aria-hidden="true" />
  </button>
)
