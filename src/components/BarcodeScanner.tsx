import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type Props = {
  onResult: (code: string) => void;
  onError?: (err: unknown) => void;
};

export default function BarcodeScanner({ onResult, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function start() {
    try {
      setMsg("");
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
      if (!isSecure) {
        setMsg("Para usar la cámara, abre esta página en HTTPS o localhost.");
        return;
      }
      const reader = new BrowserMultiFormatReader();

      controlsRef.current = await reader.decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        },
        videoRef.current!,
        (result, err) => {
          if (result) {
            stop();
            onResult(result.getText());
          }
          if (err && onError) onError(err);
        }
      );

      setRunning(true);
    } catch (e) {
      setMsg("No se pudo iniciar la cámara. Revisa permisos y que sea HTTPS.");
      onError?.(e);
    }
  }

  function stop() {
    try { controlsRef.current?.stop(); } catch {}
    controlsRef.current = null;
    setRunning(false);
  }

  useEffect(() => () => stop(), []);

  return (
    <div className="box" style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {!running ? <button type="button" className="btn" onClick={start}>📷 Iniciar escáner</button>
                  : <button type="button" className="btn" onClick={stop}>⏹️ Detener</button>}
      </div>

      <video
        ref={videoRef}
        style={{ width: '100%', borderRadius: 8, background: '#000' }}
        playsInline
        muted
      />

      {msg && <small style={{ color: '#b00' }}>{msg}</small>}
      <small>Apunta la cámara al código de barras.</small>
    </div>
  );
}
