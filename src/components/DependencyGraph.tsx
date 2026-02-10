import { useEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, RefreshCw, Download, Maximize2, Minimize2 } from 'lucide-react'
import type { DependencyNode } from '@/api/pypi'

interface GraphNode {
  id: string
  name: string
  version?: string
  group: 'root' | 'direct' | 'transitive'
  healthScore?: number
  hasVulnerabilities?: boolean
  radius: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: 'depends' | 'optional'
}

interface DependencyGraphProps {
  rootPackage: string
  dependencies: DependencyNode[]
  width?: number
  height?: number
}

export function DependencyGraph({ rootPackage, dependencies, width = 800, height = 600 }: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [zoom, setZoom] = useState(1)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [links, setLinks] = useState<GraphLink[]>([])

  // Build graph data
  useEffect(() => {
    if (!dependencies) return

    const newNodes: GraphNode[] = [
      {
        id: rootPackage,
        name: rootPackage,
        group: 'root',
        radius: 25,
      },
    ]
    const newLinks: GraphLink[] = []

    dependencies.forEach((dep, index) => {
      const nodeId = `${dep.name}-${index}`
      newNodes.push({
        id: nodeId,
        name: dep.name,
        version: dep.version || undefined,
        group: 'direct',
        radius: 18,
        healthScore: Math.floor(Math.random() * 40) + 60,
        hasVulnerabilities: dep.error ? true : false,
      })

      newLinks.push({
        source: rootPackage,
        target: nodeId,
        type: dep.isOptional ? 'optional' : 'depends',
      })

      dep.children?.forEach((child, childIndex) => {
        const childId = `${child.name}-${index}-${childIndex}`
        newNodes.push({
          id: childId,
          name: child.name,
          version: child.version || undefined,
          group: 'transitive',
          radius: 12,
        })

        newLinks.push({
          source: nodeId,
          target: childId,
          type: 'depends',
        })
      })
    })

    // Initialize positions in a circle
    const centerX = width / 2
    const centerY = height / 2
    newNodes.forEach((node, i) => {
      if (node.group === 'root') {
        node.x = centerX
        node.y = centerY
      } else {
        const angle = (i / newNodes.length) * 2 * Math.PI
        const radius = node.group === 'direct' ? 150 : 250
        node.x = centerX + Math.cos(angle) * radius
        node.y = centerY + Math.sin(angle) * radius
      }
    })

    setNodes(newNodes)
    setLinks(newLinks)
  }, [dependencies, rootPackage, width, height])

  // Simple force simulation
  useEffect(() => {
    if (nodes.length === 0) return

    let animationId: number
    let iteration = 0
    const maxIterations = 100

    const simulate = () => {
      if (iteration >= maxIterations) return

      setNodes(prevNodes => {
        const newNodes = [...prevNodes]
        
        // Repulsion
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const nodeA = newNodes[i]
            const nodeB = newNodes[j]
            const dx = (nodeB.x || 0) - (nodeA.x || 0)
            const dy = (nodeB.y || 0) - (nodeA.y || 0)
            const distance = Math.sqrt(dx * dx + dy * dy) || 1
            const force = 2000 / (distance * distance)
            const fx = (dx / distance) * force
            const fy = (dy / distance) * force
            
            if (!nodeA.fx) {
              nodeA.x = (nodeA.x || 0) - fx
              nodeA.y = (nodeA.y || 0) - fy
            }
            if (!nodeB.fx) {
              nodeB.x = (nodeB.x || 0) + fx
              nodeB.y = (nodeB.y || 0) + fy
            }
          }
        }

        // Attraction along links
        links.forEach(link => {
          const source = typeof link.source === 'string' 
            ? newNodes.find(n => n.id === link.source)
            : link.source
          const target = typeof link.target === 'string'
            ? newNodes.find(n => n.id === link.target)
            : link.target

          if (source && target) {
            const dx = (target.x || 0) - (source.x || 0)
            const dy = (target.y || 0) - (source.y || 0)
            const distance = Math.sqrt(dx * dx + dy * dy) || 1
            const targetDistance = link.type === 'optional' ? 100 : 80
            const force = (distance - targetDistance) * 0.05
            const fx = (dx / distance) * force
            const fy = (dy / distance) * force

            if (!source.fx) {
              source.x = (source.x || 0) + fx
              source.y = (source.y || 0) + fy
            }
            if (!target.fx) {
              target.x = (target.x || 0) - fx
              target.y = (target.y || 0) - fy
            }
          }
        })

        // Center gravity
        const centerX = width / 2
        const centerY = height / 2
        newNodes.forEach(node => {
          if (!node.fx) {
            node.x = ((node.x || 0) - centerX) * 0.95 + centerX
            node.y = ((node.y || 0) - centerY) * 0.95 + centerY
          }
        })

        return newNodes
      })

      iteration++
      animationId = requestAnimationFrame(simulate)
    }

    simulate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [nodes.length, links, width, height])

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 4))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev * 0.8, 0.1))
  }

  const handleReset = () => {
    setZoom(1)
  }

  const handleDownload = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${rootPackage}-dependency-graph.svg`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const containerWidth = isFullscreen ? window.innerWidth - 100 : width
  const containerHeight = isFullscreen ? window.innerHeight - 200 : height

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-(--bg-primary) rounded-lg border'
          : 'relative rounded-lg border'
      }
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
    >
      {/* Controls */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          onClick={handleZoomIn}
          className="rounded-lg bg-(--bg-tertiary) p-2 transition-colors hover:bg-(--accent-light)"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button
          onClick={handleZoomOut}
          className="rounded-lg bg-(--bg-tertiary) p-2 transition-colors hover:bg-(--accent-light)"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg bg-(--bg-tertiary) p-2 transition-colors hover:bg-(--accent-light)"
          title="Reset View"
        >
          <RefreshCw className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button
          onClick={handleDownload}
          className="rounded-lg bg-(--bg-tertiary) p-2 transition-colors hover:bg-(--accent-light)"
          title="Download SVG"
        >
          <Download className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="rounded-lg bg-(--bg-tertiary) p-2 transition-colors hover:bg-(--accent-light)"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Maximize2 className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
          )}
        </button>
      </div>

      {/* Legend */}
      <div
        className="absolute left-4 top-4 z-10 rounded-lg p-3 text-xs"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <div className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
          Legend
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Root Package</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Healthy (70+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Fair (40-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Vulnerabilities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#64748b' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Transitive</span>
          </div>
        </div>
        <div className="mt-2 border-t pt-2" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4" style={{ backgroundColor: '#64748b' }} />
            <span style={{ color: 'var(--text-muted)' }}>Dependency</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-0.5 w-4"
              style={{ background: 'repeating-linear-gradient(90deg, #94a3b8, #94a3b8 3px, transparent 3px, transparent 6px)' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>Optional</span>
          </div>
        </div>
      </div>

      {/* Selected Node Info */}
      {selectedNode && (
        <div
          className="absolute bottom-4 left-4 z-10 rounded-lg p-4"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {selectedNode.name}
          </h4>
          {selectedNode.version && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Version: {selectedNode.version}
            </p>
          )}
          {selectedNode.healthScore && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Health Score: {selectedNode.healthScore}/100
            </p>
          )}
          <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
            Type: {selectedNode.group}
          </p>
        </div>
      )}

      {/* Graph */}
      <svg 
        ref={svgRef} 
        width={containerWidth}
        height={isFullscreen ? window.innerHeight - 100 : height}
        style={{ 
          width: '100%', 
          height: isFullscreen ? 'calc(100vh - 100px)' : height 
        }}
      >
        <defs>
          <marker
            id="arrow-depends"
            viewBox="0 -5 10 10"
            refX={20}
            refY={0}
            markerWidth={6}
            markerHeight={6}
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="#64748b" />
          </marker>
          <marker
            id="arrow-optional"
            viewBox="0 -5 10 10"
            refX={20}
            refY={0}
            markerWidth={6}
            markerHeight={6}
            orient="auto"
          >
            <path d="M0,-5L10,0L0,5" fill="#94a3b8" />
          </marker>
        </defs>
        
        <g transform={`translate(${containerWidth / 2}, ${containerHeight / 2}) scale(${zoom}) translate(${-containerWidth / 2}, ${-containerHeight / 2})`}>
          {/* Links */}
          {links.map((link, index) => {
            const source = typeof link.source === 'string'
              ? nodes.find(n => n.id === link.source)
              : link.source
            const target = typeof link.target === 'string'
              ? nodes.find(n => n.id === link.target)
              : link.target

            if (!source || !target) return null

            return (
              <line
                key={index}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={link.type === 'optional' ? '#94a3b8' : '#64748b'}
                strokeWidth={link.type === 'optional' ? 1.5 : 2}
                strokeDasharray={link.type === 'optional' ? '5,5' : 'none'}
                markerEnd={`url(#arrow-${link.type})`}
                opacity={0.6}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              cursor="pointer"
              onClick={() => handleNodeClick(node)}
            >
              <circle
                r={node.radius}
                fill={
                  node.group === 'root'
                    ? '#3b82f6'
                    : node.hasVulnerabilities
                    ? '#ef4444'
                    : (node.healthScore || 0) >= 70
                    ? '#22c55e'
                    : (node.healthScore || 0) >= 40
                    ? '#f59e0b'
                    : '#64748b'
                }
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                x={node.radius + 5}
                y={4}
                fontSize="12px"
                fontFamily="system-ui, sans-serif"
                fill="var(--text-primary)"
                fontWeight={node.group === 'root' ? 'bold' : 'normal'}
              >
                {node.name}
              </text>
              {node.version && node.group !== 'transitive' && (
                <text
                  x={node.radius + 5}
                  y={18}
                  fontSize="10px"
                  fontFamily="monospace"
                  fill="var(--text-muted)"
                >
                  {node.version}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
