// ============================================================================
// MBA Case Study Platform — Main App with Routing
// ============================================================================
// Root component with React Router setup for all pages.
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MBAHome } from './pages/MBAHome';
import { ReadingPage } from './pages/ReadingPage';
import { ExhibitsPage } from './pages/ExhibitsPage';
import { ChatPage } from './pages/ChatPage';
import { NotesPage } from './pages/NotesPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Main App Routes */}
        <Route path="/" element={<MBAHome />} />
        <Route path="/home" element={<MBAHome />} />
        <Route path="/read" element={<ReadingPage />} />
        <Route path="/exhibits" element={<ExhibitsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
