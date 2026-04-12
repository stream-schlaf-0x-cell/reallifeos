import React, { useState, useRef, useEffect } from 'react';

/**
 * ArchitectTerminal — Command center for communicating with the AI game developer.
 * Restricted to the 'Architect' path tab. Sends prompts to a configurable Dify webhook.
 */
const ArchitectTerminal = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('architect_terminal_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('dify_webhook_url') || '/api/ai/deploy';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);

  const logRef = useRef(null);
  const textareaRef = useRef(null);

  // Persist history
  useEffect(() => {
    localStorage.setItem('architect_terminal_history', JSON.stringify(history));
  }, [history]);

  // Persist webhook URL
  useEffect(() => {
    localStorage.setItem('dify_webhook_url', webhookUrl);
  }, [webhookUrl]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [history]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const addEntry = (type, content, meta = {}) => {
    setHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        type,
        content,
        meta,
      },
    ]);
  };

  const handleSubmit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    // Handle /rollback command
    if (trimmed === '/rollback') {
      addEntry('command', '/rollback — Initiating rollback from backup...');
      setLoading(true);

      try {
        const response = await fetch('/api/ai/restore_backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rollback' }),
        });

        if (response.ok) {
          addEntry('success', 'Rollback erfolgreich! Spielstand wurde wiederhergestellt.');
          setToast({ type: 'success', msg: 'Rollback erfolgreich!' });
        } else {
          addEntry('error', `Rollback fehlgeschlagen: HTTP ${response.status}`);
          setToast({ type: 'error', msg: 'Rollback fehlgeschlagen.' });
        }
      } catch (err) {
        addEntry('error', `Rollback fehlgeschlagen: ${err.message}`);
        setToast({ type: 'error', msg: 'Rollback-Verbindung fehlgeschlagen.' });
      }

      setLoading(false);
      setPrompt('');
      return;
    }

    // Handle /config command
    if (trimmed.startsWith('/config ')) {
      const newUrl = trimmed.slice(8).trim();
      if (newUrl) {
        setWebhookUrl(newUrl);
        addEntry('system', `Webhook URL gesetzt: ${newUrl}`);
        setToast({ type: 'success', msg: 'Webhook URL aktualisiert.' });
      }
      setPrompt('');
      return;
    }

    // Handle /clear command
    if (trimmed === '/clear') {
      setHistory([]);
      addEntry('system', 'Verlauf gelöscht.');
      setPrompt('');
      return;
    }

    // Normal prompt — send to Dify webhook
    addEntry('prompt', trimmed);
    setLoading(true);
    setPrompt('');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          user: 'architect',
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        addEntry(
          'response',
          data?.answer || data?.output || 'Antwort erhalten. Die JSON-Daten wurden aktualisiert.',
          { raw: data }
        );
        setToast({ type: 'success', msg: 'Befehl an KI gesendet!' });
      } else {
        addEntry('error', `Webhook-Antwort fehlgeschlagen: HTTP ${response.status}`);
        setToast({ type: 'error', msg: `Webhook-Fehler: ${response.status}` });
      }
    } catch (err) {
      addEntry('error', `Webhook-Verbindung fehlgeschlagen: ${err.message}`);
      setToast({ type: 'error', msg: 'Webhook nicht erreichbar.' });
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearHistory = () => {
    setHistory([]);
    addEntry('system', 'Verlauf manuell gelöscht.');
  };

  return (
    <div
      className="h-full flex flex-col rounded-2xl overflow-hidden border border-[color:var(--border-primary)]"
      style={{ backgroundColor: 'rgba(2, 6, 23, 0.95)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[color:var(--border-secondary)] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖥️</span>
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--path-architect)' }}>
            Architect Terminal
          </h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--path-architect)' }}>
            KI-Deploy
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-[10px] px-2 py-1 rounded-md border transition-colors"
            style={{
              borderColor: 'var(--border-primary)',
              color: 'var(--text-muted)',
              backgroundColor: showSettings ? 'rgba(255,255,255,0.05)' : 'transparent',
            }}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={clearHistory}
            className="text-[10px] px-2 py-1 rounded-md border transition-colors"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-secondary)', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
          <label className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Webhook URL
          </label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="/api/ai/deploy"
            className="w-full mt-1 px-2 py-1.5 rounded-lg text-xs border font-mono"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
          <div className="mt-1 flex gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>Befehle: <code className="px-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>/rollback</code> <code className="px-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>/config &lt;url&gt;</code> <code className="px-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>/clear</code></span>
          </div>
        </div>
      )}

      {/* Command history log */}
      <div
        ref={logRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs custom-scrollbar"
        style={{ minHeight: '200px' }}
      >
        {history.length === 0 && (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">Willkommen im Architect Terminal</p>
            <p className="text-[10px] mt-1">Schreibe einen Befehl an die KI oder nutze /rollback, /config, /clear</p>
            <p className="text-[10px] mt-1">Strg+Enter zum Senden</p>
          </div>
        )}

        {history.map((entry) => (
          <div key={entry.id} className="rounded-lg p-2 border" style={{
            borderColor: entry.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                       entry.type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
                       entry.type === 'prompt' ? 'rgba(59, 130, 246, 0.2)' :
                       'rgba(51, 65, 85, 0.5)',
            backgroundColor: entry.type === 'error' ? 'rgba(239, 68, 68, 0.05)' :
                            entry.type === 'success' ? 'rgba(16, 185, 129, 0.05)' :
                            entry.type === 'prompt' ? 'rgba(59, 130, 246, 0.05)' :
                            entry.type === 'system' ? 'rgba(255,255,255,0.02)' :
                            'rgba(15, 23, 42, 0.5)',
          }}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                [{entry.time}]
              </span>
              <span className="text-[9px] font-bold uppercase" style={{
                color: entry.type === 'error' ? '#ef4444' :
                       entry.type === 'success' ? '#10b981' :
                       entry.type === 'prompt' ? 'var(--path-architect)' :
                       entry.type === 'system' ? 'var(--text-muted)' :
                       'var(--text-secondary)',
              }}>
                {entry.type}
              </span>
            </div>
            <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {entry.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="rounded-lg p-2 border" style={{
            borderColor: 'rgba(139, 92, 246, 0.3)',
            backgroundColor: 'rgba(139, 92, 246, 0.05)',
          }}>
            <span className="text-[9px] font-bold uppercase" style={{ color: '#8b5cf6' }}>
              Sending...
            </span>
            <div className="mt-1 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-3 shrink-0" style={{ borderColor: 'var(--border-secondary)' }}>
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Befehl an die KI... (Strg+Enter zum Senden)"
            rows={2}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-xl text-xs border resize-none font-mono focus:outline-none transition-colors"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className={`self-end px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              loading || !prompt.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:opacity-90'
            }`}
            style={{
              backgroundColor: 'var(--path-architect)',
              color: '#fff',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
            }}
          >
            {loading ? '⏳ Senden...' : '🚀 Deploy'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full font-bold shadow-2xl z-50 text-sm whitespace-nowrap transition-all duration-300 ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-500 text-slate-950'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ArchitectTerminal;
