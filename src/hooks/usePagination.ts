// src/hooks/usePagination.ts
import { useState, useMemo, useCallback } from 'react'

export interface PaginationConfig {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
}

export interface PaginationResult<T> {
  // Dados paginados
  currentPageData: T[]
  
  // Estado atual
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  
  // Controles
  goToPage: (page: number) => void
  goToFirstPage: () => void
  goToLastPage: () => void
  goToNextPage: () => void
  goToPreviousPage: () => void
  setPageSize: (size: number) => void
  
  // Estados de navegação
  hasNextPage: boolean
  hasPreviousPage: boolean
  isFirstPage: boolean
  isLastPage: boolean
  
  // Informações da página
  startIndex: number
  endIndex: number
  pageNumbers: number[]
  
  // Reset
  reset: () => void
}

export function usePagination<T>(
  data: T[],
  config: PaginationConfig = {}
): PaginationResult<T> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50, 100],
    showSizeChanger = true,
    showQuickJumper = true,
    showTotal = true
  } = config

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Cálculos memoizados
  const calculations = useMemo(() => {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / pageSize) || 1
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1)
    
    const currentPageData = data.slice(startIndex, startIndex + pageSize)
    
    // Gerar números de páginas para navegação
    const pageNumbers: number[] = []
    const maxPagesToShow = 7
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      const halfRange = Math.floor(maxPagesToShow / 2)
      let start = Math.max(1, currentPage - halfRange)
      let end = Math.min(totalPages, currentPage + halfRange)
      
      // Ajustar se estiver no início ou fim
      if (currentPage <= halfRange) {
        end = maxPagesToShow
      } else if (currentPage >= totalPages - halfRange) {
        start = totalPages - maxPagesToShow + 1
      }
      
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }
    }
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      currentPageData,
      pageNumbers
    }
  }, [data, currentPage, pageSize])

  // Estados de navegação
  const navigationStates = useMemo(() => ({
    hasNextPage: currentPage < calculations.totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === calculations.totalPages
  }), [currentPage, calculations.totalPages])

  // Controles de navegação
  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, calculations.totalPages))
    setCurrentPage(validPage)
  }, [calculations.totalPages])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLastPage = useCallback(() => {
    setCurrentPage(calculations.totalPages)
  }, [calculations.totalPages])

  const goToNextPage = useCallback(() => {
    if (navigationStates.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [navigationStates.hasNextPage])

  const goToPreviousPage = useCallback(() => {
    if (navigationStates.hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [navigationStates.hasPreviousPage])

  const changePageSize = useCallback((size: number) => {
    setPageSize(size)
    // Ajustar página atual se necessário
    const newTotalPages = Math.ceil(data.length / size) || 1
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
  }, [data.length, currentPage])

  const reset = useCallback(() => {
    setCurrentPage(initialPage)
    setPageSize(initialPageSize)
  }, [initialPage, initialPageSize])

  return {
    currentPageData: calculations.currentPageData,
    currentPage,
    pageSize,
    totalItems: calculations.totalItems,
    totalPages: calculations.totalPages,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize: changePageSize,
    hasNextPage: navigationStates.hasNextPage,
    hasPreviousPage: navigationStates.hasPreviousPage,
    isFirstPage: navigationStates.isFirstPage,
    isLastPage: navigationStates.isLastPage,
    startIndex: calculations.startIndex,
    endIndex: calculations.endIndex,
    pageNumbers: calculations.pageNumbers,
    reset
  }
}

// Hook para paginação server-side
export interface ServerPaginationConfig {
  initialPage?: number
  initialPageSize?: number
  fetchData: (page: number, pageSize: number, filters?: any) => Promise<{
    data: any[]
    total: number
  }>
  dependencies?: any[]
}

export function useServerPagination<T>(config: ServerPaginationConfig) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    fetchData,
    dependencies = []
  } = config

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [data, setData] = useState<T[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(totalItems / pageSize) || 1

  const loadData = useCallback(async (page: number, size: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchData(page, size)
      setData(result.data)
      setTotalItems(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      setData([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [fetchData])

  // Carregar dados quando página, tamanho ou dependências mudarem
  React.useEffect(() => {
    loadData(currentPage, pageSize)
  }, [loadData, currentPage, pageSize, ...dependencies])

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  const changePageSize = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Resetar para primeira página
  }, [])

  const refresh = useCallback(() => {
    loadData(currentPage, pageSize)
  }, [loadData, currentPage, pageSize])

  return {
    data,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    loading,
    error,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize: changePageSize,
    refresh,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  }
}

// Hook para paginação com filtros
export interface FilteredPaginationConfig<T, F> {
  data: T[]
  filterFn: (item: T, filters: F) => boolean
  sortFn?: (a: T, b: T) => number
  initialFilters?: F
  initialPage?: number
  initialPageSize?: number
}

export function useFilteredPagination<T, F>(
  config: FilteredPaginationConfig<T, F>
) {
  const {
    data,
    filterFn,
    sortFn,
    initialFilters,
    initialPage = 1,
    initialPageSize = 10
  } = config

  const [filters, setFilters] = useState<F>(initialFilters || {} as F)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Dados filtrados e ordenados
  const processedData = useMemo(() => {
    let result = data.filter(item => filterFn(item, filters))
    
    if (sortFn) {
      result.sort((a, b) => {
        const sortResult = sortFn(a, b)
        return sortDirection === 'desc' ? -sortResult : sortResult
      })
    }
    
    return result
  }, [data, filters, filterFn, sortFn, sortDirection])

  const pagination = usePagination(processedData, {
    initialPage,
    initialPageSize
  })

  const updateFilters = useCallback((newFilters: Partial<F>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    pagination.goToPage(1) // Resetar para primeira página
  }, [pagination])

  const clearFilters = useCallback(() => {
    setFilters(initialFilters || {} as F)
    pagination.goToPage(1)
  }, [initialFilters, pagination])

  const toggleSort = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  }, [])

  return {
    ...pagination,
    filters,
    updateFilters,
    clearFilters,
    processedData,
    sortDirection,
    toggleSort,
    filteredCount: processedData.length,
    totalCount: data.length
  }
}

// Hook para paginação infinita (scroll infinito)
export interface InfinitePaginationConfig<T> {
  fetchData: (page: number, pageSize: number) => Promise<{
    data: T[]
    hasMore: boolean
  }>
  pageSize?: number
  threshold?: number
}

export function useInfinitePagination<T>(config: InfinitePaginationConfig<T>) {
  const { fetchData, pageSize = 20, threshold = 0.8 } = config

  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchData(page, pageSize)
      
      setData(prev => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [fetchData, page, pageSize, loading, hasMore])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])

  // Hook para detectar scroll
  const useScrollTrigger = () => {
    React.useEffect(() => {
      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight
        
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight
        
        if (scrollPercentage >= threshold && hasMore && !loading) {
          loadMore()
        }
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }, [loadMore, hasMore, loading])
  }

  // Carregar primeira página
  React.useEffect(() => {
    if (data.length === 0 && hasMore) {
      loadMore()
    }
  }, [])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    useScrollTrigger
  }
}

// Utilitários para componentes de paginação
export const PaginationUtils = {
  // Gerar opções de tamanho de página
  generatePageSizeOptions: (options: number[] = [5, 10, 20, 50, 100]) => 
    options.map(size => ({ value: size, label: `${size} itens` })),

  // Calcular range de itens exibidos
  getItemRange: (currentPage: number, pageSize: number, totalItems: number) => {
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalItems)
    return { start, end }
  },

  // Gerar texto de informação da paginação
  getPaginationInfo: (currentPage: number, pageSize: number, totalItems: number) => {
    if (totalItems === 0) return 'Nenhum item encontrado'
    
    const { start, end } = PaginationUtils.getItemRange(currentPage, pageSize, totalItems)
    return `Exibindo ${start} a ${end} de ${totalItems} itens`
  },

  // Validar número de página
  validatePage: (page: number, totalPages: number) => {
    return Math.max(1, Math.min(page, totalPages))
  }
}
