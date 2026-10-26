import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import AlertasPage from './pages/AlertasPage';
import DashboardPage from './pages/DashboardPage';
import HistorialPage from './pages/HistorialPage';
import LoginPage from './pages/LoginPage';
import { EnVivoProvider } from './services/EnVivo';
import { AuthProvider, RutaProtegida } from './services/auth';

function Privado() {
  return (
    <EnVivoProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/alertas" element={<AlertasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </EnVivoProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<RutaProtegida><Privado /></RutaProtegida>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
