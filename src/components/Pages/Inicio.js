import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useNotification } from '../../context/NotificationContext';
import { useConfirmModal } from '../../context/ConfirmModalContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import '../GlobalLayout.css';
import './Inicio.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function Inicio() {
  const { showNotification } = useNotification();
  const { showConfirm } = useConfirmModal();
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
  const [clientesPendentesInstalacao, setClientesPendentesInstalacao] = useState([]);
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
      const confirmed = await showConfirm('Finalizar Agendamento', 'Tem certeza que deseja marcar como finalizado?');
      if (!confirmed) return;
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
        const filteredVencendo = dataClientes
          .filter(c => !pagouEsteMes(c.dataUltimoPagamento))
          .filter(c => (c.status || '').toLowerCase() !== 'inativo')
          .filter(c => (c.status || '').toLowerCase() !== 'pendente');
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
        const filteredFuturo = dataClientesFuturo
          .filter(c => !pagouEsteMes(c.dataUltimoPagamento))
          .filter(c => (c.status || '').toLowerCase() !== 'inativo')
          .filter(c => (c.status || '').toLowerCase() !== 'pendente');
        setClientesVencendo5Dias(filteredFuturo);
      }

      // Buscar clientes com Status Pendente (instalação)
      const resPendentes = await fetch(`${API_BASE}/clientes?status=Pendente`, { headers });
      const dataPendentes = await resPendentes.json();
      if (Array.isArray(dataPendentes)) {
        const filteredPendentes = dataPendentes
          .filter(c => (c.status || '').toLowerCase() === 'pendente')
          .filter(c => (c.status || '').toLowerCase() !== 'inativo');
        setClientesPendentesInstalacao(filteredPendentes);
      }

    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarWhatsapp = async (cliente) => {
    const confirmed = await showConfirm('Confirmar Cobrança', `Você tem certeza que deseja cobrar ${cliente.nome}?`);
    if (!confirmed) return;
    if (!cliente.numeroTelefone) {
        showNotification("Cliente sem número de telefone cadastrado.", "error");
        return;
    }
    const message = "Olá! 🔔 Lembramos que sua mensalidade vence hoje. 🗓️ Para garantir a continuidade dos serviços e evitar bloqueios, por favor, realize o pagamento. 💳 Agradecemos a preferência! 🤝";
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/55${cliente.numeroTelefone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const handleEnviarWhatsappLembrete = async (cliente) => {
    const confirmed = await showConfirm('Enviar Lembrete', `Você tem certeza que deseja enviar lembrete para ${cliente.nome}?`);
    if (!confirmed) return;
    if (!cliente.numeroTelefone) {
        showNotification("Cliente sem número de telefone cadastrado.", "error");
        return;
    }
    const message = "Olá! 👋 Apenas um lembrete amigável: sua mensalidade vence em 5 dias. 🗓️ Se programe para evitar atrasos! 🚀 Agradecemos a parceria! 🤝";
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/55${cliente.numeroTelefone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const handleEnviarWhatsappInstalacao = async (cliente) => {
    const confirmed = await showConfirm('Enviar Instalação', `Enviar mensagem de instalação para ${cliente.nome}?`);
    if (!confirmed) return;
    if (!cliente.numeroTelefone) {
        showNotification("Cliente sem número de telefone cadastrado.", "error");
        return;
    }
    const message = "Olá, você ja está disponivel para instalação da sua internet ?";
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/55${cliente.numeroTelefone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const handleRegistrarPagamento = async (cliente) => {
    const confirmed = await showConfirm('Registrar Pagamento', `Você tem certeza que deseja confirmar o pagamento de ${cliente.nome}?`);
    if (!confirmed) return;

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
            showNotification('Pagamento registrado com sucesso!', 'success');
            fetchDashboardData(); // Recarrega os dados e remove o cliente da lista
        } else {
            showNotification('Erro ao registrar pagamento.', 'error');
        }
    } catch (e) {
        console.error(e);
        showNotification('Erro ao conectar com o servidor.', 'error');
    }
  };

  const handleMarcarInstalado = async (cliente) => {
    const confirmed = await showConfirm('Confirmar Instalação', `Marcar ${cliente.nome} como instalado (Ativo)?`);
    if (!confirmed) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/clientes/${cliente.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Ativo' })
      });
      if (res.ok) {
        fetchDashboardData();
        showNotification('Instalação marcada com sucesso!', 'success');
      } else {
        showNotification('Erro ao atualizar status.', 'error');
      }
    } catch (e) {
      console.error(e);
      showNotification('Erro ao conectar com o servidor.', 'error');
    }
  };

  const handleEnviarWhatsappCobranca = async (cliente) => {
    const confirmed = await showConfirm('Cobrar Atraso', `Você tem certeza que deseja cobrar ${cliente.nome}?`);
    if (!confirmed) return;
    if (!cliente.numeroTelefone) {
        showNotification("Cliente sem número de telefone cadastrado.", "error");
        return;
    }
    const message = `Olá ${cliente.nome}! ⚠️ Notamos que sua mensalidade venceu dia ${cliente.vencimento}. 🗓️ Por favor, regularize seu pagamento para evitar a suspensão dos serviços. 💳 Se já pagou, desconsidere. 🤝`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/55${cliente.numeroTelefone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const hasData = (Number(stats.clientesAtivos) || 0) > 0 || (Number(stats.totalClientes) || 0) > 0;

  const renderStatusChart = () => {
    const ativos = Number(stats.clientesAtivos) || 0;
    const total = Number(stats.totalClientes) || 0;
    const inativos = total - ativos;
    
    // Fallback seguro para evitar divisão por zero
    const percentAtivos = total > 0 ? Math.round((ativos / total) * 100) : 0;
    const percentInativos = total > 0 ? 100 - percentAtivos : 0;

    if (!hasData) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
          Sem dados para exibir
        </div>
      );
    }

    // Versão Simplificada e Robusta (Barras de Progresso CSS)
    return (
      <div style={{ padding: '0', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
            <span style={{ color: '#9D00FF', fontWeight: 'bold' }}>Ativos</span>
            <span style={{ color: '#fff' }}>{ativos} ({percentAtivos}%)</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#333', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${percentAtivos}%`, height: '100%', background: '#9D00FF', transition: 'width 1s ease' }}></div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
            <span style={{ color: '#666', fontWeight: 'bold' }}>Inativos / Outros</span>
            <span style={{ color: '#ccc' }}>{inativos} ({percentInativos}%)</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#333', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${percentInativos}%`, height: '100%', background: '#666', transition: 'width 1s ease' }}></div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlanosChart = () => {
    const planos = stats.planos || [];
    
    if (planos.length === 0) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
          Sem dados de planos
        </div>
      );
    }

    // Encontrar o valor máximo para calcular proporções
    const maxVal = Math.max(...planos.map(p => p.value));

    // Versão Simplificada e Robusta (Lista de Barras CSS)
    return (
      <div style={{ padding: '0', width: '100%', boxSizing: 'border-box', overflowY: 'auto', maxHeight: '300px' }}>
        {planos.map((plano, index) => {
          const percent = maxVal > 0 ? (plano.value / maxVal) * 100 : 0;
          return (
            <div key={index} style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                <span style={{ color: '#fff' }}>{plano.name}</span>
                <span style={{ color: '#00D4FF', fontWeight: 'bold' }}>{plano.value}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, height: '100%', background: '#2196F3', borderRadius: '4px', transition: 'width 1s ease' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
      <div className="inicio-container">
        <LoadingSpinner isLoading={loading} />
        <div className="inicio-content-wrapper">
        {!loading && (
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

            <div className="kpi-aligned-row">
            <div className="kpi-group-left">
              <div className="kpi-card info">
                <h3>Total Clientes</h3>
                <p className="kpi-value">{stats.totalClientes}</p>
              </div>
              <div className="kpi-card danger">
                <h3>Clientes Atrasados</h3>
                <p className="kpi-value">{stats.clientesVencidos?.length || 0}</p>
              </div>
            </div>
            <div className="kpi-group-right">
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
          </div>

          <div className="inicio-content-grid">
            
            <div className="left-column">
              <div className="charts-row">
                  <div className="chart-card">
                    <h3>Status dos Clientes</h3>
                    <div className="chart-wrapper" style={{ minHeight: isMobile ? 'auto' : '250px', position: 'relative' }}>
                      {isMobile ? renderStatusChart() : (
                      !hasData ? (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#aaa', fontSize: '0.9rem'
                        }}>
                          Sem dados para exibir
                        </div>
                      ) : (
                      <ResponsiveContainer key="desktop-pie" width="99%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Ativos', value: Number(stats.clientesAtivos) || 0 },
                              { name: 'Inativos/Outros', value: (Number(stats.totalClientes) || 0) - (Number(stats.clientesAtivos) || 0) }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {['#9D00FF', '#333333'].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #444', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px', color: '#fff' }}/>
                        </PieChart>
                      </ResponsiveContainer>
                      )
                      )}
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>Planos Mais Utilizados</h3>
                    <div className="chart-wrapper" style={{ minHeight: isMobile ? 'auto' : '250px' }}>
                      {isMobile ? renderPlanosChart() : (
                      <ResponsiveContainer key="desktop-bar" width="100%" height="100%">
                        <BarChart
                          data={stats.planos || []}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
                          <XAxis type="number" stroke="#ccc" />
                          <YAxis dataKey="name" type="category" stroke="#ccc" width={100} tick={{fill: '#ccc', fontSize: 12}} />
                          <Tooltip 
                            cursor={{fill: '#2a2a2a'}}
                            contentStyle={{ backgroundColor: '#333', border: 'none' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="value" fill="#2196F3" barSize={20} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>


                <div className="chart-card overdue-card">
                    <div className="card-header">
                        <h3>🚫 Vencidos / Atrasados</h3>
                        <span className="badge-count overdue">{(stats.clientesVencidos || []).filter(c => (c.status || '').toLowerCase() !== 'inativo' && (c.status || '').toLowerCase() !== 'pendente').length}</span>
                    </div>
                    {(!stats.clientesVencidos || (stats.clientesVencidos.filter(c => (c.status || '').toLowerCase() !== 'inativo' && (c.status || '').toLowerCase() !== 'pendente')).length === 0) ? (
                    <p className="empty-msg">Nenhum cliente com pagamento atrasado.</p>
                    ) : (
                    <ul className="vencendo-list">
                        {stats.clientesVencidos
                          .filter(cliente => (cliente.status || '').toLowerCase() !== 'inativo' && (cliente.status || '').toLowerCase() !== 'pendente')
                          .map(cliente => (
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



                <div className="chart-card warning-card installation-card" style={{ marginTop: '25px' }}>
                    <div className="card-header">
                        <h3>📦 Instalação pendente</h3>
                        <span className="badge-count">{clientesPendentesInstalacao.length}</span>
                    </div>
                    {clientesPendentesInstalacao.length === 0 ? (
                      <p className="empty-msg">Nenhum cliente com instalação pendente.</p>
                    ) : (
                      <ul className="vencendo-list">
                        {clientesPendentesInstalacao.map(cliente => (
                          <li key={cliente.id} className="vencendo-item">
                              <div className="vencendo-info">
                                  <strong>{cliente.nome}</strong>
                                  <span>{cliente.numeroTelefone}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '5px' }}>
                                  <button 
                                      className="btn-slim contato"
                                      onClick={() => handleEnviarWhatsappInstalacao(cliente)}
                                      title="Contato"
                                  >
                                      Contato
                                  </button>
                                  <button 
                                      className="btn-slim instalado"
                                      onClick={() => handleMarcarInstalado(cliente)}
                                      title="Marcar como instalado"
                                  >
                                      Instalado
                                  </button>
                              </div>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
              
              {/* Coluna da Direita removida/mesclada */}
            </div>
          </>
        )}
        </div>
      </div>
  );
}

export default Inicio;
