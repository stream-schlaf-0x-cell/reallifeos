import React from 'react';

/**
 * Error Boundary – fängt Render-Fehler im 3D-Canvas ab
 * und zeigt einen Fallback statt eines weißen Bildschirms.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[WorldMap3D Error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="h-full flex flex-col items-center justify-center gap-3 text-center p-6"
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.6)',
            border: '1px solid var(--border-primary)',
            borderRadius: '1.5rem',
          }}
        >
          <div className="text-4xl">⚠️</div>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            3D-Welt konnte nicht geladen werden
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            WebGL wird nicht unterstützt oder ein Fehler ist aufgetreten.
          </p>
          <details className="text-xs mt-2 max-w-md" style={{ color: 'var(--text-secondary)' }}>
            <summary className="cursor-pointer">Fehlerdetails</summary>
            <pre className="mt-2 p-2 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
              {this.state.error?.message || 'Unbekannter Fehler'}
            </pre>
          </details>
          <button
            className="mt-3 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: 'var(--accent-primary)',
            }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Erneut versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
