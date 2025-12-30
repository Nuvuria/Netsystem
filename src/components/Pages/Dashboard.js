import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useConfirmModal } from '../../context/ConfirmModalContext';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './Dashboard.css';
import '../GlobalLayout.css';
import '../Layout/ResponsiveLayout.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { showConfirm } = useConfirmModal();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Falha ao buscar dados do dashboard');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      showNotification('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm('Sair do Sistema', 'Tem certeza que deseja sair?');
    if (!confirmed) return;

    localStorage.removeItem('userId');
    localStorage.removeItem('manterLogado');
    showNotification('Logout efetuado com sucesso!', 'info');
    navigate('/');
  };

  const cards = [
    {
      title: 'Cobranças',
      image: '/inicio.png',
      path: '/inicio',
      description: 'Gestão de cobranças'
    },
    {
      title: 'Financeiro',
      image: '/relatorio.jpeg',
      path: '/relatorio',
      description: 'Relatórios financeiros'
    },
    {
      title: 'Chatbot IA',
      image: '/chatbot.jpeg',
      path: '/chatbot',
      description: 'Assistente virtual'
    },
    {
      title: 'Clientes',
      image: '/clientes.jpeg',
      path: '/clientes',
      description: 'Gestão de clientes'
    }
  ];

  // Dados reais de planos
  const planosData = dashboardData?.planos && dashboardData.planos.length > 0
    ? dashboardData.planos
    : [
        { name: 'Nenhum', value: 0 }
      ];

  const clientesData = dashboardData?.clientesData && dashboardData.clientesData.length > 0
    ? dashboardData.clientesData
    : [
        { name: 'Jan', total: 0 },
        { name: 'Fev', total: 0 },
        { name: 'Mar', total: 0 },
        { name: 'Abr', total: 0 },
        { name: 'Mai', total: 0 },
        { name: 'Jun', total: 0 },
      ];

  // Faturamento Real ou Placeholder
  const faturamentoData = dashboardData?.faturamentoData && dashboardData.faturamentoData.length > 0
    ? dashboardData.faturamentoData
    : [
        { name: 'Jan', valor: 0 },
        { name: 'Fev', valor: 0 },
        { name: 'Mar', valor: 0 },
        { name: 'Abr', valor: 0 },
        { name: 'Mai', valor: 0 },
        { name: 'Jun', valor: 0 },
      ];

  const agendaPendentes = dashboardData?.agendaPendentes || [];

  const formatCurrency = (value) => {
    if (value >= 1000) return `R$ ${value/1000}k`;
    return `R$ ${value}`;
  };

  return (
    <div 
      className="dashboard-container"
      style={{ '--mobile-bg': "url('/backgroundmobile.jpeg')" }}
    >
     
      
      {/* Logout Button Top Left */}
      <button
        onClick={handleLogout}
        title="Sair"
        style={{ 
          position: 'absolute', 
          top: '5px', 
          left: '2px', 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer',
          zIndex: 1000,
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="btn-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" className="icone-neon-mensalix" style={{ stroke: 'url(#gradiente-mensalix-logout)' }}>
                <defs>
                    <linearGradient id="gradiente-mensalix-logout" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9D00FF" />
                        <stop offset="100%" stopColor="#00D4FF" />
                    </linearGradient>
                </defs>
                <path d="M19 12H5M12 19L5 12L12 5" />
            </svg>
        </div>
      </button>

      {/* Seção de Navegação (Cards) */}
      <div className="dashboard-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="dashboard-card"
            onClick={() => navigate(card.path)}
            title={card.title}
          >
            <div className="card-image-wrapper">
              <img src={card.image} alt={card.title} className="card-image" />
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Gráficos */}
      <div className="dashboard-charts-section">
        {/* Gráfico de Planos */}
        <div className="chart-container">
          <h3 className="chart-title">Planos Mais Utilizados</h3>
          <div className="chart-wrapper">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={planosData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                  <XAxis dataKey="name" stroke="#ccc" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis stroke="#ccc" tick={{ fontSize: 10 }} width={30} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    contentStyle={{ backgroundColor: '#1f1f2e', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" barSize={20}>
                    {planosData.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Clientes */}
        <div className="chart-container">
          <h3 className="chart-title">Clientes</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="name" stroke="#ccc" tick={{ fontSize: 10 }} interval={0} />
                <YAxis stroke="#ccc" tick={{ fontSize: 10 }} width={30} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f2e', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Faturamento Mensal */}
        <div className="chart-container">
          <h3 className="chart-title">Faturamento Mensal</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={faturamentoData}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="name" stroke="#ccc" tick={{ fontSize: 10 }} interval={0} />
                <YAxis 
                  stroke="#ccc" 
                  tick={{ fontSize: 10 }} 
                  width={40}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f2e', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#82ca9d" 
                  fillOpacity={1} 
                  fill="url(#colorValor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Agenda Pendentes */}
        <div className="chart-container" style={{ overflowY: 'auto' }}>
          <h3 className="chart-title">Notificações Agenda (Pendentes)</h3>
          <div className="agenda-list" style={{ padding: '10px', color: '#fff' }}>
             {agendaPendentes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#ccc' }}>Nenhuma pendência na agenda.</p>
             ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {agendaPendentes.map(item => (
                        <li key={item.id} style={{ 
                            marginBottom: '8px', 
                            padding: '8px', 
                            backgroundColor: 'rgba(255,255,255,0.05)', 
                            borderRadius: '4px',
                            borderLeft: '3px solid #ffaa00'
                        }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.nome}</div>
                            <div style={{ fontSize: '12px', color: '#ccc' }}>
                                {new Date(item.data).toLocaleDateString()} - {item.tipo}
                            </div>
                        </li>
                    ))}
                </ul>
             )}
          </div>
        </div>
      </div>

      {/* Universal Footer (Same as ResponsiveLayout) */}
      <footer className="universal-footer">
        <nav className="footer-nav" style={{ position: 'relative' }}>
          
          <button
            className="footer-btn dashboard-home-btn"
            onClick={() => window.location.reload()}
            title="Atualizar Dashboard"
          >
            <div className="btn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" className="icone-neon-mensalix">
                    <defs>
                        <linearGradient id="gradiente-mensalix" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9D00FF" />
                            <stop offset="100%" stopColor="#00D4FF" />
                        </linearGradient>
                    </defs>
                    <path d="M4 20 L4 4 L12 16 L20 4 L20 20" />
                </svg>
            </div>
          </button>
        </nav>
      </footer>
    </div>
  );
};

export default Dashboard;
