import { useState, useCallback } from 'react'
import { Upload, FileText, Download, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/utils'
import { fetchPackageInfo } from '@/api/pypi'

interface PackageInfo {
  name: string
  version: string
  license: string
  supplier: string
  downloadUrl: string
  checksum: string
  dependencies: string[]
}

interface SBOM {
  specVersion: string
  spdxVersion: string
  SPDXID: string
  name: string
  documentNamespace: string
  creationInfo: {
    created: string
    creators: string[]
  }
  packages: PackageInfo[]
  relationships: Array<{
    spdxElementId: string
    relatedSpdxElement: string
    relationshipType: string
  }>
}

export function SBOMGenerator() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [sbom, setSbom] = useState<SBOM | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [format, setFormat] = useState<'spdx-json' | 'cyclonedx-json' | 'spdx-tv'>('spdx-json')

  const parseRequirementsFile = async (content: string): Promise<Array<{ name: string; version?: string }>> => {
    const lines = content.split('\n')
    const packages: Array<{ name: string; version?: string }> = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue
      
      const cleanLine = trimmed.split(';')[0].split('#')[0].trim()
      const match = cleanLine.match(/^([a-zA-Z0-9][a-zA-Z0-9._-]*)(?:\[[^\]]+\])?\s*(.*)$/)
      
      if (match) {
        const name = match[1]
        const spec = match[2].trim()
        const versionMatch = spec.match(/(?:==|>=|<=|>|<|~=|!=)\s*([^\s,;]+)/)
        packages.push({
          name,
          version: versionMatch ? versionMatch[1] : undefined
        })
      }
    }

    return packages
  }

  const fetchPackageDetails = async (packageName: string, version?: string): Promise<PackageInfo | null> => {
    try {
      const data = await fetchPackageInfo(packageName)
      const releaseFiles = version ? data.releases[version] : data.urls
      const latestFile = releaseFiles?.[0]
      
      return {
        name: data.info.name,
        version: version || data.info.version,
        license: data.info.license || 'NOASSERTION',
        supplier: data.info.author || data.info.maintainer || 'NOASSERTION',
        downloadUrl: latestFile?.url || '',
        checksum: latestFile?.sha256_digest || '',
        dependencies: data.info.requires_dist?.map(dep => {
          const match = dep.match(/^([a-zA-Z0-9._-]+)/)
          return match ? match[1] : dep
        }) || []
      }
    } catch {
      return null
    }
  }

  const generateSBOM = async (packages: Array<{ name: string; version?: string }>) => {
    setIsGenerating(true)
    setProgress({ current: 0, total: packages.length })

    const packageDetails: PackageInfo[] = []
    const relationships: Array<{
      spdxElementId: string
      relatedSpdxElement: string
      relationshipType: string
    }> = []

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i]
      setProgress({ current: i + 1, total: packages.length })
      
      const details = await fetchPackageDetails(pkg.name, pkg.version)
      if (details) {
        packageDetails.push(details)
        
        // Add dependency relationships
        details.dependencies.forEach(dep => {
          relationships.push({
            spdxElementId: `SPDXRef-Package-${details.name}`,
            relatedSpdxElement: `SPDXRef-Package-${dep}`,
            relationshipType: 'DEPENDS_ON'
          })
        })
      }
    }

    const sbomData: SBOM = {
      specVersion: 'SPDX-2.3',
      spdxVersion: 'SPDX-2.3',
      SPDXID: 'SPDXRef-DOCUMENT',
      name: `SBOM-${files[0]?.name || 'generated'}`,
      documentNamespace: `https://pypi-intelligence/sbom/${Date.now()}`,
      creationInfo: {
        created: new Date().toISOString(),
        creators: ['Tool: PyPI-Intelligence-1.0']
      },
      packages: packageDetails,
      relationships
    }

    setSbom(sbomData)
    setIsGenerating(false)
  }

  const handleFileUpload = useCallback(async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return

    const newFiles = Array.from(uploadedFiles)
    setFiles(prev => [...prev, ...newFiles])

    const allPackages: Array<{ name: string; version?: string }> = []

    for (const file of newFiles) {
      const content = await file.text()
      const packages = await parseRequirementsFile(content)
      allPackages.push(...packages)
    }

    const uniquePackages = Array.from(
      new Map(allPackages.map(p => [p.name.toLowerCase(), p])).values()
    )

    if (uniquePackages.length > 0) {
      await generateSBOM(uniquePackages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const downloadSBOM = () => {
    if (!sbom) return

    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'spdx-json':
        content = JSON.stringify(sbom, null, 2)
        filename = 'sbom.spdx.json'
        mimeType = 'application/json'
        break
      case 'cyclonedx-json': {
        // Convert SPDX to CycloneDX format
        const cyclonedx = {
          bomFormat: 'CycloneDX',
          specVersion: '1.5',
          serialNumber: `urn:uuid:${crypto.randomUUID()}`,
          version: 1,
          metadata: {
            timestamp: sbom.creationInfo.created,
            tools: [{ name: 'PyPI-Intelligence', version: '1.0' }]
          },
          components: sbom.packages.map(pkg => ({
            type: 'library',
            name: pkg.name,
            version: pkg.version,
            purl: `pkg:pypi/${pkg.name}@${pkg.version}`,
            licenses: pkg.license !== 'NOASSERTION' ? [{ license: { name: pkg.license } }] : undefined
          }))
        }
        content = JSON.stringify(cyclonedx, null, 2)
        filename = 'sbom.cyclonedx.json'
        break
      }
        mimeType = 'application/json'
        break
      case 'spdx-tv':
        // SPDX Tag-Value format
        content = `SPDXVersion: ${sbom.spdxVersion}
DataLicense: CC0-1.0
SPDXID: ${sbom.SPDXID}
DocumentName: ${sbom.name}
DocumentNamespace: ${sbom.documentNamespace}
Creator: ${sbom.creationInfo.creators[0]}
Created: ${sbom.creationInfo.created}

`
        sbom.packages.forEach((pkg, index) => {
          content += `PackageName: ${pkg.name}
SPDXID: SPDXRef-Package-${index}
PackageVersion: ${pkg.version}
PackageDownloadLocation: ${pkg.downloadUrl || 'NOASSERTION'}
FilesAnalyzed: false
PackageVerificationCode: ${pkg.checksum ? `SHA256: ${pkg.checksum}` : 'NOASSERTION'}
PackageLicenseConcluded: ${pkg.license}
PackageLicenseDeclared: ${pkg.license}
PackageCopyrightText: NOASSERTION
Supplier: ${pkg.supplier}

`
        })
        filename = 'sbom.spdx.tv'
        mimeType = 'text/plain'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-(--border) hover:border-(--accent)'
        )}
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <Upload className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--text-muted)' }} />
        <p className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
          Drop your requirements file here
        </p>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          Supports requirements.txt
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90">
          <FileText className="h-4 w-4" />
          Select File
          <input
            type="file"
            accept=".txt"
            className="hidden"
            onChange={e => handleFileUpload(e.target.files)}
          />
        </label>
      </div>

      {/* Format Selection */}
      {files.length > 0 && !isGenerating && (
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Export Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as typeof format)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="spdx-json">SPDX (JSON)</option>
            <option value="cyclonedx-json">CycloneDX (JSON)</option>
            <option value="spdx-tv">SPDX (Tag-Value)</option>
          </select>
        </div>
      )}

      {/* Progress */}
      {isGenerating && (
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <div className="mb-4 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Generating SBOM... ({progress.current} / {progress.total})
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-(--bg-tertiary)">
            <div
              className="h-full rounded-full bg-(--accent) transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {sbom && !isGenerating && (
        <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                SBOM Generated
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {sbom.packages.length} packages documented
              </p>
            </div>
            <button
              onClick={downloadSBOM}
              className="flex items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Download {format.toUpperCase().replace('-', ' ')}
            </button>
          </div>

          {/* Package List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Package</th>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Version</th>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>License</th>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sbom.packages.map((pkg, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                      {pkg.name}
                    </td>
                    <td className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {pkg.version}
                    </td>
                    <td className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {pkg.license}
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
                        <CheckCircle className="h-3 w-3" />
                        Documented
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}