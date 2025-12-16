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
  const youtubeEmbedUrl =
    process.env.REACT_APP_LOGIN_VIDEO_URL ||
    'https://youtu.be/oMBw9MVHvAw';
  const [player, setPlayer] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const toggleAudio = () => {
    if (!player) return;
    try {
      if (audioEnabled) {
        player.mute();
        setAudioEnabled(false);
      } else {
        player.unMute();
        player.setVolume(100);
        setAudioEnabled(true);
      }
    } catch {}
  };

  const extractYouTubeId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) {
        if (u.pathname.startsWith('/embed/')) {
          return u.pathname.split('/embed/')[1].split('?')[0];
        }
        if (u.pathname === '/watch') {
          return u.searchParams.get('v');
        }
      }
      if (u.hostname === 'youtu.be') {
        return u.pathname.slice(1);
      }
    } catch {}
    return 'dQw4w9WgXcQ';
  };

  useEffect(() => {
    const scriptId = 'yt-iframe-api';
    if (!document.getElementById(scriptId)) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.id = scriptId;
      document.body.appendChild(tag);
    }
    const initPlayer = () => {
      const id = extractYouTubeId(youtubeEmbedUrl);
      if (window.YT && window.YT.Player) {
        new window.YT.Player('yt-player', {
          width: '100%',
          height: '100%',
          videoId: id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            loop: 1,
            playlist: id,
          },
          events: {
            onReady: (e) => {
              try {
                e.target.mute();
              } catch {}
              e.target.playVideo();
              setPlayer(e.target);
              setAudioEnabled(false);
            },
            onStateChange: (ev) => {
              try {
                const playingState =
                  (window.YT && window.YT.PlayerState && window.YT.PlayerState.PLAYING) || 1;
                if (ev.data !== playingState) {
                  ev.target.playVideo();
                }
              } catch {}
            },
          },
        });
      }
    };
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [youtubeEmbedUrl]);

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
    <div className="login-page">
      <div className="desktop-left">
        <div id="yt-player" />
        {player && (
          <button
            className="unmute-btn"
            onClick={toggleAudio}
          >
            {audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
          </button>
        )}
      </div>
      <div className="desktop-right">
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
      </div>
    </div>
  );
};

export default Login;
