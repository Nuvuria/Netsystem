import React from 'react';
import '../GlobalLayout.css';
import './Chatbot.css';
 
 const Chatbot = () => {
  const handleOpenChatbot = () => {
    const width = 1200;
    const height = 800;
    const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
    const top = Math.max(0, Math.floor((window.screen.height - height) / 2));
    const features = `popup=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},left=${left},top=${top}`;
    const win = window.open('https://web.whatsapp.com', 'MensalixWhats', features);
    if (!win) {
      alert('Permita pop-ups no navegador para abrir o WhatsApp Web.');
      return;
    }
    win.focus();
  };
 
  return (
    <div className="chatbot-page-container">
      <div className="chatbot-container">
        <div className="chatbot-card">
          <div className="chatbot-header">
            <h2>🤖 Chatbot WhatsApp</h2>
            <span className="badge-tech">Web</span>
          </div>
          
          <p className="chatbot-desc">
            Utilize esta ferramenta para conectar seu WhatsApp. A versão web abre o WhatsApp Web em nova aba.
          </p>
          
          <div className="features-grid">
             <div className="feature-item">
                <span className="check-icon">✅</span>
                <span>WhatsApp Web</span>
             </div>
             <div className="feature-item">
                <span className="check-icon">✅</span>
                <span>Sem instalação</span>
             </div>
             <div className="feature-item">
                <span className="check-icon">✅</span>
                <span>Login rápido</span>
             </div>
          </div>

          <button 
            className="btn-chatbot-launch"
            onClick={handleOpenChatbot}
          >
            Abrir WhatsApp Web
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
