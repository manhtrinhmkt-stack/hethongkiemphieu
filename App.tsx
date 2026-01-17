
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_CANDIDATES } from './constants';
import { Candidate, TallyState } from './types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { 
  Activity, Trash2, Download, 
  UserPlus, Settings2, AlertCircle,
  Edit2, XCircle, Send, List, Clock, Layout, Palette, CheckCircle2, Trophy, X
} from 'lucide-react';

const THEMES = {
  red: {
    primary: 'bg-red-700',
    secondary: 'bg-yellow-400',
    border: 'border-yellow-400',
    nav: 'bg-red-800',
    accentText: 'text-yellow-300',
    footer: 'bg-red-900',
    chart: ['#DC2626', '#EAB308', '#EF4444', '#FACC15', '#B91C1C', '#D97706']
  },
  blue: {
    primary: 'bg-blue-800',
    secondary: 'bg-amber-400',
    border: 'border-amber-400',
    nav: 'bg-blue-900',
    accentText: 'text-amber-200',
    footer: 'bg-blue-950',
    chart: ['#1E40AF', '#F59E0B', '#3B82F6', '#D97706', '#1E3A8A', '#B45309']
  },
  green: {
    primary: 'bg-emerald-700',
    secondary: 'bg-slate-100',
    border: 'border-white',
    nav: 'bg-emerald-800',
    accentText: 'text-white',
    footer: 'bg-emerald-900',
    chart: ['#059669', '#10B981', '#047857', '#34D399', '#065F46', '#6EE7B7']
  }
} as const;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'results' | 'manage'>('results');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showResultModal, setShowResultModal] = useState(false);
  
  const [displaySettings, setDisplaySettings] = useState(() => {
    const saved = localStorage.getItem('gl_display_v8');
    return saved ? JSON.parse(saved) : {
      headerTitle: "Giáo xứ Tân Thành",
      headerSubtitle: "Ban Giáo Lý Thiếu Nhi",
      footerTerm: "Nhiệm kỳ 2024 - 2027",
      footerLocation: "Tân Thành",
      footerSystem: "Hệ thống bầu cử v4.7",
      theme: 'red',
      availablePositions: ["Trưởng ban", "Phó nội vụ", "Phó ngoại vụ", "Thư ký", "Thủ quỹ"]
    };
  });

  const theme = THEMES[displaySettings.theme as keyof typeof THEMES] || THEMES.red;
  type ThemeName = keyof typeof THEMES;

const setTheme = (next: ThemeName) => {
  setDisplaySettings((prev: any) => ({ ...prev, theme: next }));
};


  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem('gl_candidates_v30');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES;
  });

  const [tally, setTally] = useState<TallyState>(() => {
    const saved = localStorage.getItem('gl_tally_v30');
    if (saved) return JSON.parse(saved);
    const initial: TallyState = { votes: {}, invalid: 0, totalDistributed: 0 };
    candidates.forEach(c => initial.votes[c.id] = 0);
    return initial;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [newPosition, setNewPosition] = useState("");

  useEffect(() => {
    localStorage.setItem('gl_candidates_v30', JSON.stringify(candidates));
    localStorage.setItem('gl_tally_v30', JSON.stringify(tally));
    localStorage.setItem('gl_display_v8', JSON.stringify(displaySettings));
  }, [candidates, tally, displaySettings]);

  const updateVote = (id: string, delta: number) => {
    setTally(prev => ({
      ...prev,
      votes: { ...prev.votes, [id]: Math.max(0, (prev.votes[id] || 0) + delta) }
    }));
  };

  const updateInvalid = (delta: number) => {
    setTally(prev => ({ ...prev, invalid: Math.max(0, prev.invalid + delta) }));
  };

  const updateTotalDistributed = (val: number) => {
    setTally(prev => ({ ...prev, totalDistributed: Math.max(0, val) }));
  };

  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    if (editingId) {
      setCandidates(candidates.map(c => c.id === editingId ? { ...c, name: formName } : c));
      setEditingId(null);
    } else {
      const newId = `c${Date.now()}`;
      setCandidates([...candidates, { id: newId, name: formName, bio: "" }]);
      setTally(prev => ({ ...prev, votes: { ...prev.votes, [newId]: 0 } }));
    }
    setFormName("");
  };

  const addPosition = () => {
    if (!newPosition.trim()) return;
    setDisplaySettings({
      ...displaySettings,
      availablePositions: [...displaySettings.availablePositions, newPosition.trim()]
    });
    setNewPosition("");
  };

  const removePosition = (index: number) => {
    const updated = [...displaySettings.availablePositions];
    updated.splice(index, 1);
    setDisplaySettings({ ...displaySettings, availablePositions: updated });
  };

  const resetAll = () => {
    if (window.confirm("Xác nhận đặt lại toàn bộ phiếu bầu về 0?")) {
      const resetVotes: { [key: string]: number } = {};
      candidates.forEach(c => resetVotes[c.id] = 0);
      setTally({ votes: resetVotes, invalid: 0, totalDistributed: 0 });
    }
  };

  const exportToExcel = () => {
    let csv = "Họ tên,Số phiếu bầu,Tỷ lệ (%),Chức vụ đắc cử\n";
    const totalV = (Object.values(tally.votes) as number[]).reduce((a, b) => a + b, 0);
    
    // Sort candidates by votes descending for the final report
    const sortedCandidates = [...candidates].sort((a, b) => (tally.votes[b.id] || 0) - (tally.votes[a.id] || 0));

    sortedCandidates.forEach(c => {
      const v = tally.votes[c.id] || 0;
      const p = totalV > 0 ? ((v / totalV) * 100).toFixed(1) : "0";
      csv += `"${c.name}",${v},${p}%,"${c.position || ""}"\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    link.download = `Bien_Ban_Bau_Cu_${dateStr}.csv`;
    link.click();
  };

  const totalValid = useMemo(() => 
    (Object.values(tally.votes) as number[]).reduce((a, b) => a + b, 0),
  [tally.votes]);

  const top5 = useMemo(() => {
    return [...candidates]
      .sort((a, b) => (tally.votes[b.id] || 0) - (tally.votes[a.id] || 0))
      .slice(0, 5);
  }, [candidates, tally.votes]);

  const chartData = useMemo(() => candidates.map(c => ({
    name: c.name,
    votes: tally.votes[c.id] || 0,
    percent: totalValid > 0 ? Number(((tally.votes[c.id] || 0) / totalValid * 100).toFixed(1)) : 0
  })), [candidates, tally.votes, totalValid]);

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className={`${theme.primary} border-b-4 ${theme.border} shrink-0 shadow-md z-30`}>
        <div className="max-w-[1800px] mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-none">{displaySettings.headerTitle}</h1>
            <p className={`text-sm font-semibold opacity-90 ${theme.accentText} mt-2`}>{displaySettings.headerSubtitle}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end px-4 py-2 rounded-xl bg-black/10 border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} className="opacity-80" />
                <span className="text-lg font-bold tabular-nums">
                  {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest mt-1">
                {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
<div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/10 border border-white/10">
  <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Theme</span>

  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => setTheme('red')}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 transition-all
        ${displaySettings.theme === 'red' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'}`}
    >
      Red
    </button>

    <button
      type="button"
      onClick={() => setTheme('blue')}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 transition-all
        ${displaySettings.theme === 'blue' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'}`}
    >
      Blue
    </button>

    <button
      type="button"
      onClick={() => setTheme('green')}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 transition-all
        ${displaySettings.theme === 'green' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'}`}
    >
      Green
    </button>
  </div>
</div>

            <nav className={`flex ${theme.nav} rounded-xl p-1 border border-white/5 shadow-inner`}>
              <button onClick={() => setActiveTab('results')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'results' ? `${theme.secondary} text-slate-900 shadow-sm` : 'text-white/60 hover:text-white'}`}>
                Kết quả
              </button>
              <button onClick={() => setActiveTab('manage')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'manage' ? `${theme.secondary} text-slate-900 shadow-sm` : 'text-white/60 hover:text-white'}`}>
                Quản lý
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4 max-w-[1800px] mx-auto w-full">
        {activeTab === 'results' ? (
          <div className="grid grid-cols-12 gap-5 h-full">
            <div className="col-span-12 lg:col-span-9 flex flex-col gap-4 overflow-hidden">
              <div className="grid grid-cols-4 gap-4 shrink-0">
                <div className={`${theme.primary} px-6 py-4 rounded-[1.5rem] text-white shadow-md border-b-4 border-black/10`}>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-300 mb-1">Phát ra</p>
                  <input type="number" value={tally.totalDistributed} onChange={(e) => updateTotalDistributed(parseInt(e.target.value) || 0)} className="text-4xl font-bold bg-transparent border-none outline-none w-full tabular-nums text-white" />
                </div>
                <div className={`${theme.secondary} px-6 py-4 rounded-[1.5rem] text-slate-900 shadow-md border-b-4 border-black/10`}>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1">Thu hồi (%)</p>
                  <p className="text-4xl font-bold tabular-nums">{tally.totalDistributed > 0 ? ((totalValid + tally.invalid) / tally.totalDistributed * 100).toFixed(1) : 0}%</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                  <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Hợp lệ</p>
                  <p className={`text-4xl font-bold tabular-nums ${displaySettings.theme === 'red' ? 'text-red-700' : 'text-blue-700'}`}>{totalValid}</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col justify-center">
                  <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Không hợp lệ</p>
                  <p className="text-4xl font-bold tabular-nums text-slate-400">{tally.invalid}</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-lg flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-8 shrink-0">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                    <Activity size={24} className={displaySettings.theme === 'red' ? 'text-red-600' : 'text-blue-600'} /> Tỉ lệ phiếu bầu
                  </h3>
                  <button onClick={() => setShowResultModal(true)} className={`${theme.primary} text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all`}>
                    <CheckCircle2 size={18} /> XONG
                  </button>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 100, top: 0, bottom: 0 }}>
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="name" type="category" width={240} tick={{fontSize: 15, fontWeight: 500, fill: '#475569'}} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{fill: '#F8FAFC', radius: 10}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 700 }} formatter={(v) => [`${v}%`, 'Tỷ lệ']} />
                      <Bar dataKey="percent" isAnimationActive={false} radius={[0, 12, 12, 0]} barSize={32}>
                        {chartData.map((_, index) => (<Cell key={`cell-${index}`} fill={theme.chart[index % theme.chart.length]} />))}
                        <LabelList dataKey="percent" position="right" offset={15} formatter={(v: any) => `${v}%`} style={{ fill: '#1E293B', fontSize: 18, fontWeight: 700, pointerEvents: 'none' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-hidden">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-800 uppercase">Sai sót</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
                  <button onClick={() => updateInvalid(-1)} className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-600 transition-all font-bold text-xl">-</button>
                  <span className="text-2xl font-bold text-slate-700 tabular-nums min-w-[2rem] text-center">{tally.invalid}</span>
                  <button onClick={() => updateInvalid(1)} className={`${theme.primary} text-white rounded-lg shadow-sm w-9 h-9 flex items-center justify-center transition-all font-bold text-xl`}>+</button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center shrink-0">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bầu chọn</h3>
                </div>
                <div className="flex-1 flex flex-col px-3 py-2 gap-2 overflow-y-auto custom-scrollbar">
                  {candidates.map((c, index) => {
                    const votes = tally.votes[c.id] || 0;
                    return (
                      <div key={c.id} className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 transition-all flex items-center gap-3 shrink-0">
                        <div className={`${theme.primary} w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0 self-center`}>{index + 1}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-slate-700 whitespace-normal leading-tight">{c.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white p-0.5 rounded-lg border border-slate-100 shadow-sm shrink-0 self-center">
                          <button onClick={() => updateVote(c.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-600 font-bold text-lg transition-colors">-</button>
                          <span className="text-xl font-bold text-slate-800 tabular-nums min-w-[1.8rem] text-center">{votes}</span>
                          <button onClick={() => updateVote(c.id, 1)} className={`${theme.secondary} text-slate-900 rounded-lg shadow-sm w-8 h-8 flex items-center justify-center font-bold text-lg hover:brightness-95 transition-all`}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-5 h-full overflow-hidden">
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-5 overflow-hidden">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl overflow-y-auto custom-scrollbar flex-1">
                <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-3"><UserPlus className="text-slate-400" /> Nhân sự ứng cử</h3>
                <form className="space-y-6 mb-8" onSubmit={handleCandidateSubmit}>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-400 mb-2 block tracking-widest">Họ và tên đầy đủ</label>
                    <input value={formName} onChange={(e) => setFormName(e.target.value)} type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 outline-none focus:border-slate-400 font-semibold text-slate-700" placeholder="Giuse Nguyễn Văn A" required />
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" className={`${theme.primary} text-white font-bold py-4 rounded-xl shadow-lg flex-1 flex items-center justify-center gap-2 active:scale-95 text-sm`}>
                      {editingId ? "Lưu thay đổi" : "Thêm vào danh sách"}
                    </button>
                    {editingId && (
                      <button type="button" onClick={() => {setEditingId(null); setFormName("");}} className="bg-slate-100 text-slate-400 px-6 rounded-xl hover:bg-slate-200 border border-slate-200"><XCircle size={22}/></button>
                    )}
                  </div>
                </form>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-3"><Settings2 className="text-slate-400" /> Danh mục chức vụ</h3>
                  <div className="space-y-3 mb-6">
                    {displaySettings.availablePositions.map((pos: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">{pos}</span>
                        <button onClick={() => removePosition(idx)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input value={newPosition} onChange={(e) => setNewPosition(e.target.value)} type="text" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" placeholder="Tên chức vụ mới..." />
                    <button onClick={addPosition} className={`${theme.primary} text-white px-4 py-2 rounded-xl font-bold text-sm`}>Thêm</button>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 mt-8">
                  <h3 className="text-lg font-bold mb-6 text-slate-800">Thông tin hiển thị</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['headerTitle', 'headerSubtitle', 'footerTerm', 'footerLocation'].map((key) => (
                      <div key={key}>
                        <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">{key}</label>
                        <input value={displaySettings[key as keyof typeof displaySettings]} onChange={(e) => setDisplaySettings({...displaySettings, [key]: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-600 text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 flex flex-col gap-5 overflow-hidden">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl flex-1 flex flex-col overflow-hidden">
                <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest shrink-0">Nhân sự ({candidates.length})</h3>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {candidates.map((c, idx) => (
                    <div key={c.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between group hover:border-slate-300 hover:bg-white transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 ${theme.primary} rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm`}>{idx+1}</div>
                        <h4 className="font-bold text-slate-700 text-sm">{c.name}</h4>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(c.id); setFormName(c.name); }} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-amber-600 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => { if(confirm(`Xóa ứng viên ${c.name}?`)) setCandidates(candidates.filter(cand => cand.id !== c.id)); }} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-700 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg shrink-0 flex items-center justify-between">
                 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest"><Settings2 size={18} className="text-slate-400"/> Hệ thống</h3>
                 <div className="flex gap-4">
                    <button onClick={exportToExcel} className={`${theme.primary} text-white font-bold px-6 py-3 rounded-xl hover:brightness-110 transition-all text-sm flex items-center justify-center gap-2 shadow-md`}><Download size={18} /> Xuất file</button>
                    <button onClick={resetAll} className={`${theme.secondary} text-slate-900 font-bold px-6 py-3 rounded-xl hover:brightness-95 transition-all text-sm flex items-center justify-center gap-2 shadow-md`}><Trash2 size={18} /> Đặt lại</button>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Result Modal - Triggered by XONG */}
      {showResultModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            <div className={`${theme.primary} p-8 text-white relative flex items-center justify-between`}>
              <div className="flex items-center gap-4">
                <div className={`${theme.secondary} p-3 rounded-2xl text-slate-900 shadow-xl`}><Trophy size={32} /></div>
                <div>
                  <h2 className="text-2xl font-bold leading-none uppercase tracking-wide">KẾT QUẢ BẦU CỬ</h2>
                  <p className="text-xs font-semibold opacity-70 mt-3 uppercase tracking-widest">Top 5 ứng cử viên đắc cử</p>
                </div>
              </div>
              <button onClick={() => setShowResultModal(false)} className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
              {top5.map((c, idx) => (
                <div key={c.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`${theme.primary} w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg`}>{idx + 1}</div>
                    <div className="min-w-0">
                      <h4 className="text-xl font-bold text-slate-800 leading-tight">{c.name}</h4>
                      <p className="text-sm font-bold text-slate-400 mt-1">{tally.votes[c.id] || 0} phiếu bầu</p>
                    </div>
                  </div>
                  
                  <div className="w-56 shrink-0">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Bổ nhiệm chức vụ</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-slate-400 shadow-sm"
                      value={c.position || ""}
                      onChange={(e) => {
                        setCandidates(candidates.map(cand => cand.id === c.id ? { ...cand, position: e.target.value } : cand));
                      }}
                    >
                      <option value="">-- Chọn chức vụ --</option>
                      {displaySettings.availablePositions.map((pos: string) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-center">
              <button onClick={exportToExcel} className={`${theme.primary} text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-3`}>
                <Download size={20} /> LƯU & XUẤT BIÊN BẢN (TẤT CẢ)
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={`${theme.footer} py-2 shrink-0 shadow-inner z-10`}>
        <div className="max-w-[1800px] mx-auto px-10 flex justify-between items-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
           <p>{displaySettings.footerTerm} • {displaySettings.footerLocation}</p>
           <p>{displaySettings.footerSystem}</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}} />
    </div>
  );
};

export default App;
