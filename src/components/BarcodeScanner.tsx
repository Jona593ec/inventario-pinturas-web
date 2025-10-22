// src/components/BarcodeScanner.tsx
import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'

type Props = {
  onResult: (code: string) => void
  onError?: (err: unknown) => void
}

export default function BarcodeScanner({ onResult, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [msg, setMsg] = useState<string>('Apunta la cámara al código de barras.')

  useEffect(() => {
    let cancelled = false
    const reader = new BrowserMultiFormatReader()

    ;(async () => {
      try {
        // Pedimos directamente la cámara trasera
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        }

        // ZXing con constraints (mejor que elegir deviceId a mano)
        controlsRef.current = await reader.decodeFromConstraints(
          constraints,
          videoRef.current!,
          (result, err) => {
            if (cancelled) return
            if (result) {
              const text = result.getText()
              setMsg(`Detectado: ${text}`)
              onResult(text)
            } else if (err) {
              // NotFoundException = no hay código en el frame, no es error "real"
              if ((err as any).name !== 'NotFoundException') {
                setMsg('No se pudo leer. Intenta enfocar mejor…')
                onError?.(err)
              }
            }
          }
        )
        setMsg('Escaneando…')
      } catch (e) {
        setMsg('No se pudo abrir la cámara. Revisa permisos.')
        onError?.(e)
      }
    })()

    return () => {
      cancelled = true
      try { controlsRef.current?.stop() } catch {}
      try { reader.reset() } catch {}
      controlsRef.current = null
    }
  }, [onResult, onError])

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          borderRadius: 12,
          background: '#000',
          aspectRatio: '16 / 9',
          objectFit: 'cover'
        }}
        // Necesario en iOS para que se vea inline
        playsInline
        muted
        autoPlay
      />
      <small>{msg}</small>
    </div>
  )
}
