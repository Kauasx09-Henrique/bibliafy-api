import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2'; // 1. Importe o SweetAlert2
import '../pages/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 2. Estado de carregamento
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true); // Ativa o carregamento

    try {
      const response = await api.post('/api/users/login', { email, password });
      
      localStorage.setItem('token', response.data.token);

      // 3. Mostra alerta de sucesso
      Swal.fire({
        icon: 'success',
        title: 'Login bem-sucedido!',
        text: 'Redirecionando...',
        timer: 2000, // Fecha automaticamente após 2 segundos
        showConfirmButton: false,
        customClass: { // Aplica o tema escuro
          popup: 'swal2-popup',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
        }
      });

      // Aguarda o timer do alerta para navegar
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
      // 4. Mostra alerta de erro
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
        customClass: {
          popup: 'swal2-popup',
          title: 'swal2-title',
          htmlContainer: 'swal2-html-container',
        }
      });
    } finally {
      setIsLoading(false); // Desativa o carregamento no final
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Bibliafy</h2>
        <p>Acesse sua conta para continuar</p>

        <input 
          type="email" 
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)} 
        />
        {/* 5. Lógica para desabilitar o botão e mudar o texto */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="redirect-link">
          Não tem uma conta? <Link to="/registro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;