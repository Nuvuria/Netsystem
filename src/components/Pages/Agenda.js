import React, { useEffect, useState } from 'react';
import ResponsiveLayout from '../Layout/ResponsiveLayout';
import './Agenda.css';
import '../GlobalLayout.css';

function Agenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';
  const PUBLIC_LINK = `${window.location.origin}/agendamento-externo`;

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agenda`);
      if (res.ok) {
        const data = await res.json();
        setAgendamentos(data);
      } else {
        console.error('Erro ao carregar agenda');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const copiarLink = () => {
    navigator.clipboard.writeText(PUBLIC_LINK);
    alert('Link copiado!');
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const res = await fetch(`${API_BASE}/agenda/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      if (res.ok) carregar();
    } catch (e) {
      console.error(e);
      alert('Erro ao atualizar status');
    }
  };

  const excluir = async (id) => {
    if (!window.confirm('Excluir este agendamento?')) return;
    try {
      const res = await fetch(`${API_BASE}/agenda/${id}`, { method: 'DELETE' });
      if (res.ok) carregar();
    } catch (e) {
      console.error(e);
      alert('Erro ao excluir');
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
            <span style={{fontStyle: 'italic', color: '#bbb'}}>{item.descricao}</span>
          </div>
        )}
      </div>

      <div className="card-actions">
        <button 
          className="btn-action btn-delete" 
          onClick={() => excluir(item.id)}
          title="Excluir"
        >
          🗑️
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
             📱 Contatar
           </a>
        )}

        {item.status !== 'Finalizado' && item.status !== 'Concluído' && item.status !== 'Pago' && (
          <button 
            className="btn-action btn-conclude" 
            onClick={() => atualizarStatus(item.id, 'Finalizado')}
          >
            ✅ Finalizado
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
            🔄 Atualizar
          </button>
        </div>

        {loading ? <p>Carregando...</p> : (
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
                    <p style={{color: '#aaa'}}>Nenhuma solicitação pendente.</p>
                  ) : (
                    pendentes.map(renderCard)
                  )}
               </div>
            </div>

            {/* Seção Finalizados */}
            {finalizados.length > 0 && (
               <div className="section-finalizado">
                  <h3 className="section-title">✅ Finalizados ({finalizados.length})</h3>
                  <div className="scroll-container">
                    <div className="agenda-grid">
                        {finalizados.map(renderCard)}
                    </div>
                  </div>
               </div>
            )}
          </>
        )}
      </div>
    </ResponsiveLayout>
  );
}

export default Agenda;
