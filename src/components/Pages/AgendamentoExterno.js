import React, { useState } from 'react';
import './AgendamentoExterno.css';

const AgendamentoExterno = () => {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    tipo: 'Instalação',
    descricao: '',
    data: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Erro ao enviar solicitação. Tente novamente.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="agendamento-externo-container success">
        <div className="success-card">
          <h1>✅ Solicitação Enviada!</h1>
          <p>Recebemos seu pedido de agendamento.</p>
          <p>Em breve entraremos em contato para confirmar.</p>
          <button onClick={() => setSubmitted(false)} className="btn-new">Novo Agendamento</button>
        </div>
      </div>
    );
  }

  return (
    <div className="agendamento-externo-container">
      <div className="form-card">
        <h1>📅 Agendar Serviço</h1>
        <p className="subtitle">Preencha os dados abaixo para solicitar instalação ou reparo.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Completo *</label>
            <input 
              type="text" 
              name="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              required 
              placeholder="Seu nome"
            />
          </div>

          <div className="form-group">
            <label>Telefone / WhatsApp *</label>
            <input 
              type="text" 
              name="telefone" 
              value={formData.telefone} 
              onChange={handleChange} 
              required 
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group">
            <label>Endereço Completo *</label>
            <input 
              type="text" 
              name="endereco" 
              value={formData.endereco} 
              onChange={handleChange} 
              required 
              placeholder="Rua, Número, Bairro, Cidade"
            />
          </div>

          <div className="form-group">
            <label>Tipo de Serviço *</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange}>
              <option value="Instalação">Instalação</option>
              <option value="Reparo">Reparo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Data Preferencial (Opcional)</label>
            <input 
              type="date" 
              name="data" 
              value={formData.data} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Descrição / Observações</label>
            <textarea 
              name="descricao" 
              value={formData.descricao} 
              onChange={handleChange} 
              placeholder="Descreva o problema ou detalhes adicionais..."
              rows="4"
            ></textarea>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Solicitação'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgendamentoExterno;
