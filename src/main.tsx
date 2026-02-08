import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Validate root element exists before rendering
const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('Fatal Error: Root element with id "root" not found in the DOM.')
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: system-ui, sans-serif;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="color: #dc2626; margin-bottom: 16px;">Application Error</h1>
      <p style="color: #374151; max-width: 500px;">
        The application could not start because the root element is missing.
        This might be due to a build error or corrupted HTML.
      </p>
      <button onclick="window.location.reload()" style="
        margin-top: 24px;
        padding: 12px 24px;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
      ">
        Reload Page
      </button>
    </div>
  `
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    console.error('Fatal Error: Failed to render application:', error)
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: system-ui, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <h1 style="color: #dc2626; margin-bottom: 16px;">Application Error</h1>
        <p style="color: #374151; max-width: 500px;">
          The application failed to start. Please try reloading the page.
        </p>
        <button onclick="window.location.reload()" style="
          margin-top: 24px;
          padding: 12px 24px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        ">
          Reload Page
        </button>
      </div>
    `
  }
}
