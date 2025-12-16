import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [manterLogado, setManterLogado] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const navigate = useNavigate();

  // Verificar se já está logado ao carregar
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const manterLogadoSalvo = localStorage.getItem('manterLogado');
    
    if (userId && manterLogadoSalvo === 'true') {
      navigate('/inicio');
    }
  }, [navigate]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userName', data.nome);
        localStorage.setItem('token', data.token);
        
        // Salvar preferência "manter logado"
        if (manterLogado) {
          localStorage.setItem('manterLogado', 'true');
        } else {
          localStorage.removeItem('manterLogado');
        }
        
        alert('✅ Login realizado com sucesso!');
        navigate('/inicio');
      } else {
        alert(`❌ Erro: ${data.message || 'Falha no login.'}`);
      }
    } catch (error) {
      console.error('Erro ao logar:', error);
      alert('❌ Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="manter-logado">
          <input
            type="checkbox"
            id="manterLogado"
            checked={manterLogado}
            onChange={(e) => setManterLogado(e.target.checked)}
          />
          <label htmlFor="manterLogado">Manter logado</label>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Entrar'}
        </button>

        <div className="extra-options">
          
        </div>

        <div className="app-download-section" style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '15px' }}>
          <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '10px' }}>Baixe nossos aplicativos:</p>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button 
              onClick={handleInstallClick}
              className="download-apk-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#333',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #555',
                transition: 'all 0.3s',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '1rem',
                width: '100%'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#444'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#333'}
            >
              <span style={{ fontSize: '1.2rem' }}>🤖</span> Baixar Android
            </button>
            
            <button 
              onClick={handleInstallClick}
              className="download-win-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#0078d7',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #005a9e',
                transition: 'all 0.3s',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '1rem',
                width: '100%'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1084d9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0078d7'}
            >
              <span style={{ fontSize: '1.2rem' }}>💻</span> Baixar Windows
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;

