import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import NoteModal from '../components/NoteModal';
import './Anotacoes.css';

// Ícones
const EditIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const DeleteIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


function Anotacoes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [editingNote, setEditingNote] = useState(null); // Estado para controlar o modal de edição

  const fetchNotes = useCallback(async () => {
    try {
      const response = await api.get('/api/notes', { headers: { Authorization: `Bearer ${token}` } });
      setNotes(response.data);
    } catch (error) {
      console.error("Erro ao buscar anotações", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDeleteNote = async (noteId) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter isso!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      customClass: { popup: 'swal2-popup' }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/notes/${noteId}`, { headers: { Authorization: `Bearer ${token}` } });
        setNotes(currentNotes => currentNotes.filter(n => n.id !== noteId));
        Swal.fire({ title: 'Excluído!', text: 'Sua anotação foi excluída.', icon: 'success', customClass: { popup: 'swal2-popup' } });
      } catch (error) {
        Swal.fire({ title: 'Erro!', text: 'Não foi possível excluir a anotação.', icon: 'error', customClass: { popup: 'swal2-popup' } });
      }
    }
  };
  
  const handleUpdateNote = async (noteData) => {
    try {
      const { title, content } = noteData;
      await api.put(`/api/notes/${editingNote.id}`, { title, content }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingNote(null); // Fecha o modal
      fetchNotes(); // Recarrega as anotações para mostrar a alteração
      Swal.fire({ icon: 'success', title: 'Anotação atualizada!', showConfirmButton: false, timer: 1500, customClass: { popup: 'swal2-popup' } });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível atualizar a anotação.', customClass: { popup: 'swal2-popup' } });
    }
  };

  if (loading) {
    return <p className="loading-message">Carregando anotações...</p>;
  }

  return (
    <>
      <div className="anotacoes-container">
        <h1>Minhas Anotações</h1>
        <div className="notes-list">
          {notes.length > 0 ? (
            notes.map(note => (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-actions">
                    <button onClick={() => setEditingNote(note)} className="note-action-btn" title="Editar"><EditIcon /></button>
                    <button onClick={() => handleDeleteNote(note.id)} className="note-action-btn" title="Excluir"><DeleteIcon /></button>
                  </div>
                </div>
                <p className="note-content">{note.content}</p>
                <div className="verse-quote">
                  <span className="verse-quote-text">"{note.verse_text}"</span>
                  <span className="verse-quote-ref">{`${note.book_name} ${note.chapter}:${note.verse}`}</span>
                </div>
              </div>
            ))
          ) : (
            <p>Você ainda não criou nenhuma anotação.</p>
          )}
        </div>
      </div>
      
      {editingNote && (
        <NoteModal 
          verse={{ 
            id: editingNote.verse_id, 
            text: editingNote.verse_text,
            number: editingNote.verse,
            chapter: editingNote.chapter,
            bookName: editingNote.book_name
          }} 
          initialData={{ title: editingNote.title, content: editingNote.content }}
          onClose={() => setEditingNote(null)} 
          onSave={handleUpdateNote} 
        />
      )}
    </>
  );
}

export default Anotacoes;