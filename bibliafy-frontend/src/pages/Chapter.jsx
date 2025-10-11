import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import NoteModal from '../components/NoteModal';
import './Chapter.css';

// Ícones
const StarIcon = ({ filled = false }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const NoteIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;

function Chapter() {
  const { bookId, chapterNum } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [verses, setVerses] = useState([]);
  const [bookName, setBookName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [theme, setTheme] = useState('theme-dark');
  const [font, setFont] = useState('font-garamond');
  const [fontSize, setFontSize] = useState(18);

  const [favorites, setFavorites] = useState(new Set());
  const [noteModalVerse, setNoteModalVerse] = useState(null);

  const fetchFavorites = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get('/api/favorites', { headers: { Authorization: `Bearer ${token}` } });
        const favoriteIds = response.data.map(fav => fav.verse_id);
        setFavorites(new Set(favoriteIds));
      } catch (err) {
        console.error("Não foi possível carregar os favoritos.", err);
      }
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [versesResponse, booksResponse] = await Promise.all([
          api.get(`/api/bible/books/${bookId}/chapters/${chapterNum}`),
          api.get('/api/bible/books'),
        ]);
        
        setVerses(versesResponse.data);
        const currentBook = booksResponse.data.find(b => b.id == bookId);
        if (currentBook) setBookName(currentBook.name);

        await fetchFavorites();
      } catch (err) {
        console.error("Erro ao buscar dados do capítulo:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [bookId, chapterNum, fetchFavorites]);

  const handleToggleFavorite = async (verseId) => {
    if (!isAuthenticated) {
      return Swal.fire({
        title: 'Ação restrita',
        text: "Você precisa estar logado para favoritar versículos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Fazer Login',
        cancelButtonText: 'Cancelar',
        customClass: { popup: 'swal2-popup', title: 'swal2-title', htmlContainer: 'swal2-html-container' }
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
    }

    const newFavorites = new Set(favorites);
    const isFavorited = favorites.has(verseId);

    if (isFavorited) {
      newFavorites.delete(verseId);
    } else {
      newFavorites.add(verseId);
    }
    setFavorites(newFavorites);

    try {
      if (isFavorited) {
        await api.delete(`/api/favorites/${verseId}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post('/api/favorites', { verse_id: verseId }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (err) {
      console.error("Erro ao favoritar:", err);
      setFavorites(favorites); 
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Não foi possível atualizar o favorito.' });
    }
  };

  const handleSaveNote = async (noteData) => {
    if (!isAuthenticated) return;
    try {
        await api.post('/api/notes', noteData, { headers: { Authorization: `Bearer ${token}` } });
        setNoteModalVerse(null);
        Swal.fire({
            icon: 'success',
            title: 'Anotação salva!',
            showConfirmButton: false,
            timer: 1500,
            customClass: { popup: 'swal2-popup', title: 'swal2-title' }
        });
    } catch (error) {
        console.error("Erro ao salvar anotação:", error);
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível salvar a anotação.' });
    }
  };

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 40));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  if (loading) { return <div className={`chapter-container ${theme}`}><p className="loading-message">Carregando...</p></div>; }

  return (
    <div className={`chapter-container ${theme} ${font}`}>
      <header className="chapter-header">
        <h1>{bookName}</h1>
        <p className="chapter-subtitle">Capítulo {chapterNum}</p>
      </header>
      
      {/* O CÓDIGO DO MENU DE OPÇÕES ESTAVA FALTANDO AQUI */}
      <div className="reading-options">
        <div className="option-group">
          <span className="option-label">Tema:</span>
          <div className="theme-buttons">
            <button onClick={() => setTheme('theme-light')} className={`theme-btn light ${theme === 'theme-light' ? 'active' : ''}`} title="Claro" />
            <button onClick={() => setTheme('theme-dark')} className={`theme-btn dark ${theme === 'theme-dark' ? 'active' : ''}`} title="Escuro" />
            <button onClick={() => setTheme('theme-sepia')} className={`theme-btn sepia ${theme === 'theme-sepia' ? 'active' : ''}`} title="Sépia" />
          </div>
        </div>

        <div className="option-group font-controls">
          <div className="option-group">
            <span className="option-label">Fonte:</span>
            <select value={font} onChange={(e) => setFont(e.target.value)} className="font-select">
              <option value="font-garamond">Garamond</option>
              <option value="font-lato">Lato</option>
              <option value="font-merriweather">Merriweather</option>
              <option value="font-roboto-slab">Roboto Slab</option>
              <option value="font-source-sans">Source Sans</option>
            </select>
          </div>
          <div className="option-group font-size-control">
             <span className="option-label">Tamanho:</span>
            <button onClick={decreaseFontSize} className="font-size-btn">-</button>
            <span className="font-size-display">{fontSize}px</span>
            <button onClick={increaseFontSize} className="font-size-btn">+</button>
          </div>
        </div>

         <div className="option-group">
           <Link to="/home" className="nav-btn" title="Voltar à lista de livros">
             <HomeIcon />
           </Link>
        </div>
      </div>
      {/* FIM DO CÓDIGO QUE FALTAVA */}

      <main className="verses-list" style={{ fontSize: `${fontSize}px` }}>
        {verses.map(verse => {
          const isFavorited = favorites.has(verse.id);
          return (
            <div key={verse.id} className="verse-item">
              <p className="verse-text">
                <span className="verse-number">{verse.verse}</span>
                {verse.text}
              </p>
              {isAuthenticated && (
                <div className="verse-actions">
                  <button onClick={() => handleToggleFavorite(verse.id)} className={`action-btn ${isFavorited ? 'active' : ''}`} title="Favoritar">
                    <StarIcon filled={isFavorited} />
                  </button>
                  <button onClick={() => setNoteModalVerse({ id: verse.id, text: verse.text, number: verse.verse, chapter: chapterNum, bookName })} className="action-btn" title="Adicionar nota">
                    <NoteIcon />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </main>

      <NoteModal 
        verse={noteModalVerse} 
        onClose={() => setNoteModalVerse(null)} 
        onSave={handleSaveNote} 
      />
    </div>
  );
}

export default Chapter;