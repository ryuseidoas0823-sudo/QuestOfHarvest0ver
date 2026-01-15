import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// App.tsx が同じ階層にある想定です
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
