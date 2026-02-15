
import React, { useState, useEffect, useRef } from 'react';
import { CitationCard } from './CitationCard';
import { PricingModal } from './PricingModal';
import { searchCitations, sendChatMessage } from './geminiService';
import { SearchResult, UserStats, ChatMessage } from './types';
import { generateRIS, generateBibTeX } from './exportFormatter';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [isDeepResearch, setIsDeepResearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('biblio_user_stats');
    return saved ? JSON.parse(saved) : { searchCount: 0, isPremium: false };
  });

  useEffect(() => {
    localStorage.setItem('biblio_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const TRIAL_LIMIT = 2;
  const isLimitReached = !userStats.isPremium && userStats.searchCount >= TRIAL_LIMIT;

  const handleSearch = async (e: React.FormEvent) => {
    //MASOK
    e.preventDefault();
    if (!query.trim()) return;
    if (isLimitReached) {
      setIsPricingModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await searchCitations(query, yearFilter, isDeepResearch);
      setResult(data);
      setUserStats(prev => ({ ...prev, searchCount: prev.searchCount + 1 }));
      console.log("STARTING SEARCH with params:", { query, yearFilter, isDeepResearch });
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || 'Terjadi kesalahan riset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = async (e: React.FormEvent) => {
    console.log('handleChatSend called');
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const reply = await sendChatMessage(chatMessages, userMsg);
      setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'model', text: "Maaf, terjadi gangguan pada BiblioBot." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleExport = (format: 'txt' | 'md' | 'ris' | 'bib') => {
    if (!result) return;
    let content = '';
    let extension = format;
    let mimeType = 'text/plain';

    if (format === 'ris') {
      content = generateRIS(result.citations);
      mimeType = 'application/x-research-info-systems';
    } else if (format === 'bib') {
      content = generateBibTeX(result.citations);
      mimeType = 'application/x-bibtex';
    } else {
      content = `HASIL BIBLIOAI: ${query}\n\n${result.synthesis}\n\nDAFTAR PUSTAKA:\n` +
        result.citations.map(c => `${c.id}. ${c.authors.join(', ')} (${c.year}). ${c.title}`).join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BiblioAI_${new Date().getTime()}.${extension}`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-[#fdfdfd] dark:bg-slate-950 dark:text-slate-100">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-[-1]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-lg text-white shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Biblio<span className="text-indigo-600 dark:text-indigo-400">AI</span></span>
          </div>

          <div className="flex items-center gap-4">
            {!userStats.isPremium && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full text-[10px] font-bold text-slate-500 uppercase">
                Trial: <span className={userStats.searchCount >= TRIAL_LIMIT ? 'text-red-500' : 'text-indigo-600'}>{userStats.searchCount}/{TRIAL_LIMIT}</span>
              </div>
            )}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              {isDarkMode ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>}
            </button>
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className={`text-[11px] font-bold px-4 py-2 rounded-xl transition-all uppercase tracking-widest ${userStats.isPremium ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-1 ring-green-200' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-200/40'}`}
            >
              {userStats.isPremium ? 'PRO USER' : 'Upgrade'}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 relative">
        {/* Search */}
        <div className={`transition-all duration-700 ${result ? 'mb-10' : 'mt-24 mb-20 text-center'}`}>
          {!result && (
            <div className="animate-in fade-in zoom-in duration-1000">
              <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tighter">
                Riset Cerdas dengan <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Grounding AI.</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
                Daftar pustaka akurat, sumber terverifikasi Google Search, dan bantuan BiblioBot dalam satu platform.
              </p>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  disabled={isLimitReached}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isLimitReached ? "Limit trial habis. Silakan upgrade." : "Cari topik buku atau penulis..."}
                  className="w-full pl-6 pr-6 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
              <button type="submit" disabled={isLoading || !query.trim()} className="px-10 py-5 bg-indigo-600 text-white font-bold rounded-3xl hover:bg-indigo-700 disabled:opacity-50 shadow-xl transition-all uppercase text-xs tracking-widest">
                {isLoading ? 'Mencari...' : (isLimitReached ? 'Locked' : 'Riset')}
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-6 px-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Periode:</span>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="bg-transparent border-none text-xs font-bold text-indigo-600 outline-none cursor-pointer">
                  <option value="all">Semua Tahun</option>
                  <option value="5">5 Th Terakhir</option>
                  <option value="10">10 Th Terakhir</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={isDeepResearch} onChange={() => setIsDeepResearch(!isDeepResearch)} className="hidden" />
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${isDeepResearch ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-700'}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDeepResearch ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>Riset Mendalam (AI Thinking)</span>
              </label>
            </div>
          </div>

          {isLimitReached && (
            <div className="mt-8 p-6 bg-red-50/80 dark:bg-red-900/10 backdrop-blur-md border border-red-100 dark:border-red-900/30 rounded-3xl max-w-3xl mx-auto animate-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col items-center gap-4 text-center">
                <h3 className="font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">Trial Limit Tercapai</h3>
                <p className="text-sm text-red-600 dark:text-red-300">Anda telah mencapai batas 2 pencarian gratis harian.</p>
                <button
                  onClick={() => setIsPricingModalOpen(true)}
                  className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl text-xs uppercase hover:bg-red-700 transition-all shadow-lg"
                >
                  Buka Akses Premium
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="lg:col-span-7">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden sticky top-24">
                <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Hasil Sintesis
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => handleExport('ris')} className="text-[10px] font-bold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition-all uppercase">RIS / Mendeley</button>
                    <button onClick={() => handleExport('md')} className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-900 hover:text-white transition-all uppercase">MD</button>
                  </div>
                </div>
                <div className="p-10">
                  <p className="text-slate-900 dark:text-slate-100 leading-[1.8] text-[12pt] font-['Times_New_Roman',_serif] text-justify whitespace-pre-wrap">
                    {result.synthesis}
                  </p>
                  {result.groundingSources && result.groundingSources.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Verifikasi Google Search:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.groundingSources.slice(0, 3).map((source: any, i: number) => (
                          <a key={i} href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded text-indigo-600 hover:underline truncate max-w-[150px]">
                            🔗 {source.web?.title || 'Sumber Web'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Referensi Terkait ({result.citations.length})</h3>
              {result.citations.map(c => <CitationCard key={c.id} citation={c} />)}
            </div>
          </div>
        )}
      </main>

      {/* Floating ChatBot */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isChatOpen ? 'w-full max-w-sm' : 'w-14 h-14'}`}>
        {isChatOpen ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[500px] overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">B</div>
                <div>
                  <p className="text-sm font-bold">BiblioBot</p>
                  <p className="text-[10px] opacity-70">Asisten Riset AI</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
              {chatMessages.length === 0 && <p className="text-center text-xs text-slate-400 mt-10 italic">Ada yang bisa BiblioBot bantu mengenai riset Anda?</p>}
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-xs ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-800'}`}>
                    <div className="chat-message ai-message">
                      <ReactMarkdown
                        components={{
                          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-3 mb-2" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-blue-600" {...props} />,
                          em: ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside ml-4 my-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside ml-4 my-2" {...props} />,
                          li: ({ node, ...props }) => <li className="my-1" {...props} />,
                          a: ({ node, ...props }) => <a className="text-blue-500 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-black-200 px-2 py-1 rounded font-mono text-sm" {...props} />,
                          pre: ({ node, ...props }) => <pre className="bg-gray-800 text-white p-3 rounded my-2 overflow-x-auto" {...props} />
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    </div>
                    {m.text}
                  </div>
                </div>
              ))}
              {isChatLoading && <div className="text-xs text-slate-400 italic">BiblioBot sedang mengetik...</div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleChatSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tanya sesuatu..." className="flex-grow bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-xs outline-none" />
              <button type="submit" disabled={isChatLoading} className="bg-indigo-600 text-white p-2 rounded-xl">
                <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform animate-bounce"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
          </button>
        )}
      </div>

      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} onSuccess={() => setUserStats(prev => ({ ...prev, isPremium: true }))} />
    </div>
  );
};

export default App;
