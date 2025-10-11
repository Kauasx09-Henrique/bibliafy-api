import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

// Ícones para o Header
const NotesIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>;
const ProfileIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/home" className="header-logo">
          Bibliafy
        </Link>

        <nav className="header-nav">
          <span className="user-greeting">Olá, {user?.name.split(' ')[0]}</span>
          <Link to="/anotacoes" className="nav-icon-button" title="Minhas Anotações">
            <NotesIcon />
          </Link>
          <Link to="/perfil" className="nav-icon-button" title="Meu Perfil e Favoritos">
            <ProfileIcon />
          </Link>
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;