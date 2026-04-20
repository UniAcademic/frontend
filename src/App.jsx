import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import AppRoutes from '@routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex flex-col">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
