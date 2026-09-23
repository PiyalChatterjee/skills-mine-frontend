import dayjs, { type Dayjs } from 'dayjs'

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Form values use "MMMM YYYY" strings; legacy "DD MMMM YYYY", comma and hyphen
// formats remain readable so previously-saved data still parses correctly.
export function parseMonthYear(value: string): Dayjs | null {
  const dayMatch = value.trim().match(/^(\d{1,2})[ ,]([A-Za-z]+)[ ,](\d{4})$/)
  if (dayMatch) {
    const monthIndex = monthNames.findIndex((name) =>
      name.toLowerCase().startsWith(dayMatch[2].toLowerCase()),
    )
    if (monthIndex < 0) return null
    const parsed = dayjs(
      `${dayMatch[3]}-${String(monthIndex + 1).padStart(2, '0')}-01`,
    )
    return parsed.isValid() ? parsed : null
  }

  const match = value.trim().match(/^([A-Za-z]+)(?:-|,\s?| )(\d{4})$/)
  if (!match) return null
  const monthIndex = monthNames.findIndex((name) =>
    name.toLowerCase().startsWith(match[1].toLowerCase()),
  )
  if (monthIndex < 0) return null
  const parsed = dayjs(`${match[2]}-${String(monthIndex + 1).padStart(2, '0')}-01`)
  return parsed.isValid() ? parsed : null
}

export function formatMonthYear(value: Dayjs | null): string {
  return value ? value.format('MMMM YYYY') : ''
}
