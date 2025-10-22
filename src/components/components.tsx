import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type Props = {
  onResult: (code: string) => void;
  onError?: (err: unknown) => void;
};

export default function BarcodeScanner({ onResult, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stop = false;

    (async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const deviceId = devices?.[0]?.deviceId;
        if (!deviceId) throw new Error('No se encontró cámara');

        const ctrl = await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, err) => {
            if (stop) return;
            if (result) {
              stop = true;
              reader.reset();
              onResult(result.getText());
            }
            if (err && onError) onError(err);
          }
        );

        return () => {
          stop = true;
          ctrl?.stop();
          reader.reset();
        };
      } catch (e) {
        onError?.(e);
      }
    })();

    return () => { stop = true; };
  }, [onResult, onError]);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} />
      <small>Apunta la cámara al código de barras.</small>
    </div>
  );
}
