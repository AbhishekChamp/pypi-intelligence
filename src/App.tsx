import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { PackageDetailPage } from '@/pages/PackageDetailPage'
import { ComparePage } from '@/pages/ComparePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/package/:packageName" element={<PackageDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
