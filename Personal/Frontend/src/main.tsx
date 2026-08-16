import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './main.css'
import Landing from './Landing'
import Menu from './Menu'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/Personal/">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
