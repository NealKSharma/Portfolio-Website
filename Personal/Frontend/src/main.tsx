import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './main.css'
import Landing from './Landing'
import Menu from './Menu'
import AI from './AI/ai'
import ProtectedRoute from './ProtectedRoute'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/Personal/">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/menu" element={<Menu />} />
          <Route path="/ai" element={<AI />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
