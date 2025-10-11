import React, { useState } from 'react';
import './NoteModal.css';

function NoteModal({ verse, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!verse) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      verse_id: verse.id,
      title,
      content
    });
    // Limpa os campos após salvar
    setTitle('');
    setContent('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Anotação para {verse.bookName} {verse.chapter}:{verse.number}</h3>
        <p className="verse-preview">"{verse.text}"</p>
        
        <form onSubmit={handleSave} className="note-form">
          <input 
            type="text" 
            placeholder="Título da anotação" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea 
            placeholder="Escreva sua anotação aqui..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          ></textarea>
          <button type="submit">Salvar Anotação</button>
        </form>
      </div>
    </div>
  );
}

export default NoteModal;