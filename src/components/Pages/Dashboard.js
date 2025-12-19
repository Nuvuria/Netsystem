import React from 'react';
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

  // Dados fictícios para os gráficos
  const notificationData = [
    { name: 'Erro', value: 2, fill: '#ff4d4f' },
    { name: 'Aviso', value: 5, fill: '#faad14' },
    { name: 'Info', value: 12, fill: '#1890ff' },
  ];

  const clientesData = [
    { name: 'Jan', total: 45 },
    { name: 'Fev', total: 52 },
    { name: 'Mar', total: 48 },
    { name: 'Abr', total: 61 },
    { name: 'Mai', total: 67 },
    { name: 'Jun', total: 75 },
  ];

  const faturamentoData = [
    { name: 'Jan', valor: 12500 },
    { name: 'Fev', valor: 15000 },
    { name: 'Mar', valor: 14200 },
    { name: 'Abr', valor: 18000 },
    { name: 'Mai', valor: 21000 },
    { name: 'Jun', valor: 25000 },
  ];

  const agendaData = [
    { name: 'Seg', pendentes: 4 },
    { name: 'Ter', pendentes: 7 },
    { name: 'Qua', pendentes: 2 },
    { name: 'Qui', pendentes: 9 },
    { name: 'Sex', pendentes: 5 },
  ];

  const formatCurrency = (value) => {
    return `R$ ${value/1000}k`;
  };

  return (
    <div 
      className="dashboard-container"
      style={{ '--mobile-bg': "url('/backgroundmobile.jpeg')" }}
    >
     
      
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
        {/* Gráfico de Notificações */}
        <div className="chart-container">
          <h3 className="chart-title">Notificações</h3>
          <div className="chart-wrapper">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={notificationData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f1f2e', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
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
        <div className="chart-container">
          <h3 className="chart-title">Notificações Agenda</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agendaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="name" stroke="#ccc" tick={{ fontSize: 10 }} interval={0} />
                <YAxis stroke="#ccc" tick={{ fontSize: 10 }} width={30} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f2e', border: 'none', color: '#fff', fontSize: '12px' }} 
                />
                <Bar dataKey="pendentes" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Universal Footer (Same as ResponsiveLayout) */}
      <footer className="universal-footer">
        <nav className="footer-nav" style={{ position: 'relative' }}>
          <button
            className="footer-btn logout-btn"
            onClick={handleLogout}
            title="Sair"
            style={{ position: 'absolute', left: '20px' }}
          >
            <div className="btn-icon">🚪</div>
          </button>

          <button
            className="footer-btn dashboard-home-btn"
            onClick={() => window.location.reload()}
            title="Atualizar Dashboard"
          >
            <div className="btn-icon">⚡</div>
          </button>
        </nav>
      </footer>
    </div>
  );
};

export default Dashboard;
