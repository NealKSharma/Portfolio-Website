import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AiChat from './pages/AiChat';
import MainLayout from './layout/MainLayout';

export default function App() {
    return (
        <BrowserRouter basename="/Personal/">
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<Landing />} />
                
                {/* Protected Routes wrapped with MainLayout side-rail */}
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/ai" element={<AiChat />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}