import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pypi-intelligence-search-history'
const MAX_HISTORY_ITEMS = 10

export interface SearchHistoryItem {
  packageName: string
  timestamp: number
  description?: string
  version?: string
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        const filtered = parsed.filter((item: SearchHistoryItem) => item.timestamp > thirtyDaysAgo)
        setHistory(filtered)
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (error) {
        console.error('Failed to save search history:', error)
      }
    }
  }, [history, isLoaded])

  const addToHistory = useCallback((item: Omit<SearchHistoryItem, 'timestamp'>) => {
    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((h) => h.packageName.toLowerCase() !== item.packageName.toLowerCase())
      // Add new item at the beginning
      const newItem: SearchHistoryItem = {
        ...item,
        timestamp: Date.now(),
      }
      // Keep only MAX_HISTORY_ITEMS
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    })
  }, [])

  const removeFromHistory = useCallback((packageName: string) => {
    setHistory((prev) => prev.filter((h) => h.packageName.toLowerCase() !== packageName.toLowerCase()))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const hasHistory = history.length > 0

  return {
    history,
    isLoaded,
    hasHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  }
}
