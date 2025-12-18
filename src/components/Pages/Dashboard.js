import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import './Dashboard.css';
import '../GlobalLayout.css';

const Dashboard = () => {
  const navigate = useNavigate();

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
        
        {/* Gráfico 1: Notificação do Sistema */}
        <div className="chart-container">
          <h3 className="chart-title">Notificações</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notificationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                <XAxis dataKey="name" stroke="#ccc" tick={{ fontSize: 10 }} interval={0} />
                <YAxis stroke="#ccc" tick={{ fontSize: 10 }} width={30} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f1f2e', border: 'none', color: '#fff', fontSize: '12px' }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Total de Clientes */}
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
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#00d4ff" 
                  strokeWidth={2} 
                  dot={{ r: 2, fill: '#00d4ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
