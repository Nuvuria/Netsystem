import React, { useEffect, useState } from 'react';
import ResponsiveLayout from '../Layout/ResponsiveLayout';
import { useNotification } from '../../context/NotificationContext';
import { useConfirmModal } from '../../context/ConfirmModalContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Agenda.css';
import '../GlobalLayout.css';

function Agenda() {
  const { showNotification } = useNotification();
  const { showConfirm } = useConfirmModal();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFinalizados, setShowFinalizados] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
  const userId = localStorage.getItem('userId');
  const PUBLIC_LINK = `${window.location.origin}/agendamento-externo?uid=${userId}`;

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agenda`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setAgendamentos(data);
      } else {
        console.error('Erro ao carregar agenda');
        showNotification('Erro ao carregar agenda', 'error');
      }
    } catch (e) {
      console.error(e);
      showNotification('Erro ao conectar com servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    carregar(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copiarLink = () => {
    navigator.clipboard.writeText(PUBLIC_LINK);
    showNotification('Link copiado!', 'success');
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const res = await fetch(`${API_BASE}/agenda/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: novoStatus })
      });
      if (res.ok) carregar();
    } catch (e) {
      console.error(e);
      showNotification('Erro ao atualizar status', 'error');
    }
  };

  const excluir = async (id) => {
    const confirmed = await showConfirm('Excluir Agendamento', 'Excluir este agendamento?');
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE}/agenda/${id}`, { 
          method: 'DELETE',
          headers: getHeaders()
      });
      if (res.ok) carregar();
    } catch (e) {
      console.error(e);
      showNotification('Erro ao excluir', 'error');
    }
  };

  const getWhatsappLink = (phone) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    return `https://wa.me/${finalPhone}?text=Olá, gostaria de confirmar o agendamento.`;
  };

  const avisados = agendamentos.filter(i => i.status === 'Avisado');
  const finalizados = agendamentos.filter(i => i.status === 'Finalizado' || i.status === 'Concluído' || i.status === 'Pago');
  const pendentes = agendamentos.filter(i => i.status !== 'Avisado' && i.status !== 'Finalizado' && i.status !== 'Concluído' && i.status !== 'Pago');

  const renderCard = (item) => (
    <div key={item.id} className="agenda-card">
      <div className="card-header">
        <span className={`badge-type ${item.tipo === 'Instalação' ? 'badge-inst' : 'badge-rep'}`}>
          {item.tipo}
        </span>
        <span className={`badge-status status-${item.status?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
          {item.status === 'Concluído' || item.status === 'Pago' ? 'Finalizado' : item.status}
        </span>
      </div>

      <div className="card-body">
        <h4>{item.nome}</h4>
        <div className="phone">📞 {item.telefone}</div>

        <div className="info-row">
          <span className="info-icon">📍</span>
          <span>{item.endereco}</span>
        </div>
        
        {item.data && (
          <div className="info-row">
            <span className="info-icon">🗓️</span>
            <span>{new Date(item.data).toLocaleDateString()}</span>
          </div>
        )}
        
        {item.descricao && (
          <div className="info-row">
            <span className="info-icon">📝</span>
            <span style={{fontStyle: 'italic', color: 'var(--text-muted)'}}>{item.descricao}</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button 
          className="btn-action btn-delete" 
          onClick={() => excluir(item.id)}
          title="Excluir"
        >
          Excluir
        </button>
        
        {item.status !== 'Finalizado' && item.status !== 'Concluído' && item.status !== 'Pago' && (
           <a 
             href={getWhatsappLink(item.telefone)} 
             target="_blank" 
             rel="noopener noreferrer" 
             className="btn-action btn-whatsapp"
             onClick={() => {
                if (item.status !== 'Avisado') {
                   atualizarStatus(item.id, 'Avisado');
                }
             }}
           >
             Contatar
           </a>
        )}

        {item.status !== 'Finalizado' && item.status !== 'Concluído' && item.status !== 'Pago' && (
          <button 
            className="btn-action btn-conclude" 
            onClick={() => atualizarStatus(item.id, 'Finalizado')}
          >
            Finalizado
          </button>
        )}
      </div>
    </div>
  );

  return (
    <ResponsiveLayout title="Agenda de Serviços">
      <div className="agenda-container">
        
        {/* Header com Link */}
        <div className="agenda-header-card">
          <div className="agenda-header-content">
            <h3>🔗 Link de Agendamento</h3>
            <p>Envie este link para o cliente solicitar o serviço.</p>
          </div>
          <div className="link-box">
            <span>{PUBLIC_LINK}</span>
            <button className="btn-copy" onClick={copiarLink}>Copiar</button>
          </div>
        </div>

        {/* Controles */}
        <div className="agenda-controls">
          <button className="btn-refresh" onClick={carregar}>
            Atualizar
          </button>
        </div>

        <LoadingSpinner isLoading={loading} />

        {!loading && (
          <>
            {/* Seção Avisados */}
            {avisados.length > 0 && (
               <div className="section-avisados">
                  <h3 className="section-title">⚠️ Clientes Avisados (Aguardando Confirmação)</h3>
                  <div className="agenda-grid">
                     {avisados.map(renderCard)}
                  </div>
               </div>
            )}

            {/* Seção Pendentes */}
            <div className="section-pendentes">
               <h3 className="section-title">Solicitações ({pendentes.length})</h3>
               <div className="agenda-grid">
                  {pendentes.length === 0 ? (
                    <p style={{color: 'var(--text-muted)'}}>Nenhuma solicitação pendente.</p>
                  ) : (
                    pendentes.map(renderCard)
                  )}
               </div>
            </div>

            {/* Seção Finalizados */}
            {finalizados.length > 0 && (
               <div className="section-finalizado">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                      <h3 className="section-title" style={{marginBottom: 0, borderBottom: 'none'}}>✅ Finalizados ({finalizados.length})</h3>
                      <button 
                        onClick={() => setShowFinalizados(!showFinalizados)}
                        className="btn-refresh"
                        style={{fontSize: '0.9rem', padding: '6px 12px'}}
                      >
                        {showFinalizados ? 'Ocultar' : 'Visualizar'}
                      </button>
                  </div>
                  
                  {showFinalizados && (
                      <div className="scroll-container">
                        <div className="agenda-grid">
                            {finalizados.map(renderCard)}
                        </div>
                      </div>
                  )}
               </div>
            )}
          </>
        )}
      </div>
    </ResponsiveLayout>
  );
}

export default Agenda;
