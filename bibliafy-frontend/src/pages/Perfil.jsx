import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import './Perfil.css';

function Perfil() {
  const { user, token, logout } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para o formulário de edição
  const [editName, setEditName] = useState(user?.name || '');
  const [editPassword, setEditPassword] = useState('');

  const fetchFavorites = useCallback(async () => {
    try {
      const response = await api.get('/api/favorites', { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(response.data);
    } catch (error) {
      console.error("Erro ao buscar favoritos", error);
    } finally {
      setLoadingFavorites(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/users/profile', { name: editName, password: editPassword || undefined }, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({
        icon: 'success',
        title: 'Perfil atualizado!',
        text: 'Faça o login novamente para ver as alterações.',
        customClass: { popup: 'swal2-popup' }
      }).then(() => {
        logout();
      });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível atualizar o perfil.', customClass: { popup: 'swal2-popup' } });
    }
  };
  
  const handleRemoveFavorite = async (verseId) => {
    try {
        await api.delete(`/api/favorites/${verseId}`, { headers: { Authorization: `Bearer ${token}` } });
        // Atualiza a lista de favoritos na tela removendo o item
        setFavorites(currentFavorites => currentFavorites.filter(fav => fav.verse_id !== verseId));
    } catch (error) {
        console.error("Erro ao remover favorito", error);
    }
  };


  return (
    <div className="perfil-container">
      <div className="user-info-card">
        <div className="user-info-header">
          <h2>Meu Perfil</h2>
          <button onClick={() => setIsEditing(!isEditing)} className="edit-button">
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>
        
        {!isEditing ? (
          <div>
            <p><strong>Nome:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="edit-form">
            <input 
              type="text" 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)} 
              className="auth-form input"
            />
            <input 
              type="password" 
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Nova senha (deixe em branco para não alterar)"
              className="auth-form input"
            />
            <button type="submit" className="edit-button">Salvar Alterações</button>
          </form>
        )}
      </div>

      <div className="favorites-section">
        <h2>Meus Favoritos</h2>
        {loadingFavorites ? <p>Carregando favoritos...</p> : (
          favorites.length > 0 ? (
            favorites.map(fav => (
              <div key={fav.verse_id} className="favorite-item">
                <div>
                  <p className="favorite-item-text">"{fav.verse_text}"</p>
                  <p className="favorite-item-ref">{`${fav.book_name} ${fav.chapter}:${fav.verse}`}</p>
                </div>
                <button onClick={() => handleRemoveFavorite(fav.verse_id)} className="remove-fav-btn">Remover</button>
              </div>
            ))
          ) : (
            <p>Você ainda não favoritou nenhum versículo.</p>
          )
        )}
      </div>
    </div>
  );
}

export default Perfil;