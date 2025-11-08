import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import './styles/global.css';

// Páginas - Import conforme você criar
import Welcome from './pages/Welcome';
import Register from './pages/Register';
import Question from './pages/Question';
import RiskResult from './pages/RiskResult';
import VoiceRecording from './pages/VoiceRecording';
import FaceRecording from './pages/FaceRecording';
import ProfileCreated from './pages/ProfileCreated';
import Dashboard from './pages/Dashboard';
import TestFacial from './pages/TestFacial';
import TestArmRight from './pages/TestArmRight';
import TestArmLeft from './pages/TestArmLeft';
import TestSpeech from './pages/TestSpeech';
import ResultsOK from './pages/ResultsOK';
import ResultsAttention from './pages/ResultsAttention';

function ProtectedRoute({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding */}
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/question/:id" element={<Question />} />
        <Route path="/risk-result" element={<ProtectedRoute><RiskResult /></ProtectedRoute>} />

        {/* Perfil IA */}
        <Route path="/voice-recording" element={<ProtectedRoute><VoiceRecording /></ProtectedRoute>} />
        <Route path="/face-recording" element={<ProtectedRoute><FaceRecording /></ProtectedRoute>} />
        <Route path="/profile-created" element={<ProtectedRoute><ProfileCreated /></ProtectedRoute>} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Testes FAST */}
        <Route path="/test-facial" element={<ProtectedRoute><TestFacial /></ProtectedRoute>} />
        <Route path="/test-arm-right" element={<ProtectedRoute><TestArmRight /></ProtectedRoute>} />
        <Route path="/test-arm-left" element={<ProtectedRoute><TestArmLeft /></ProtectedRoute>} />
        <Route path="/test-speech" element={<ProtectedRoute><TestSpeech /></ProtectedRoute>} />

        {/* Resultados */}
        <Route path="/results-ok" element={<ProtectedRoute><ResultsOK /></ProtectedRoute>} />
        <Route path="/results-attention" element={<ProtectedRoute><ResultsAttention /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
