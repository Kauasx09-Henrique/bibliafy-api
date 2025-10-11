import { createBrowserRouter, Navigate } from 'react-router-dom';

// Componentes principais e de layout
import App from '../App';
import ProtectedLayout from '../components/ProtectedLayout';

// Páginas Públicas
import Login from '../pages/Login';
import Registro from '../pages/Registro';

// Páginas Protegidas (precisam de login)
import Home from '../pages/Home';
import Book from '../pages/Book';
import Chapter from '../pages/Chapter';
import Anotacoes from '../pages/Anotacoes';
import Perfil from '../pages/Perfil';

const router = createBrowserRouter([
  // Grupo 1: Rotas públicas que não devem ter o Header
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/registro',
    element: <Registro />,
  },

  // Grupo 2: A rota raiz que mostra a animação e depois redireciona
  {
    path: '/',
    element: <App />,
    // A rota "index" é a padrão. Se o usuário estiver logado, será redirecionado para /home,
    // senão, será redirecionado para /login pela lógica dentro do App.jsx
    children: [{ index: true, element: <Navigate to="/home" replace /> }]
  },

  // Grupo 3: Todas as rotas protegidas que usarão o Header
  {
    path: '/',
    element: <ProtectedLayout />, // Este layout verifica o login e mostra o Header
    children: [
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'livro/:bookId',
        element: <Book />,
      },
      {
        path: 'livro/:bookId/capitulo/:chapterNum',
        element: <Chapter />,
      },
      {
        path: 'anotacoes',
        element: <Anotacoes />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
    ]
  }
]);

export default router;