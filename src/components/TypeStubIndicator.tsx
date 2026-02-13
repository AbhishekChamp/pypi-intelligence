import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'

interface TypeStubIndicatorProps {
  hasTypeStubs: boolean
  packageName: string
}

export function TypeStubIndicator({ hasTypeStubs, packageName }: TypeStubIndicatorProps) {
  if (hasTypeStubs) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
        <CheckCircle className="h-3.5 w-3.5" />
        <span>Type Stubs</span>
      </div>
    )
  }

  // Check if there's a separate stubs package
  const stubsPackageName = `${packageName}-stubs`
  
  return (
    <div className="group relative inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium cursor-help">
      <XCircle className="h-3.5 w-3.5" />
      <span>No Type Stubs</span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg shadow-lg bg-gray-800 text-white text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">No Type Information</p>
            <p className="opacity-90 mb-2">
              This package doesn't include type stubs. You may lose IDE autocomplete and type checking.
            </p>
            <p className="opacity-75">
              Try: <code className="bg-gray-700 px-1 rounded">pip install {stubsPackageName}</code>
            </p>
          </div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  )
}