import { BrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { AetherisProvider } from './context/AetherisContext'

/**
 * App — thin root.
 * AetherisProvider supplies global state to the entire tree.
 */
export default function App() {
  return (
    <AetherisProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AetherisProvider>
  )
}
