import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header'; // Nosso novo Header

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, mostra o Header e o conteúdo da página (Outlet)
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;