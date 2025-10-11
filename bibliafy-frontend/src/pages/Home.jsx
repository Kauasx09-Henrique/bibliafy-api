import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

// Ícone para o botão de recarregar o versículo
const RefreshIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isOldTestamentOpen, setIsOldTestamentOpen] = useState(true);
  const [isNewTestamentOpen, setIsNewTestamentOpen] = useState(true);

  // Estado para o versículo aleatório
  const [randomVerse, setRandomVerse] = useState(null);

  // Função para buscar o versículo aleatório na API
  const fetchRandomVerse = useCallback(async () => {
    try {
      const response = await api.get('/api/bible/verses/random');
      setRandomVerse(response.data);
    } catch (err) {
      console.error("Erro ao buscar versículo aleatório:", err);
    }
  }, []);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Busca livros e o primeiro versículo aleatório em paralelo para ser mais rápido
        await Promise.all([
          api.get('/api/bible/books').then(res => setBooks(res.data)),
          fetchRandomVerse()
        ]);
      } catch (err) {
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, [fetchRandomVerse]);

  // Lógica de filtro dos livros
  const filteredBooks = books.filter(book => 
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const oldTestamentBooks = filteredBooks.filter(book => book.testament_id === 1);
  const newTestamentBooks = filteredBooks.filter(book => book.testament_id === 2);

  if (loading) {
    return <p className="loading-message">Carregando...</p>;
  }
  if (error) {
    return <p className="error-message-home">{error}</p>;
  }

  return (
    <div className="home-container">
      <h1>Bibliafy</h1>

      {/* Componente do Versículo do Dia */}
      {randomVerse && (
        <div className="verse-of-the-day">
          <button className="refresh-btn" onClick={fetchRandomVerse} title="Buscar outro versículo">
            <RefreshIcon />
          </button>
          <p className="verse-of-the-day-text">"{randomVerse.text}"</p>
          <p className="verse-of-the-day-ref">{`${randomVerse.book_name} ${randomVerse.chapter}:${randomVerse.verse}`}</p>
        </div>
      )}

      <div className="search-container">
        <input 
          type="search"
          placeholder="Pesquisar livro..."
          className="search-bar"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <section className="testament-section">
        <h2 onClick={() => setIsOldTestamentOpen(!isOldTestamentOpen)}>
          Velho Testamento
          <span className={`arrow-icon ${isOldTestamentOpen ? 'open' : ''}`}>▼</span>
        </h2>
        {isOldTestamentOpen && (
          <div className="books-list">
            {oldTestamentBooks.map(book => (
              <Link to={`/livro/${book.id}`} key={book.id} className="book-link">
                <div className="book-card">
                  <h3>{book.name}</h3>
                  <p>({book.abbreviation})</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="testament-section">
        <h2 onClick={() => setIsNewTestamentOpen(!isNewTestamentOpen)}>
          Novo Testamento
          <span className={`arrow-icon ${isNewTestamentOpen ? 'open' : ''}`}>▼</span>
        </h2>
        {isNewTestamentOpen && (
          <div className="books-list">
            {newTestamentBooks.map(book => (
              <Link to={`/livro/${book.id}`} key={book.id} className="book-link">
                <div className="book-card new-testament">
                  <h3>{book.name}</h3>
                  <p>({book.abbreviation})</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;