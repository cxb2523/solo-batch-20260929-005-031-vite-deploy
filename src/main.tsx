import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { RouterProvider } from './router'
import { ThemeProvider } from './theme/ThemeContext'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
    </ThemeProvider>
  </React.StrictMode>,
)