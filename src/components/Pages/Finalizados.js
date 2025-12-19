import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import ResponsiveLayout from '../Layout/ResponsiveLayout';
import '../Layout/GlobalLayout.css';
import './Finalizados.css';

const Finalizados = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [comandas, setComandas] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState('semana');
  const [carregando, setCarregando] = useState(false);

  const carregarDadosPorPeriodo = async (periodo) => {
    setCarregando(true);
    try {
      const userId = localStorage.getItem('userId');
      console.log('🔍 Carregando dados para período:', periodo);
      console.log('👤 UserId:', userId);
      
      if (!userId) {
        console.error('❌ UserId não encontrado no localStorage');
        showNotification('Erro: Usuário não autenticado. Faça login novamente.', 'error');
        navigate('/login');
        return;
      }
      
      const agora = new Date();
      let dataInicio;
      
      if (periodo === 'dia') {
        dataInicio = new Date();
        dataInicio.setHours(0, 0, 0, 0);
      } else if (periodo === 'semana') {
        dataInicio = new Date();
        const diaSemana = dataInicio.getDay();
        const distSegunda = diaSemana === 0 ? 6 : diaSemana - 1;
        dataInicio.setDate(dataInicio.getDate() - distSegunda);
        dataInicio.setHours(0, 0, 0, 0);
      }
      
      const dataFim = new Date();
      dataFim.setHours(23, 59, 59, 999);
      
      console.log('📅 Período de busca:', {
        inicio: dataInicio.toLocaleString(),
        fim: dataFim.toLocaleString()
      });
      
      // Buscar comandas finalizadas do período
      console.log('🔄 Buscando comandas...');
      const resComandas = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/comandas/${userId}`);
      
      if (!resComandas.ok) {
        console.error('❌ Erro na requisição de comandas:', resComandas.status);
        throw new Error(`Erro ${resComandas.status} ao buscar comandas`);
      }
      
      const dataComandas = await resComandas.json();
      console.log('📊 Total de comandas recebidas:', dataComandas.length);
      
      const comandasFiltradas = dataComandas
        .filter(c => {
          if (c.status !== 'finalizada') return false;
          const dataEncerramento = new Date(c.encerradaEm);
          return dataEncerramento >= dataInicio && dataEncerramento <= dataFim;
        })
        .sort((a, b) => new Date(b.encerradaEm) - new Date(a.encerradaEm))
        .slice(0, periodo === 'dia' ? 10 : 50) // Limita resultados
        .map(c => ({ ...c, tipo: 'comanda' }));
      
      console.log('✅ Comandas filtradas:', comandasFiltradas.length);
      
      setComandas(comandasFiltradas);
      
      console.log('🎯 Dados carregados com sucesso!');
    } catch (err) {
      console.error('Erro ao carregar dados por período:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosPorPeriodo('semana'); // Carrega dados da semana por padrão
  }, []);

  // Recarrega dados quando o filtro ativo muda
  useEffect(() => {
    carregarDadosPorPeriodo(filtroAtivo);
  }, [filtroAtivo]);

  // Ordena todas as comandas por data de encerramento
  const todosItens = comandas
    .sort((a, b) => new Date(b.encerradaEm) - new Date(a.encerradaEm));

  return (
    <ResponsiveLayout>
      <div className="finalizados-container">
        <div className="finalizados-header-container">
          <h2 className="finalizados-title">Finalizados</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              onClick={() => carregarDadosPorPeriodo(filtroAtivo)} 
              title="Atualizar" 
              className="refresh-button"
            >
              <span className="refresh-icon">↻ Atualizar</span>
            </button>
          </div>
        </div>

        {/* Cards de Filtro por Período */}
        <div className="filters-container">
          <h3 className="filters-title">
            🎯 Filtros por Período
          </h3>
          
          <div className="filters-buttons-wrapper">
            <button
              onClick={() => setFiltroAtivo('dia')}
              className={`filter-button ${filtroAtivo === 'dia' ? 'active' : ''}`}
            >
              DIA
            </button>
            
            <button
              onClick={() => setFiltroAtivo('semana')}
              className={`filter-button ${filtroAtivo === 'semana' ? 'active' : ''}`}
            >
              SEMANA
            </button>
          </div>
          
          <div className="filters-info">
             Mostrando: <strong>{filtroAtivo === 'dia' ? 'Hoje (últimos 10)' : 'Esta Semana (últimos 50)'}</strong> | 
             Total de itens: <strong>{todosItens.length}</strong>
           </div>
        </div>

        {carregando && (
          <div className="loading-state">
            🔄 Carregando dados do {filtroAtivo}...
          </div>
        )}

        <div className="cards-grid">
          {todosItens.length === 0 ? (
            <div className="empty-state">
              Nenhum item finalizado encontrado.
            </div>
          ) : (
            todosItens.map((item) => (
              <div key={item.id} className="comanda-card">
                <h3 className="comanda-title">
                  {item.nome}
                </h3>
                <p className="comanda-total">
                  Total: R$ {item.total.toFixed(2)}
                </p>
                {item.dono && (
                  <p className="comanda-info">
                    Dono: {item.dono}
                  </p>
                )}
                <p className="comanda-date">
                  Encerrado em: {new Date(item.encerradaEm).toLocaleString()}
                </p>
                <span className="comanda-badge">
                  Comanda
                </span>
              </div>
            ))
          )}
        </div>


      </div>
    </ResponsiveLayout>
  );
};

export default Finalizados;

