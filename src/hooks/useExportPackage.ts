import { useState, useCallback } from 'react'
import type { PyPIPackage } from '@/types'

export interface ExportData extends PyPIPackage {
  exportedAt: string
  pypiUrl: string
  dashboardUrl: string
}

interface UseExportPackageReturn {
  exportToJSON: (packageData: PyPIPackage) => void
  copyShareableLink: (packageName: string) => Promise<boolean>
  copied: boolean
}

export function useExportPackage(): UseExportPackageReturn {
  const [copied, setCopied] = useState(false)

  const exportToJSON = useCallback((packageData: PyPIPackage) => {
    const exportData: ExportData = {
      ...packageData,
      exportedAt: new Date().toISOString(),
      pypiUrl: `https://pypi.org/project/${packageData.info.name}/`,
      dashboardUrl: `${window.location.origin}/package/${packageData.info.name}`,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${packageData.info.name}-package-info.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  const copyShareableLink = useCallback(async (packageName: string): Promise<boolean> => {
    try {
      const shareableUrl = `${window.location.origin}/package/${packageName}`
      await navigator.clipboard.writeText(shareableUrl)
      setCopied(true)
      
      setTimeout(() => setCopied(false), 2000)
      
      return true
    } catch (error) {
      console.error('Failed to copy link:', error)
      return false
    }
  }, [])

  return {
    exportToJSON,
    copyShareableLink,
    copied,
  }
}
