import React, { useEffect, useState } from 'react'; 
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'; 

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'; 

function RelatorioMensalidade() { 
  const [clientes, setClientes] = useState([]); 
  const [totais, setTotais] = useState({ hoje: 0, mes: 0, ano: 0 }); 
  const [porStatus, setPorStatus] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Filtros de Data
  const dataAtual = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(dataAtual.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState('');
  const [pagamentosFiltrados, setPagamentosFiltrados] = useState([]);

  const COLORS = { 
    Ativo: '#00ff00', 
    Pendente: '#ffaa00', 
    Inativo: '#ff4444', 
    Outros: '#8884d8'
  }; 
  const COLORS_LIST = ['#00ff00', '#ffaa00', '#ff4444', '#8884d8', '#0088fe'];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { 
    const token = localStorage.getItem('token');
    
    // 1. Buscar Clientes (para gráficos de status e totais gerais)
    fetch(`${API_BASE}/clientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }) 
      .then(res => res.json()) 
      .then(data => { 
        if (Array.isArray(data)) {
            setClientes(data); 
            calcularStatus(data); 
        }
      }) 
      .catch(console.error);

    // 2. Buscar Relatório Financeiro (Pagamentos)
    fetch(`${API_BASE}/relatorio?mes=${mesSelecionado}&ano=${anoSelecionado}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            setPagamentosFiltrados(data);
            calcularTotais(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  }, [mesSelecionado, anoSelecionado]); 

  const estimarValor = (plano) => {
      if (!plano) return 0;
      const match = plano.match(/R\$\s*([\d,.]+)/i) || plano.match(/(\d+)[.,](\d{2})/);
      if (match) {
          // Lógica simplificada e robusta para extrair valor
          let valorStr = match[1] || match[0];
          valorStr = valorStr.replace('R$', '').trim();
          
          if (valorStr.includes(',') && valorStr.includes('.')) {
              valorStr = valorStr.replace('.', '').replace(',', '.');
          } else if (valorStr.includes(',')) {
              valorStr = valorStr.replace(',', '.');
          }
          
          const valor = parseFloat(valorStr);
          return isNaN(valor) ? 0 : valor;
      }
      return 0;
  };

  const calcularTotais = (pagamentos) => { 
    const agora = new Date(); 
    
    // Total Mês (baseado nos pagamentos retornados pela API que já filtra por mês/ano)
    const totalMes = pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0);
    
    // Total Hoje
    const totalHoje = pagamentos
        .filter(p => {
            const d = new Date(p.dataEvento);
            return d.getDate() === agora.getDate() && 
                   d.getMonth() === agora.getMonth() && 
                   d.getFullYear() === agora.getFullYear();
        })
        .reduce((acc, p) => acc + (p.valor || 0), 0);

    // Total Ano (Estimativa baseada em clientes ativos * 12 ou buscar da API se disponível)
    // Aqui vamos manter o valor acumulado dos pagamentos carregados ou 0 se não tivermos histórico completo
    // Para simplificar e evitar bugs, vamos mostrar o acumulado do mês como principal KPI
    
    setTotais(prev => ({ 
      hoje: totalHoje, 
      mes: totalMes, 
      ano: prev.ano // Mantém o anterior ou 0
    })); 
  }; 

  const calcularStatus = (lista) => { 
    const map = {}; 
    lista.forEach(m => { 
      const status = m.status || 'Outros';
      const statusKey = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      map[statusKey] = (map[statusKey] || 0) + 1;
    }); 

    setPorStatus( 
      Object.entries(map).map(([status, qtd]) => ({ status, qtd })) 
    ); 
  }; 

  return ( 
    <div className="relatorio-container">
      
      {/* Filtros */}
      <div className="filtros-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select 
            value={diaSelecionado} 
            onChange={e => setDiaSelecionado(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: 'none', minWidth: '80px' }}
          >
              <option value="">Dia</option>
              {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
              ))}
          </select>
          <select 
            value={mesSelecionado} 
            onChange={e => setMesSelecionado(Number(e.target.value))}
            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
          >
              {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => (
                  <option key={i} value={i+1}>{m}</option>
              ))}
          </select>
          <select 
            value={anoSelecionado} 
            onChange={e => setAnoSelecionado(Number(e.target.value))}
            style={{ padding: '10px', borderRadius: '5px', border: 'none' }}
          >
              {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
              ))}
          </select>
      </div>

      {loading ? <p style={{color: '#fff', textAlign: 'center'}}>Carregando dados...</p> : (
          <>
            {/* KPIs */} 
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}> 
                <div className="kpi-card" style={{ background: '#333', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #00ff00' }}>
                    <h3 style={{color: '#aaa', margin: '0 0 10px 0'}}>Hoje</h3>
                    <p style={{fontSize: '2em', fontWeight: 'bold', margin: 0}}>R$ {totais.hoje.toFixed(2)}</p>
                </div>
                <div className="kpi-card" style={{ background: '#333', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #00ff00' }}>
                    <h3 style={{color: '#aaa', margin: '0 0 10px 0'}}>Mês Atual</h3>
                    <p style={{fontSize: '2em', fontWeight: 'bold', margin: 0}}>R$ {totais.mes.toFixed(2)}</p>
                </div>
            </div> 

            {/* Gráficos */} 
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}> 
                
                <div className="chart-card" style={{ background: '#333', padding: '20px', borderRadius: '10px' }}> 
                    <h3 style={{ marginBottom: '20px' }}>Status das Mensalidades</h3> 
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart> 
                                <Pie 
                                    data={porStatus} 
                                    dataKey="qtd" 
                                    nameKey="status" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={isMobile ? "40%" : 60}
                                    outerRadius={isMobile ? "70%" : 80}
                                    label 
                                > 
                                {porStatus.map((item, index) => ( 
                                    <Cell key={`cell-${index}`} fill={COLORS[item.status] || COLORS_LIST[index % COLORS_LIST.length]} /> 
                                ))} 
                                </Pie> 
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                                <Legend /> 
                            </PieChart> 
                        </ResponsiveContainer>
                    </div> 
                </div> 

                <div className="chart-card" style={{ background: '#333', padding: '20px', borderRadius: '10px' }}> 
                    <h3 style={{ marginBottom: '20px' }}>Quantidade por Status</h3> 
                    <div style={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={porStatus}> 
                                <XAxis dataKey="status" stroke="#ccc" /> 
                                <YAxis stroke="#ccc" /> 
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} /> 
                                <Bar dataKey="qtd" fill="#00ff00">
                                    {porStatus.map((item, index) => ( 
                                        <Cell key={`cell-${index}`} fill={COLORS[item.status] || COLORS_LIST[index % COLORS_LIST.length]} /> 
                                    ))} 
                                </Bar>
                            </BarChart> 
                        </ResponsiveContainer>
                    </div> 
                </div> 

            </div> 

            {/* Lista de Pagamentos */}
            <div style={{ marginTop: '30px', background: '#333', padding: '20px', borderRadius: '10px' }}>
                <h3>Já Pagaram ({pagamentosFiltrados.filter(p => !diaSelecionado || new Date(p.dataEvento).getDate() == diaSelecionado).length})</h3>
                <div style={{ marginTop: '15px' }}>
                    {pagamentosFiltrados.filter(p => !diaSelecionado || new Date(p.dataEvento).getDate() == diaSelecionado).length === 0 ? (
                        <p style={{ color: '#aaa' }}>Nenhum pagamento registrado neste período.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Cliente</th>
                                    <th style={{ padding: '10px' }}>Valor</th>
                                    <th style={{ padding: '10px' }}>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagamentosFiltrados
                                    .filter(p => !diaSelecionado || new Date(p.dataEvento).getDate() == diaSelecionado)
                                    .map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #444' }}>
                                        <td style={{ padding: '10px' }}>{item.cliente?.nome || 'Desconhecido'}</td>
                                        <td style={{ padding: '10px', color: '#00ff00' }}>R$ {item.valor.toFixed(2)}</td>
                                        <td style={{ padding: '10px', fontSize: '0.9em', color: '#ccc' }}>
                                            {new Date(item.dataEvento).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

          </>
      )}
    </div> 
  ); 
} 

export default RelatorioMensalidade;