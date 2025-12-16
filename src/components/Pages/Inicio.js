import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import ResponsiveLayout from '../Layout/ResponsiveLayout';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import '../GlobalLayout.css';
import './Inicio.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function Inicio() {
  // const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    vencendoHoje: 0,
    planos: [],
    clientesVencidos: [],
    clientesPagos: []
  });
  const [clientesVencendo, setClientesVencendo] = useState([]);
  const [clientesVencendo5Dias, setClientesVencendo5Dias] = useState([]);
  const [agendamentosPendentes, setAgendamentosPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const userName = localStorage.getItem('userName');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchAgenda();
  }, []);

  const fetchAgenda = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/agenda`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAgendamentosPendentes(data.filter(i => i.status === 'Pendente'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const concluirAgendamento = async (id) => {
      if(!window.confirm('Marcar como finalizado?')) return;
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_BASE}/agenda/${id}`, {
              method: 'PATCH',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ status: 'Finalizado' })
          });
          if (res.ok) fetchAgenda();
      } catch (e) {
          console.error(e);
      }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { headers });
      if (res.status === 401 || res.status === 403) {
          // Handle logout redirect if needed
          return;
      }
      const data = await res.json();
      setStats(data);

      const pagouEsteMes = (dataPagamento) => {
        if (!dataPagamento) return false;
        const d = new Date(dataPagamento);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      };

      // Buscar lista de clientes vencendo hoje
      const today = new Date();
      const todayDay = today.getDate().toString();
      const resClientes = await fetch(`${API_BASE}/clientes?vencimento=${todayDay}`, { headers });
      const dataClientes = await resClientes.json();
      if (Array.isArray(dataClientes)) {
        // Filter out clients who already paid this month
        const filteredVencendo = dataClientes.filter(c => !pagouEsteMes(c.dataUltimoPagamento));
        setClientesVencendo(filteredVencendo);
      }

      // Buscar lista de clientes vencendo em 5 dias
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureDay = futureDate.getDate().toString();
      const resClientesFuturo = await fetch(`${API_BASE}/clientes?vencimento=${futureDay}`, { headers });
      const dataClientesFuturo = await resClientesFuturo.json();
      if (Array.isArray(dataClientesFuturo)) {
        // Filter out clients who already paid this month
        const filteredFuturo = dataClientesFuturo.filter(c => !pagouEsteMes(c.dataUltimoPagamento));
        setClientesVencendo5Dias(filteredFuturo);
      }

    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarWhatsapp = (cliente) => {
    if (!window.confirm(`Você tem certeza que deseja cobrar ${cliente.nome}?`)) return;
    if (!cliente.numeroTelefone) {
        alert("Cliente sem número de telefone cadastrado.");
        return;
    }
    const message = "Olá! 🔔 Lembramos que sua mensalidade vence hoje. 🗓️ Para garantir a continuidade dos serviços e evitar bloqueios, por favor, realize o pagamento. 💳 Agradecemos a preferência! 🤝";
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/55${cliente.numeroTelefone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const handleEnviarWhatsappLembrete = (cliente) => {
    if (!window.confirm(`Você tem certeza que deseja enviar lembrete para ${cliente.nome}?`)) return;
    if (!cliente.numeroTelefone) {
        alert("Cliente sem número de telefone cadastrado.");
        return;
    }
    const message = "Olá! 👋 Apenas um lembrete amigável: sua mensalidade vence em 5 dias. 🗓️ Se programe para evitar atrasos! 🚀 Agradecemos a parceria! 🤝";
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/55${cliente.numeroTelefone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const handleRegistrarPagamento = async (cliente) => {
    if (!window.confirm(`Você tem certeza que deseja confirmar o pagamento de ${cliente.nome}?`)) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/clientes/${cliente.id}/pagamento`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.ok) {
            // alert('Pagamento registrado com sucesso!'); // Feedback visual rápido é melhor, talvez remover o alert se for incômodo, mas manter por segurança
            fetchDashboardData(); // Recarrega os dados e remove o cliente da lista
        } else {
            alert('Erro ao registrar pagamento.');
        }
    } catch (e) {
        console.error(e);
        alert('Erro ao conectar com o servidor.');
    }
  };

  const handleEnviarWhatsappCobranca = (cliente) => {
    if (!window.confirm(`Você tem certeza que deseja cobrar ${cliente.nome}?`)) return;
    if (!cliente.numeroTelefone) {
        alert("Cliente sem número de telefone cadastrado.");
        return;
    }
    const message = `Olá ${cliente.nome}! ⚠️ Notamos que sua mensalidade venceu dia ${cliente.vencimento}. 🗓️ Por favor, regularize seu pagamento para evitar a suspensão dos serviços. 💳 Se já pagou, desconsidere. 🤝`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/55${cliente.numeroTelefone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const dataGrafico = [
    { name: 'Ativos', value: stats.clientesAtivos },
    { name: 'Inativos/Outros', value: stats.totalClientes - stats.clientesAtivos }
  ];

  const COLORS = ['#00ff00', '#555555'];

  return (
    <ResponsiveLayout title="">
      <div className="inicio-container">
        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <>
            {/* Seção de Agenda e Link */}
            <div className="agenda-section-inicio" style={{marginBottom: '20px'}}>
                
                {agendamentosPendentes.length > 0 && (
                    <div className="pendentes-card" style={{
                        background: 'rgba(255, 193, 7, 0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #ffc107',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{color: '#ffc107', marginTop: 0}}>⚠️ Solicitações de Agenda Pendentes ({agendamentosPendentes.length})</h3>
                        <div className="pendentes-grid" style={{display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px'}}>
                            {agendamentosPendentes.map(item => (
                                <div key={item.id} style={{background: '#222', padding: '15px', borderRadius: '8px', border: '1px solid #444'}}>
                                    <h4 style={{margin: '0 0 5px 0', color: '#fff'}}>{item.nome}</h4>
                                    <p style={{margin: '0 0 5px 0', color: '#aaa'}}>{item.tipo}</p>
                                    <p style={{margin: '0 0 10px 0', color: '#ddd'}}>📞 {item.telefone}</p>
                                    <div style={{display: 'flex', gap: '10px'}}>
                                        <a 
                                            href={`https://wa.me/55${item.telefone?.replace(/\D/g, '')}?text=Olá, gostaria de confirmar o agendamento.`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                flex: 1, textAlign: 'center', background: '#25D366', color: '#fff', 
                                                padding: '8px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem'
                                            }}
                                        >
                                            Whatsapp
                                        </a>
                                        <button 
                                            onClick={() => concluirAgendamento(item.id)}
                                            style={{
                                                flex: 1, background: '#28a745', color: '#fff', border: 'none',
                                                padding: '8px', borderRadius: '4px', cursor: 'pointer'
                                            }}
                                        >
                                            Finalizar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="kpi-grid">
              <div className="kpi-card">
                <h3>Total Clientes</h3>
                <p className="kpi-value">{stats.totalClientes}</p>
              </div>
              <div className="kpi-card danger">
                <h3>Clientes Atrasados</h3>
                <p className="kpi-value">{stats.clientesVencidos?.length || 0}</p>
              </div>
              <div className="kpi-card success">
                <h3>Clientes Pagos</h3>
                <p className="kpi-value">{stats.clientesPagos?.length || 0}</p>
                <small>Este Mês</small>
              </div>
              <div className="kpi-card alert">
                <h3>Vencendo Hoje</h3>
                <p className="kpi-value">{stats.vencendoHoje}</p>
                <small>Dia {new Date().getDate()}</small>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Coluna da Esquerda: Gráfico */}
              <div className="left-column">
                <div className="chart-card">
                  <h3>Status dos Clientes</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={dataGrafico}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? "40%" : 60}
                          outerRadius={isMobile ? "70%" : 80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dataGrafico.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#333', border: 'none' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-card">
                  <h3>Planos Mais Utilizados</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer>
                      <BarChart
                        data={stats.planos || []}
                        layout="vertical"
                        margin={isMobile ? { top: 5, right: 10, left: 10, bottom: 5 } : { top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                        <XAxis type="number" stroke="#ccc" hide={isMobile} />
                        <YAxis dataKey="name" type="category" stroke="#ccc" width={isMobile ? 50 : 100} tick={{fill: '#ccc', fontSize: isMobile ? 10 : 12}} />
                        <Tooltip 
                          cursor={{fill: '#2a2a2a'}}
                          contentStyle={{ backgroundColor: '#333', border: 'none' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="value" fill="#2196F3" barSize={isMobile ? 15 : 20} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Coluna da Direita: Listas */}
              <div className="right-column">
                <div className="chart-card overdue-card">
                    <div className="card-header">
                        <h3>🚫 Vencidos / Atrasados</h3>
                        <span className="badge-count overdue">{stats.clientesVencidos ? stats.clientesVencidos.length : 0}</span>
                    </div>
                    {(!stats.clientesVencidos || stats.clientesVencidos.length === 0) ? (
                    <p className="empty-msg">Nenhum cliente com pagamento atrasado.</p>
                    ) : (
                    <ul className="vencendo-list">
                        {stats.clientesVencidos.map(cliente => (
                        <li key={cliente.id} className="vencendo-item">
                            <div className="vencendo-info">
                                <strong>{cliente.nome}</strong>
                                <span>{cliente.vencimento}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                    className="btn-slim cobranca"
                                    onClick={() => handleEnviarWhatsappCobranca(cliente)}
                                    title="Cobrar Atraso"
                                >
                                    Cobrar
                                </button>
                                <button 
                                    className="btn-slim pago"
                                    onClick={() => handleRegistrarPagamento(cliente)}
                                    title="Já pagou"
                                >
                                    Pago
                                </button>
                            </div>
                        </li>
                        ))}
                    </ul>
                    )}
                </div>

                <div className="chart-card warning-card">
                    <div className="card-header">
                        <h3>🚨 Vencendo Hoje</h3>
                        <span className="badge-count">{clientesVencendo.length}</span>
                    </div>
                    {clientesVencendo.length === 0 ? (
                    <p className="empty-msg">Nenhum cliente vencendo hoje.</p>
                    ) : (
                    <ul className="vencendo-list">
                        {clientesVencendo.map(cliente => (
                        <li key={cliente.id} className="vencendo-item">
                            <div className="vencendo-info">
                                <strong>{cliente.nome}</strong>
                                <span>{cliente.numeroTelefone}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                    className="btn-slim cobranca"
                                    onClick={() => handleEnviarWhatsapp(cliente)}
                                    title="Enviar cobrança"
                                >
                                    Cobrar
                                </button>
                                <button 
                                    className="btn-slim pago"
                                    onClick={() => handleRegistrarPagamento(cliente)}
                                    title="Já pagou"
                                >
                                    Pago
                                </button>
                            </div>
                        </li>
                        ))}
                    </ul>
                    )}
                </div>

                <div className="chart-card info-card">
                    <div className="card-header">
                        <h3>⚠️ Vencendo em 5 Dias</h3>
                        <span className="badge-count info">{clientesVencendo5Dias.length}</span>
                    </div>
                    {clientesVencendo5Dias.length === 0 ? (
                    <p className="empty-msg">Nenhum cliente vencendo em 5 dias.</p>
                    ) : (
                    <ul className="vencendo-list">
                        {clientesVencendo5Dias.map(cliente => (
                        <li key={cliente.id} className="vencendo-item">
                            <div className="vencendo-info">
                                <strong>{cliente.nome}</strong>
                                <span>{cliente.numeroTelefone}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                    className="btn-slim lembrete"
                                    onClick={() => handleEnviarWhatsappLembrete(cliente)}
                                    title="Enviar lembrete"
                                >
                                    Lembrar
                                </button>
                                <button 
                                    className="btn-slim pago"
                                    onClick={() => handleRegistrarPagamento(cliente)}
                                    title="Já pagou"
                                >
                                    Pago
                                </button>
                            </div>
                        </li>
                        ))}
                    </ul>
                    )}
                </div>

                <div className="chart-card success-card" style={{ marginTop: '25px' }}>
                    <div className="card-header">
                        <h3>✅ Já Pagaram (Mês Atual)</h3>
                        <span className="badge-count success">{stats.clientesPagos ? stats.clientesPagos.length : 0}</span>
                    </div>
                    {(!stats.clientesPagos || stats.clientesPagos.length === 0) ? (
                    <p className="empty-msg">Nenhum pagamento registrado este mês.</p>
                    ) : (
                    <ul className="vencendo-list">
                        {stats.clientesPagos.map(cliente => (
                        <li key={cliente.id} className="vencendo-item">
                            <div className="vencendo-info">
                                <strong>{cliente.nome}</strong>
                                <span>Pago em: {new Date(cliente.dataUltimoPagamento).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <span className="btn-slim pago" style={{ cursor: 'default' }}>Pago</span>
                            </div>
                        </li>
                        ))}
                    </ul>
                    )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ResponsiveLayout>
  );
}

export default Inicio;
