import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Header } from './components/layout/Header';
import { ProfileView } from './components/profile/ProfileView';
import { ProjectList } from './components/projects/ProjectList';
import { MessagingView } from './components/messaging/MessagingView';
import { AdminPanel } from './components/admin/AdminPanel';

function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {showLogin ? (
        <LoginForm
          onSwitchToRegister={() => setShowLogin(false)}
          onSuccess={() => {}}
        />
      ) : (
        <RegisterForm
          onSwitchToLogin={() => setShowLogin(true)}
          onSuccess={() => setShowLogin(true)}
        />
      )}
    </div>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('projects');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onNavigate={setCurrentView} />

      <main>
        {currentView === 'projects' && <ProjectList />}
        {currentView === 'messages' && <MessagingView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
