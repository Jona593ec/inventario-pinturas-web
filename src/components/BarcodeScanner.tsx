import { useEffect, useRef, useState } from 'react'
import {
  BrowserMultiFormatReader,
  IScannerControls,
} from '@zxing/browser'

type Props = {
  onResult: (code: string) => void
  onError?: (err: unknown) => void
}

export default function BarcodeScanner({ onResult, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        setMsg('')
        // seguridad: usar solo en https o localhost
        const isSecure = location.protocol === 'https:' || location.hostname === 'localhost'
        if (!isSecure) {
          setMsg('Para usar la cámara, abre esta página en HTTPS o localhost.')
          return
        }

        const reader = new BrowserMultiFormatReader()
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        } as MediaStreamConstraints

        setRunning(true)
        const controls = await reader.decodeFromConstraints(
          constraints,
          videoRef.current!,
          (result, err) => {
            if (cancelled) return
            if (result) {
              setRunning(false)
              controlsRef.current?.stop() // detener inmediatamente
              onResult(result.getText())
            } else if (err) {
              // errores de frame sin código: no spamear
            }
          }
        )
        if (!cancelled) controlsRef.current = controls
      } catch (e) {
        setRunning(false)
        onError?.(e)
      }
    }

    start()

    return () => {
      cancelled = true
      setRunning(false)
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [onResult, onError])

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <video
        ref={videoRef}
        style={{ width: '100%', borderRadius: 8 }}
        autoPlay
        muted
        playsInline
      />
      {msg && <small style={{ color: '#ffb703' }}>{msg}</small>}
      {!running && <small>Apunta la cámara al código de barras.</small>}
    </div>
  )
}
