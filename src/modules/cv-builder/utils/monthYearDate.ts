import dayjs, { type Dayjs } from 'dayjs'

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Form values store dates as "MonthName,YYYY" strings; these convert to/from Dayjs for the picker.
export function parseMonthYear(value: string): Dayjs | null {
  const match = value.trim().match(/^([A-Za-z]+),\s?(\d{4})$/)
  if (!match) return null
  const monthIndex = monthNames.findIndex((name) => name.toLowerCase() === match[1].toLowerCase())
  if (monthIndex < 0) return null
  const parsed = dayjs(`${match[2]}-${String(monthIndex + 1).padStart(2, '0')}-01`)
  return parsed.isValid() ? parsed : null
}

export function formatMonthYear(value: Dayjs | null): string {
  return value ? value.format('MMMM,YYYY') : ''
}
