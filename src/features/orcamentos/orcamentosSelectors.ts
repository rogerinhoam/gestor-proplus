import { createSelector } from 'reselect'
import { Orcamento } from '../../types'

export const selectOrcamentos = (state: any) => state.orcamentos

export const selectRecentOrcamentos = createSelector(
  [selectOrcamentos],
  (orcamentos: Orcamento[]) =>
    orcamentos
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 8)
)

export const selectTotalsByStatus = createSelector(
  [selectOrcamentos],
  (orcamentos: Orcamento[]) =>
    orcamentos.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
)
