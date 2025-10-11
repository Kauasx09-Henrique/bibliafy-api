import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Cria o Contexto (a "mochila" vazia)
const AuthContext = createContext(null);

// 2. Cria o Provedor (quem vai gerenciar e fornecer os dados da mochila)
export function AuthProvider({ children }) {
  // Tenta pegar o token do armazenamento local quando o app carrega
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  // useEffect roda sempre que o 'token' muda
  useEffect(() => {
    if (token) {
      try {
        // Decodifica o token para pegar os dados do usuário (id, nome)
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        // Garante que o token esteja salvo no localStorage
        localStorage.setItem('token', token);
      } catch (error) {
        // Se o token for inválido, limpa tudo
        console.error("Token inválido:", error);
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } else {
      // Se não há token, limpa o localStorage
      localStorage.removeItem('token');
    }
  }, [token]);

  // Função para fazer login: recebe o novo token e atualiza o estado
  const login = (newToken) => {
    setToken(newToken);
  };

  // Função para fazer logout: limpa todos os estados e o localStorage
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Monta o objeto que será compartilhado com todos os componentes
  const value = { 
    token, 
    user, 
    login, 
    logout, 
    isAuthenticated: !!token // Um boolean (true/false) para checar facilmente se está logado
  };

  // Retorna o Provedor envolvendo os componentes filhos (nosso app inteiro)
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Cria um "Hook" customizado (um atalho para usar o contexto)
// Em vez de importar o `useContext` e o `AuthContext` em todo lugar,
// só precisamos importar e usar o `useAuth()`.
export function useAuth() {
  return useContext(AuthContext);
}