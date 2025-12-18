import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../GlobalLayout.css';
import './ResponsiveLayout.css';

const ResponsiveLayout = ({ children, title }) => {
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
    if (path === '/') {
      // Lógica de Logout
      localStorage.removeItem('userId');
      localStorage.removeItem('manterLogado');
      alert('🔒 Logout efetuado com sucesso!');
    }
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
            <div className="btn-icon">⚡</div>
          </button>
        </nav>
      </footer>
    </div>
  );
};

export default ResponsiveLayout;
