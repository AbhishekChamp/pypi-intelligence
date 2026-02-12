import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

// Hook for syncing state with URL search params
export function useURLState<T extends string>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const getValue = useCallback((): T => {
    const value = searchParams.get(key)
    return (value as T) || defaultValue
  }, [searchParams, key, defaultValue])

  const [state, setState] = useState<T>(getValue)

  // Update state when URL changes
  useEffect(() => {
    setState(getValue())
  }, [getValue])

  const setValue = useCallback(
    (value: T) => {
      const newParams = new URLSearchParams(searchParams)
      if (value === defaultValue) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
      setSearchParams(newParams, { replace: true })
      setState(value)
    },
    [searchParams, setSearchParams, key, defaultValue]
  )

  return [state, setValue]
}

// Hook for multiple URL states
export function useURLStates<T extends Record<string, string>>(
  defaults: T
): [T, (updates: Partial<T>) => void] {
  const [searchParams, setSearchParams] = useSearchParams()

  const getValues = useCallback((): T => {
    const values = { ...defaults }
    Object.keys(defaults).forEach(key => {
      const value = searchParams.get(key)
      if (value) {
        (values as Record<string, string>)[key] = value
      }
    })
    return values
  }, [searchParams, defaults])

  const [state, setState] = useState<T>(getValues)

  useEffect(() => {
    setState(getValues())
  }, [getValues])

  const setValues = useCallback(
    (updates: Partial<T>) => {
      const newParams = new URLSearchParams(searchParams)
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === defaults[key]) {
          newParams.delete(key)
        } else {
          newParams.set(key, value as string)
        }
      })
      
      setSearchParams(newParams, { replace: true })
      setState(prev => ({ ...prev, ...updates }))
    },
    [searchParams, setSearchParams, defaults]
  )

  return [state, setValues]
}

// Hook for URL-based pagination
export function useURLPagination(defaultPage = 1, defaultPageSize = 10) {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || String(defaultPage), 10)
  const pageSize = parseInt(searchParams.get('pageSize') || String(defaultPageSize), 10)

  const setPage = useCallback(
    (newPage: number) => {
      const newParams = new URLSearchParams(searchParams)
      if (newPage === defaultPage) {
        newParams.delete('page')
      } else {
        newParams.set('page', String(newPage))
      }
      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams, defaultPage]
  )

  const setPageSize = useCallback(
    (newPageSize: number) => {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('pageSize', String(newPageSize))
      newParams.delete('page') // Reset to first page when changing page size
      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
  }
}

// Hook for URL-based filters
export function useURLFilters<T extends Record<string, string>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = { ...defaults }
  Object.keys(defaults).forEach(key => {
    const value = searchParams.get(`filter_${key}`)
    if (value) {
      (filters as Record<string, string>)[key] = value
    }
  })

  const setFilter = useCallback(
    (key: keyof T, value: string | undefined) => {
      const newParams = new URLSearchParams(searchParams)
      const paramKey = `filter_${String(key)}`
      
      if (value === undefined || value === defaults[key]) {
        newParams.delete(paramKey)
      } else {
        newParams.set(paramKey, value)
      }
      
      // Reset pagination when filters change
      newParams.delete('page')
      
      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams, defaults]
  )

  const resetFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams)
    Object.keys(defaults).forEach(key => {
      newParams.delete(`filter_${key}`)
    })
    newParams.delete('page')
    setSearchParams(newParams, { replace: true })
  }, [searchParams, setSearchParams, defaults])

  return {
    filters: filters as T,
    setFilter,
    resetFilters,
    hasActiveFilters: Object.keys(defaults).some(
      key => filters[key] !== defaults[key]
    ),
  }
}

// Hook for URL-based search
export function useURLSearch(paramName = 'search') {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const search = searchParams.get(paramName) || ''

  const setSearch = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams)
      if (value) {
        newParams.set(paramName, value)
      } else {
        newParams.delete(paramName)
      }
      newParams.delete('page') // Reset pagination on search
      setSearchParams(newParams, { replace: true })
    },
    [searchParams, setSearchParams, paramName]
  )

  const clearSearch = useCallback(() => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete(paramName)
    newParams.delete('page')
    setSearchParams(newParams, { replace: true })
  }, [searchParams, setSearchParams, paramName])

  return {
    search,
    setSearch,
    clearSearch,
    hasSearch: !!search,
  }
}