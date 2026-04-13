import React, { useState, useEffect, useRef } from 'react';

/**
 * FallbackImage: Robuste Bild-Komponente mit Loading-Glitch Fallback
 * 
 * VERHALTEN:
 * - Versucht Bild von /data/assets/... zu laden
 * - Zeigt animierten "Loading-Glitch" Placeholder während des Ladens
 * - Bei 404 oder Fehler: Stylischer Platzhalter mit Emoji/Icon
 * - Polling: Prüft periodisch ob Bild verfügbar wird (während Dify generiert)
 * 
 * PROPS:
 * - src: Bild-URL (relativ oder absolut)
 * - alt: Alt-Text
 * - className: Zusätzliche CSS-Klassen
 * - fallbackIcon: Emoji/Icon für Placeholder (default: '🎮')
 * - pollInterval: ms für erneute Ladeversuche (default: 3000, 0 = kein Polling)
 */
const FallbackImage = ({
  src,
  alt = '',
  className = '',
  fallbackIcon = '🎮',
  pollInterval = 3000,
  width,
  height,
  ...rest
}) => {
  const [status, setStatus] = useState(() => (!src ? 'error' : 'loading'));
  const [retryCount, setRetryCount] = useState(0);
  const intervalRef = useRef(null);
  const MAX_RETRIES = pollInterval > 0 ? 60 : 0; // Max 3 Minuten bei 3s Interval

  const clearPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Image loading logic extracted as a function
  const attemptLoad = () => {
    if (!src) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    clearPolling();

    const img = new Image();
    
    const handleLoad = () => {
      setStatus('loaded');
      clearPolling();
    };

    const handleError = () => {
      if (pollInterval > 0 && retryCount < MAX_RETRIES) {
        // Schedule retry via polling
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            setRetryCount(prev => {
              const next = prev + 1;
              if (next >= MAX_RETRIES) {
                setStatus('error');
                clearPolling();
              }
              // Trigger retry
              const retryImg = new Image();
              retryImg.onload = handleLoad;
              retryImg.onerror = handleError;
              retryImg.src = `${src}?retry=${Date.now()}`;
              return next;
            });
          }, pollInterval);
        }
      } else {
        setStatus('error');
        clearPolling();
      }
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;
  };

  // Run load attempt when src or retryCount changes
  useEffect(() => {
    attemptLoad();
    return () => {
      clearPolling();
    };
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  // RENDER: Successfully loaded image
  if (status === 'loaded') {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={{
          display: 'block',
          objectFit: 'cover',
          ...rest.style,
        }}
        {...rest}
      />
    );
  }

  // RENDER: Loading state with animated glitch placeholder
  if (status === 'loading') {
    return (
      <div
        className={`relative overflow-hidden rounded-xl ${className}`}
        style={{
          width: width || '100%',
          height: height || '100%',
          minHeight: '80px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...rest.style,
        }}
        {...rest}
      >
        {/* Animated glitch background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(139, 92, 246, 0.1) 2px,
                rgba(139, 92, 246, 0.1) 4px
              )
            `,
            animation: 'glitch-shift 0.5s ease-in-out infinite',
          }}
        />
        
        {/* Loading icon */}
        <div
          className="relative z-10 text-3xl animate-pulse"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
          }}
        >
          {fallbackIcon}
        </div>

        {/* Loading text */}
        <div
          className="relative z-10 text-[10px] font-mono mt-1"
          style={{
            color: 'rgba(139, 92, 246, 0.6)',
            animation: 'glitch-text 1s ease-in-out infinite',
          }}
        >
          Generiere...
        </div>

        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-violet-500/30"
          style={{
            width: `${Math.min(100, (retryCount / MAX_RETRIES) * 100)}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    );
  }

  // RENDER: Error state with styled placeholder
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        width: width || '100%',
        height: height || '100%',
        minHeight: '80px',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(100, 116, 139, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...rest.style,
      }}
      {...rest}
    >
      {/* Static noise background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* Fallback icon */}
      <div
        className="relative z-10 text-3xl opacity-50"
        style={{
          filter: 'grayscale(0.5) drop-shadow(0 0 4px rgba(100, 116, 139, 0.3))',
        }}
      >
        {fallbackIcon}
      </div>

      {/* Asset unavailable text */}
      <div
        className="relative z-10 text-[9px] font-mono mt-1 opacity-40"
        style={{ color: 'rgba(148, 163, 184, 0.6)' }}
      >
        Asset pending
      </div>
    </div>
  );
};

export default FallbackImage;
