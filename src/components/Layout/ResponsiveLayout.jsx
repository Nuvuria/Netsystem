import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import '../GlobalLayout.css';
import './ResponsiveLayout.css';

const ResponsiveLayout = ({ children, title }) => {
  const { showNotification } = useNotification();
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


/*
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
*/
  /*
  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
    { path: '/inicio', label: 'Início', icon: '🏠' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    { path: '/relatorio', label: 'Relatório', icon: '📊' },
    { path: '/chatbot', label: 'Chatbot', icon: '🤖' },
    { path: '/', label: 'Logout', icon: '🚪' }
  ];

  const isActivePage = (path) => {
    return location.pathname === path;
  };
  */

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div 
      className="app-container responsive-layout-container"
      style={{ '--mobile-bg': "url('/backgroundmobile.jpeg')" }}
    >


      {/* Sidebar REMOVED via Commenting out */}
      {/* 
      <nav className="app-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            🚀 Mensalix
          </h2>
        </div>

        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`nav-button ${isActivePage(item.path) ? 'active' : ''}`}
          >
            {item.icon} {item.label}
          </button>
        ))}

        <button 
          onClick={() => window.location.reload()} 
          title="Atualizar"
          className="update-button"
        >
          🔄
        </button>
      </nav>
      */}

      {/* Conteúdo Principal */}
      <main className="app-content">
        {!isMobile && title && (
          <header className="content-header">
            <div className="header-flex">
              <h1 className="page-title">
                {title}
              </h1>
            </div>
          </header>
        )}
        
        {children}
      </main>

      {/* Universal Footer (Mobile & Desktop) */}
      <footer className="universal-footer">
        <nav className="footer-nav">
          <button
            className="footer-btn dashboard-home-btn"
            onClick={() => handleNavigation('/dashboard')}
            title="Voltar ao Dashboard"
          >
            <div className="btn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" className="icone-neon-mensalix">
                    <defs>
                        <linearGradient id="gradiente-mensalix-layout" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9D00FF" />
                            <stop offset="100%" stopColor="#00D4FF" />
                        </linearGradient>
                    </defs>
                    <path stroke="url(#gradiente-mensalix-layout)" d="M4 20 L4 4 L12 16 L20 4 L20 20" />
                </svg>
            </div>
          </button>
        </nav>
      </footer>
    </div>
  );
};

export default ResponsiveLayout;
