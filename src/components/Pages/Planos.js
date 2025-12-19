import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useConfirmModal } from '../../context/ConfirmModalContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Planos.css';
import '../GlobalLayout.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

function Planos() {
    const { showNotification } = useNotification();
    const { showConfirm } = useConfirmModal();
    const [planos, setPlanos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form states
    const [nome, setNome] = useState('');
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');

    useEffect(() => {
        fetchPlanos();
    }, []);

    const fetchPlanos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/planos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPlanos(data);
            }
        } catch (error) {
            console.error("Erro ao buscar planos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!nome || !valor) return showNotification('Nome e Valor são obrigatórios', 'warning');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/planos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome, valor, descricao })
            });

            if (res.ok) {
                setShowForm(false);
                setNome('');
                setValor('');
                setDescricao('');
                fetchPlanos();
                showNotification('Plano salvo com sucesso!', 'success');
            } else {
                showNotification('Erro ao salvar plano', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Erro ao conectar com o servidor', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm('Excluir Plano', 'Tem certeza que deseja excluir este plano?');
        if (!confirmed) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/planos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchPlanos();
            } else {
                showNotification('Erro ao excluir plano', 'error');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="planos-container" style={{ width: '100%' }}>
            <div style={{ padding: '20px' }}>
                
                {/* Header com Botão de Adicionar */}
                <div className="planos-header">
                    <h2>Seus Planos</h2>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="btn-add-plano"
                    >
                        Novo Plano
                    </button>
                </div>

                {/* Formulário de Criação */}
                {showForm && (
                    <div className="plano-form-container">
                        <form onSubmit={handleSave} className="plano-form">
                            <div className="form-group">
                                <label>Nome do Plano</label>
                                <input 
                                    type="text" 
                                    value={nome} 
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Ex: Internet 500MB"
                                />
                            </div>
                            <div className="form-group">
                                <label>Valor (R$)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={valor} 
                                    onChange={(e) => setValor(e.target.value)}
                                    placeholder="99.90"
                                />
                            </div>
                            <div className="form-group">
                                <label>Descrição (Opcional)</label>
                                <input 
                                    type="text" 
                                    value={descricao} 
                                    onChange={(e) => setDescricao(e.target.value)}
                                    placeholder="Detalhes do plano..."
                                />
                            </div>
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    onClick={() => setShowForm(false)}
                                    className="btn-cancel"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-save"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista de Planos */}
                <LoadingSpinner isLoading={loading} />
                {!loading && (
                    planos.length === 0 ? (
                    <div className="empty-planos">
                        <p>Nenhum plano cadastrado.</p>
                    </div>
                ) : (
                    <div className="planos-grid">
                        {planos.map(plano => (
                            <div key={plano.id} className="plano-card">
                                <div className="plano-card-header">
                                    <h3>{plano.nome}</h3>
                                    <button 
                                        onClick={() => handleDelete(plano.id)}
                                        className="btn-delete-plano"
                                        title="Excluir"
                                    >
                                        Excluir
                                    </button>
                                </div>
                                
                                <div className="plano-value">
                                    R$ {plano.valor.toFixed(2)}
                                </div>

                                {plano.descricao && (
                                    <div className="plano-desc">
                                        {plano.descricao}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}

            </div>
        </div>
    );
}

export default Planos;
