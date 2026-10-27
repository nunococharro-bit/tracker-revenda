import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, RefreshCw, Trash2, TrendingUp, ExternalLink 
} from 'lucide-react';

export default function App() {
  const [termos, setTermos] = useState(() => {
    const salvos = localStorage.getItem('revenda_termos');
    return salvos ? JSON.parse(salvos) : ['polaroid', 'pez elvis', 'camera vintage'];
  });
  
  const [novoTermo, setNovoTermo] = useState('');
  
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
      }
    ];
  });

  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    localStorage.setItem('revenda_termos', JSON.stringify(termos));
  }, [termos]);

  useEffect(() => {
    localStorage.setItem('revenda_produtos', JSON.stringify(produtos));
  }, [produtos]);

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

  // --- FUNÇÃO PARA IMPORTAR O FICHEIRO DO GOOGLE COLAB ---
  const importarJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = (e) => {
      try {
        const novosProdutos = JSON.parse(e.target.result);
        const idsExistentes = new Set(produtos.map(p => p.id));
        const filtrados = novosProdutos.filter(p => !idsExistentes.has(p.id));
        
        setProdutos(prev => [...filtrados, ...prev]);
        alert(`✅ ${filtrados.length} novos artigos importados com sucesso para o painel!`);
      } catch (err) {
        alert("❌ Erro ao ler o ficheiro JSON.");
      }
    };
  };

  const totalInvestido = produtos
    .filter(p => ['assinalado', 'entrega', 'revenda'].includes(p.estado))
    .reduce((acc, p) => acc + p.precoAtual, 0);

  const lucroPotencialTotal = produtos
    .filter(p => p.estado !== 'vendido')
    .reduce((acc, p) => acc + (p.precoVenda - p.precoAtual), 0);

  const produtosFiltrados = produtos.filter(p => 
    filtroEstado === 'todos' ? true : p.estado === filtroEstado
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-400">Arbitrage Tracker Pro</h1>
              <p className="text-xs text-slate-400">Monitorização & Revenda OLX + Vinted</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-sm">
            <div>
              <span className="text-slate-400 text-xs">Investido:</span> <span className="text-amber-400 font-bold">{totalInvestido.toFixed(2)}€</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div>
              <span className="text-slate-400 text-xs">Lucro Est.:</span> <span className="text-emerald-400 font-bold">+{lucroPotencialTotal.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* PAINEL LATERAL COM O BOTÃO DE IMPORTAR */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" /> Termos de Pesquisa
            </h2>

            <form onSubmit={adicionarTermo} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ex: polaroid..."
                value={novoTermo}
                onChange={(e) => setNovoTermo(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 mb-6">
              {termos.map((termo) => (
                <div key={termo} className="flex justify-between items-center px-3 py-2 rounded-lg text-sm bg-slate-900 border border-slate-800 text-slate-300">
                  <span className="capitalize"># {termo}</span>
                  <button onClick={() => removerTermo(termo)} className="text-slate-600 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* AQUI ESTÁ O BOTÃO PARA CARREGAR O FICHEIRO DO COLAB */}
            <div className="border-t border-slate-800 pt-4">
              <label className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition font-bold shadow-lg shadow-emerald-600/20">
                📥 Importar Ficheiro do Colab (.json)
                <input type="file" accept=".json" onChange={importarJSON} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-500 text-center mt-2">Selecione o ficheiro <b>produtos_encontrados.json</b> que descarregou.</p>
            </div>
          </div>
        </div>

        {/* LISTA DE PRODUTOS */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
            {['todos', 'monitorizar', 'assinalado', 'entrega', 'revenda', 'vendido'].map(f => (
              <button
                key={f}
                onClick={() => setFiltroEstado(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition whitespace-nowrap ${
                  filtroEstado === f ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {produtosFiltrados.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img src={item.imagem || 'https://via.placeholder.com/150'} alt={item.titulo} className="w-16 h-16 object-cover rounded-xl border border-slate-800 bg-slate-900" />
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
                        {item.plataforma}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 mt-1">{item.titulo}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 mb-4 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Preço Atual</span>
                      <span className="text-sm font-bold text-slate-200">{item.precoAtual?.toFixed(2)}€</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Alvo Compra</span>
                      <span className="text-sm font-bold text-amber-400">{item.alvoCompra?.toFixed(2)}€</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Revenda Est.</span>
                      <span className="text-sm font-bold text-emerald-400">{item.precoVenda?.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir Anúncio
                  </a>

                  <div className="flex items-center gap-2">
                    {item.estado === 'monitorizar' && (
                      <button onClick={() => MudarEstadoProduto(item.id, 'assinalado')} className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-medium">
                        Assinalar
                      </button>
                    )}
                    {item.estado === 'assinalado' && (
                      <button onClick={() => MudarEstadoProduto(item.id, 'entrega')} className="bg-amber-600/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-medium">
                        Em Trânsito
                      </button>
                    )}
                    {item.estado === 'entrega' && (
                      <button onClick={() => MudoEstadoProduto(item.id, 'revenda')} onClick={() => MudarEstadoProduto(item.id, 'revenda')} className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium">
                        À Venda
                      </button>
                    )}
                    {item.estado === 'revenda' && (
                      <button onClick={() => MudarEstadoProduto(item.id, 'vendido')} className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg text-xs font-medium">
                        Vendido
                      </button>
                    )}
                    <button onClick={() => eliminarProduto(item.id)} className="text-slate-600 hover:text-rose-400 p-1.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
