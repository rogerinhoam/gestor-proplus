import { parseISO, format } from 'date-fns'

export const formatDateTime = (iso: string): string =>
  format(parseISO(iso), 'dd/MM/yyyy HH:mm')

export const isConflict = (existing: Date[], candidate: Date): boolean =>
  existing.some(d => Math.abs(d.getTime() - candidate.getTime()) < 1000 * 60 * 60)
