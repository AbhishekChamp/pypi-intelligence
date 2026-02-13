import { useState } from 'react'
import { checkLicenseCompatibility } from '@/utils'
import { 
  Scale, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
  Shield,
  Info
} from 'lucide-react'

interface LicenseCompatibilityProps {
  packageLicense: string | null
}

const COMMON_LICENSES = [
  { value: 'MIT', label: 'MIT License' },
  { value: 'Apache-2.0', label: 'Apache License 2.0' },
  { value: 'BSD-3-Clause', label: 'BSD 3-Clause' },
  { value: 'BSD-2-Clause', label: 'BSD 2-Clause' },
  { value: 'GPL-3.0', label: 'GNU GPL v3' },
  { value: 'GPL-2.0', label: 'GNU GPL v2' },
  { value: 'LGPL-3.0', label: 'GNU LGPL v3' },
  { value: 'LGPL-2.1', label: 'GNU LGPL v2.1' },
  { value: 'MPL-2.0', label: 'Mozilla Public License 2.0' },
  { value: 'ISC', label: 'ISC License' },
  { value: 'Unlicense', label: 'The Unlicense' },
  { value: 'Proprietary', label: 'Proprietary/Commercial' },
]

export function LicenseCompatibilityChecker({ packageLicense }: LicenseCompatibilityProps) {
  const [projectLicense, setProjectLicense] = useState<string>('MIT')
  
  if (!packageLicense) {
    return (
      <div className="rounded-lg p-4 bg-gray-50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-gray-700">License Information Unavailable</p>
            <p className="text-sm text-gray-600">
              This package doesn't specify a license. Please check the project repository for license details.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const compatibility = checkLicenseCompatibility(projectLicense, packageLicense)

  return (
    <div className="space-y-4">
      {/* Project license selector */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Your Project's License
        </label>
        <select
          value={projectLicense}
          onChange={(e) => setProjectLicense(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          {COMMON_LICENSES.map(license => (
            <option key={license.value} value={license.value}>
              {license.label}
            </option>
          ))}
        </select>
      </div>

      {/* Compatibility result */}
      <div className={`rounded-lg p-4 border ${
        compatibility.isCompatible 
          ? 'bg-green-50 border-green-200' 
          : compatibility.risk === 'critical'
            ? 'bg-red-50 border-red-200'
            : 'bg-orange-50 border-orange-200'
      }`}>
        <div className="flex items-start gap-3">
          {compatibility.isCompatible ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : compatibility.risk === 'critical' ? (
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className={`font-semibold ${
                compatibility.isCompatible ? 'text-green-800' : 'text-red-800'
              }`}>
                {compatibility.isCompatible ? 'Compatible' : 'Potential Conflict'}
              </p>
              <RiskBadge risk={compatibility.risk} />
            </div>
            
            <p className={`text-sm mb-3 ${
              compatibility.isCompatible ? 'text-green-700' : 'text-red-700'
            }`}>
              {compatibility.explanation}
            </p>

            {/* License comparison */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <LicenseBox 
                label="Your Project"
                license={compatibility.projectLicense}
                highlight={!compatibility.isCompatible}
              />
              <LicenseBox 
                label="This Package"
                license={compatibility.packageLicense}
                highlight={!compatibility.isCompatible}
              />
            </div>

            {/* Requirements */}
            {(compatibility.requiresSourceDisclosure || compatibility.requiresSameLicense) && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-sm font-medium text-red-800 mb-2">Requirements:</p>
                <ul className="space-y-1">
                  {compatibility.requiresSourceDisclosure && (
                    <li className="text-sm text-red-700 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Must disclose your source code if distributing
                    </li>
                  )}
                  {compatibility.requiresSameLicense && (
                    <li className="text-sm text-red-700 flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Must use the same license for your project
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick reference */}
      <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Common License Combinations
        </p>
        <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>MIT/Apache/BSD projects can safely use MIT/Apache/BSD packages</span>
          </li>
          <li className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>GPL packages require your project to also be GPL</span>
          </li>
          <li className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span>Proprietary/commercial projects should avoid GPL packages</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' | 'critical' }) {
  const styles = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }

  const labels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[risk]}`}>
      {labels[risk]}
    </span>
  )
}

function LicenseBox({ 
  label, 
  license,
  highlight 
}: { 
  label: string
  license: string
  highlight: boolean
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-red-100' : 'bg-white'}`}>
      <p className="text-xs opacity-60 mb-1">{label}</p>
      <p className={`font-mono text-sm font-medium ${highlight ? 'text-red-800' : ''}`}>
        {license}
      </p>
    </div>
  )
}