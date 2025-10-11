import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './Book.css';

function Book() {
  const [chapters, setChapters] = useState([]);
  const [bookName, setBookName] = useState(''); // Estado para o nome do livro
  const [loading, setLoading] = useState(true);
  const { bookId } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        // Busca os capítulos e os detalhes do livro em paralelo
        const chaptersPromise = api.get(`/api/bible/books/${bookId}/chapters`);
        const booksPromise = api.get('/api/bible/books'); // Busca todos para achar o nome
        
        const [chaptersResponse, booksResponse] = await Promise.all([chaptersPromise, booksPromise]);

        setChapters(chaptersResponse.data);
        
        const currentBook = booksResponse.data.find(b => b.id == bookId);
        if (currentBook) {
          setBookName(currentBook.name);
        }

      } catch (err) {
        console.error("Erro ao buscar dados do livro:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [bookId]);

  if (loading) {
    return <p className="loading-message">Carregando...</p>;
  }

  return (
    <div className="book-container">
      <h1>{bookName}</h1>
      <h2>Selecione um Capítulo</h2>
      <div className="chapters-grid">
        {chapters.map(chapterNum => (
          // AGORA É UM LINK PARA A PÁGINA DE VERSÍCULOS
          <Link to={`/livro/${bookId}/capitulo/${chapterNum}`} key={chapterNum} className="chapter-link">
            {chapterNum}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Book;