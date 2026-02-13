import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { HomePage } from '@/pages/HomePage'
import { PackageDetailPage } from '@/pages/PackageDetailPage'
import { ComparePage } from '@/pages/ComparePage'
import { AboutPage } from '@/pages/AboutPage'
import { ToolsPage } from '@/pages/ToolsPage'
import { ProjectWorkspacePage } from '@/pages/ProjectWorkspacePage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/package/:packageName" element={<PackageDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/projects" element={<ProjectWorkspacePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
