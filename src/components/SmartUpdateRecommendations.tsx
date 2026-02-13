import type { ChangelogData } from '@/types'
import { calculateUpdateRecommendation } from '@/utils'
import { 
  Shield, 
  AlertTriangle, 
  Sparkles, 
  Bug,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface SmartUpdateRecommendationsProps {
  currentVersion: string
  latestVersion: string
  changelog: ChangelogData | null
}

export function SmartUpdateRecommendations({ 
  currentVersion, 
  latestVersion, 
  changelog 
}: SmartUpdateRecommendationsProps) {
  if (currentVersion === latestVersion) {
    return (
      <div className="rounded-lg p-4 bg-green-50 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-800">Up to Date</p>
          <p className="text-sm text-green-700">
            You're using the latest version ({currentVersion})
          </p>
        </div>
      </div>
    )
  }

  if (!changelog) {
    return (
      <div className="rounded-lg p-4 bg-gray-50 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-gray-700">Update Available</p>
          <p className="text-sm text-gray-600">
            Version {latestVersion} is available (you have {currentVersion}). 
            View the changelog tab for details.
          </p>
        </div>
      </div>
    )
  }

  const recommendation = calculateUpdateRecommendation(currentVersion, latestVersion, changelog)
  
  const getRecommendationDisplay = () => {
    if (recommendation.securityFixes) {
      return {
        level: 'critical',
        title: 'Security Update Required',
        icon: <Shield className="h-5 w-5" />,
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        subtext: 'text-red-700',
        action: 'Update Immediately',
      }
    }
    
    if (recommendation.breakingChanges) {
      return {
        level: 'warning',
        title: 'Major Update with Breaking Changes',
        icon: <AlertTriangle className="h-5 w-5" />,
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        subtext: 'text-orange-700',
        action: 'Review Before Updating',
      }
    }
    
    if (recommendation.riskScore < 30) {
      return {
        level: 'safe',
        title: 'Safe to Update',
        icon: <CheckCircle className="h-5 w-5" />,
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        subtext: 'text-green-700',
        action: 'Update Recommended',
      }
    }
    
    if (recommendation.riskScore < 60) {
      return {
        level: 'caution',
        title: 'Update with Caution',
        icon: <AlertCircle className="h-5 w-5" />,
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        subtext: 'text-yellow-700',
        action: 'Test Before Updating',
      }
    }
    
    return {
      level: 'hold',
      title: 'Hold for Now',
      icon: <XCircle className="h-5 w-5" />,
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-800',
      subtext: 'text-gray-700',
      action: 'Wait for Next Version',
    }
  }

  const display = getRecommendationDisplay()

  return (
    <div className={`rounded-lg p-4 ${display.bg} border ${display.border}`}>
      <div className="flex items-start gap-3">
        <div className={display.text}>
          {display.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className={`font-semibold ${display.text}`}>
              {display.title}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${display.bg} ${display.text} font-medium`}>
              {display.action}
            </span>
          </div>
          
          <p className={`text-sm ${display.subtext} mb-3`}>
            Update from <strong>v{currentVersion}</strong> to <strong>v{latestVersion}</strong>
            {recommendation.breakingChanges && ' includes breaking changes that may require code modifications.'}
            {recommendation.securityFixes && ' includes important security fixes.'}
          </p>

          {/* Change summary */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {recommendation.securityFixes && (
              <ChangeBadge 
                icon={<Shield className="h-3 w-3" />}
                text="Security Fixes"
                type="security"
              />
            )}
            {recommendation.breakingChanges && (
              <ChangeBadge 
                icon={<AlertTriangle className="h-3 w-3" />}
                text="Breaking Changes"
                type="breaking"
              />
            )}
            {recommendation.newFeatures && (
              <ChangeBadge 
                icon={<Sparkles className="h-3 w-3" />}
                text="New Features"
                type="feature"
              />
            )}
            {recommendation.bugFixes && (
              <ChangeBadge 
                icon={<Bug className="h-3 w-3" />}
                text="Bug Fixes"
                type="fix"
              />
            )}
          </div>

          {/* Risk meter */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              <span>Risk Assessment</span>
              <span>{recommendation.riskScore}/100</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  recommendation.riskScore < 30 ? 'bg-green-500' :
                  recommendation.riskScore < 60 ? 'bg-yellow-500' :
                  recommendation.riskScore < 80 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${recommendation.riskScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChangeBadge({ 
  icon, 
  text,
  type 
}: { 
  icon: React.ReactNode
  text: string
  type: 'security' | 'breaking' | 'feature' | 'fix'
}) {
  const styles = {
    security: 'bg-red-100 text-red-700',
    breaking: 'bg-orange-100 text-orange-700',
    feature: 'bg-purple-100 text-purple-700',
    fix: 'bg-blue-100 text-blue-700',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${styles[type]}`}>
      {icon}
      {text}
    </span>
  )
}