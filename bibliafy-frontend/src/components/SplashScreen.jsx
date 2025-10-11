import React from 'react';
import './SplashScreen.css';
import logoImage from '../../public/logo.jpg';

function SplashScreen() {
  // Partículas para efeito sobre o vídeo
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 6 + Math.random() * 6
  }));

  return (
    <div className="splash-screen">
      {/* Vídeo de fundo */}
      <div className="video-background">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          poster="/path/to/poster.jpg" // Fallback image
        >
      <source src="../../public/video.mp4" type="video/mp4" />
          {/* Fallback caso o vídeo não carregue */}
        </video>
      </div>
      
      {/* Overlay para melhor contraste */}
      <div className="overlay"></div>
      
      {/* Partículas flutuantes */}
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="splash-container">
        <div className="logo-wrapper">
          <div className="logo-glow"></div>
          <img 
            src={logoImage} 
            alt="Bibliafy" 
            className="splash-logo" 
          />
        </div>
        
        <h1 className="splash-title">Bibliafy</h1>
        
        <p className="splash-subtitle">
          Conectando você com a <br/>Palavra de Deus
        </p>
        
        <div className="loading-container">
          <div className="loading-text">Carregando...</div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;