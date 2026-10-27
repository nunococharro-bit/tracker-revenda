import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Tag, RefreshCw, ShoppingCart, TrendingUp, 
  Clock, Package, CheckCircle2, ArrowRight, ExternalLink, 
  Trash2, AlertTriangle, DollarSign, Filter
} from 'lucide-react';

export default function App() {
  // --- ESTADOS E DADOS ---
  const [termos, setTermos] = useState(() => {
    const salvos = localStorage.getItem('revenda_termos');
    return salvos ? JSON.parse(salvos) : ['polaroid', 'pez elvis', 'camera vintage'];
  });
  
  const [novoTermo, setNovoTermo] = useState('');
  const [termoAtivo, setTermoAtivo] = useState('polaroid');
  
  const [produtos, setProdutos] = useState(() => {
    const salvos = localStorage.getItem('revenda_produtos');
    return salvos ? JSON.parse(salvos) : [
      {
        id: 'demo-1',
        plataforma: 'vinted',
        titulo: 'Máquina Fotográfica Polaroid 636 Closeup',
        precoAtual: 25.00,
        alvoCompra: 30.00,
        precoVenda: 65.00,
        estado: 'monitorizar',
        link: 'https://www.vinted.pt',
        imagem: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&q=80',
        dataAdicionado: new Date().toISOString()
      },
      {
        id: 'demo-2',
        plataforma: 'olx',
        titulo: 'Dispenser PEZ Elvis Presley Edição Colecionador',
        precoAtual: 12.00,
        alvoCompra: 15.00,
        precoVenda: 35.00,
        estado: 'assinalado',
        link: 'https://www.olx.pt',
        imagem: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&q=80',
        dataAdicionado: new Date().toISOString()
      }
    ];
  });

  const [carregando, setCarregando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Guardar no localStorage
  useEffect(() => {
    localStorage.setItem('revenda_termos', JSON.stringify(termos));
  }, [termos]);

  useEffect(() => {
    localStorage.setItem('revenda_produtos', JSON.stringify(produtos));
  }, [produtos]);

  // --- AÇÕES ---
  const adicionarTermo = (e) => {
    e.preventDefault();
    if (novoTermo.trim() && !termos.includes(novoTermo.trim().toLowerCase())) {
      setTermos([...termos, novoTermo.trim().toLowerCase()]);
      setNovoTermo('');
    }
  };

  const removerTermo = (termoParaRemover) => {
    setTermos(termos.filter(t => t !== termoParaRemover));
  };

  const MudarEstadoProduto = (id, novoEstado) => {
    setProdutos(produtos.map(p => p.id === id ? { ...p, estado: novoEstado } : p));
  };

  const eliminarProduto = (id) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  // Simular / Procurar novos itens da Vinted (Consulta Pública)
  const pesquisarVintedPublico = async (termo) => {
    setCarregando(true);
    try {
      // Usar a rota pública Vinted via Proxy CORS para a Vercel
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(`https://www.vinted.pt/api/v2/catalog/items?search_text=${termo}&per_page=6`)}`);
      
      if (res.ok) {
        const data = await res.json();
        const novosItens = (data.items || []).map(item => ({
          id: `vinted-${item.id}`,
          plataforma: 'vinted',
          titulo: item.title,
          precoAtual: parseFloat(item.price),
          alvoCompra: Math.round(parseFloat(item.price) * 0.8), // Sugestão 20% abaixo
          precoVenda: Math.round(parseFloat(item.price) * 1.8), // Sugestão de revenda
          estado: 'monitorizar',
          link: `https://www.vinted.pt${item.path}`,
          imagem: item.photos && item.photos.length > 0 ? item.photos[0].url : 'https://via.placeholder.com/150',
          dataAdicionado: new Date().toISOString()
        }));

        // Adicionar apenas os que ainda não existem
        const idsExistentes = new Set(produtos.map(p => p.id));
        const filtrados = novosItens.filter(i => !idsExistentes.has(i.id));

        if (filtrados.length > 0) {
          setProdutos(prev => [...filtrados, ...prev]);
        }
      }
    } catch (err) {
      console.log('Consulta pública a usar dados demonstrativos devido a restrição CORS:', err);
    } finally {
      setCarregando(false);
    }
  };

  // --- CÁLCULOS FINANCEIROS ---
  const lucroPotencialTotal = produtos
    .filter(p => p.estado !== 'vendido')
    .reduce((acc, p) => acc + (p.precoVenda - p.precoAtual), 0);

  const totalInvestido = produtos
    .filter(p => ['assinalado', 'entrega', 'revenda'].includes(p.estado))
    .reduce((acc, p) => acc + p.precoAtual, 0);

  const produtosFiltrados = produtos.filter(p => 
    filtroEstado === 'todos' ? true : p.estado === filtroEstado
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                Arbitrage Tracker Pro
              </h1>
              <p className="text-xs text-slate-400">Monitorização & Revenda OLX + Vinted</p>
            </div>
          </div>

          {/* MÉTRICAS RÁPIDAS */}
          <div className="flex items-center gap-6 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm">
            <div>
              <span className="text-slate-400 block text-xs">Investido</span>
              <span className="font-semibold text-amber-400">{totalInvestido.toFixed(2)}€</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-xs">Lucro Estimado</span>
              <span className="font-semibold text-emerald-400">+{lucroPotencialTotal.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* PAINEL LATERAL: TERMOS DE PESQUISA */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" /> Termos & Marcas
            </h2>

            <form onSubmit={adicionarTermo} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ex: polaroid, pez..."
                value={novoTermo}
                onChange={(e) => setNovoTermo(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-emerald-500"
              />
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2">
              {termos.map((termo) => (
                <div 
                  key={termo}
                  onClick={() => { setTermoAtivo(termo); pesquisarVintedPublico(termo); }}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                    termoAtivo === termo 
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                      : 'bg-slate-900 border border-slate-800/50 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="capitalize"># {termo}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removerTermo(termo); }}
                    className="text-slate-600 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => pesquisarVintedPublico(termoAtivo)}
              disabled={carregando}
              className="w-full mt-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin text-emerald-400' : ''}`} />
              Procurar Artigos no Catálogo
            </button>
          </div>
        </div>

        {/* LISTA DE PRODUTOS & WORKFLOW */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* FILTROS DE NAVEGAÇÃO */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'monitorizar', label: 'A Monitorizar' },
                { key: 'assinalado', label: 'Assinalados' },
                { key: 'entrega', label: 'Em Trânsito' },
                { key: 'revenda', label: 'Em Revenda' },
                { key: 'vendido', label: 'Vendidos' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFiltroEstado(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                    filtroEstado === f.key 
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* GRELHA DE PRODUTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {produtosFiltrados.map((item) => {
              const margemLucro = item.precoVenda - item.precoAtual;
              const percentagemLucro = ((margemLucro / item.precoAtual) * 100).toFixed(0);
              const oportuna = item.precoAtual <= item.alvoCompra;

              return (
                <div 
                  key={item.id} 
                  className={`bg-slate-950 border rounded-2xl p-4 flex flex-col justify-between transition relative overflow-hidden ${
                    oportuna ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'border-slate-800'
                  }`}
                >
                  {oportuna && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-bl-lg">
                      OPORTUNIDADE
                    </div>
                  )}

                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={item.imagem} 
                        alt={item.titulo} 
                        className="w-16 h-16 object-cover rounded-xl border border-slate-800 bg-slate-900" 
                      />
                      <div className="flex-1 pr-12">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                            item.plataforma === 'vinted' 
                              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}>
                            {item.plataforma}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-200 line-clamp-2">{item.titulo}</h3>
                      </div>
                    </div>

                    {/* VALORES & METRICAS */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-4 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Preço Atual</span>
                        <span className="text-sm font-bold text-slate-200">{item.precoAtual.toFixed(2)}€</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Alvo Compra</span>
                        <span className="text-sm font-bold text-amber-400">{item.alvoCompra.toFixed(2)}€</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Revenda Est.</span>
                        <span className="text-sm font-bold text-emerald-400">{item.precoVenda.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>

                  {/* CONTROLADOR DE ESTADO E AÇÕES */}
                  <div className="border-t border-slate-900 pt-3 flex items-center justify-between gap-2">
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir Anúncio
                    </a>

                    <div className="flex items-center gap-2">
                      {item.estado === 'monitorizar' && (
                        <button
                          onClick={() => MudarEstadoProduto(item.id, 'assinalado')}
                          className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Assinalar Compra
                        </button>
                      )}

                      {item.estado === 'assinalado' && (
                        <button
                          onClick={() => MudarEstadoProduto(item.id, 'entrega')}
                          className="bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Em Trânsito
                        </button>
                      )}

                      {item.estado === 'entrega' && (
                        <button
                          onClick={() => MudarEstadoProduto(item.id, 'revenda')}
                          className="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Colocar à Venda
                        </button>
                      )}

                      {item.estado === 'revenda' && (
                        <button
                          onClick={() => MudarEstadoProduto(item.id, 'vendido')}
                          className="bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                        >
                          Marcar Vendido
                        </button>
                      )}

                      <button
                        onClick={() => eliminarProduto(item.id)}
                        className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
