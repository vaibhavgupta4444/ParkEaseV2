import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import './styles/index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
