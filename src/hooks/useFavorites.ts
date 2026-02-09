import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pypi-intelligence-favorites'
const MAX_FAVORITES = 20

export interface FavoriteItem {
  packageName: string
  timestamp: number
  description?: string
  version?: string
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setFavorites(parsed)
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error('Failed to save favorites:', error)
      }
    }
  }, [favorites, isLoaded])

  const addFavorite = useCallback((item: Omit<FavoriteItem, 'timestamp'>) => {
    setFavorites((prev) => {
      // Check if already exists
      const exists = prev.some(
        (f) => f.packageName.toLowerCase() === item.packageName.toLowerCase()
      )
      if (exists) return prev

      // Add new item at the beginning
      const newItem: FavoriteItem = {
        ...item,
        timestamp: Date.now(),
      }
      // Keep only MAX_FAVORITES
      return [newItem, ...prev].slice(0, MAX_FAVORITES)
    })
  }, [])

  const removeFavorite = useCallback((packageName: string) => {
    setFavorites((prev) =>
      prev.filter((f) => f.packageName.toLowerCase() !== packageName.toLowerCase())
    )
  }, [])

  const isFavorite = useCallback(
    (packageName: string) => {
      return favorites.some(
        (f) => f.packageName.toLowerCase() === packageName.toLowerCase()
      )
    },
    [favorites]
  )

  const toggleFavorite = useCallback(
    (item: Omit<FavoriteItem, 'timestamp'>) => {
      if (isFavorite(item.packageName)) {
        removeFavorite(item.packageName)
      } else {
        addFavorite(item)
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  )

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  const hasFavorites = favorites.length > 0

  return {
    favorites,
    isLoaded,
    hasFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  }
}
