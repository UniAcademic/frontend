import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
