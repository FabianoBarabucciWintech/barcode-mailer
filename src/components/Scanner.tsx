import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, Result } from '@zxing/library'

interface Props {
  onCode: (code: string) => void
  onClose: () => void
}

export function Scanner({ onCode, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }
        })
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }

        const video = videoRef.current!
        video.srcObject = stream
        await video.play()
        setReady(true)

        const reader = new BrowserMultiFormatReader()
        readerRef.current = reader

        const controls = await reader.decodeFromVideoElement(video, (result: Result | null) => {
          if (result && active) onCode(result.getText())
        })

        if (!active) controls.stop()

      } catch (e: unknown) {
        if (!active) return
        const err = e as DOMException
        if (err.name === 'NotAllowedError') setError('Permesso fotocamera negato.\nVai nelle impostazioni del browser e consenti l\'accesso alla fotocamera per questa pagina.')
        else if (err.name === 'NotFoundError') setError('Nessuna fotocamera trovata sul dispositivo.')
        else setError('Impossibile avviare la fotocamera: ' + err.message)
      }
    }

    start()

    return () => {
      active = false
      if (readerRef.current) { try { readerRef.current.reset() } catch {} readerRef.current = null }
      if (videoRef.current?.srcObject) {
        const s = videoRef.current.srcObject as MediaStream
        s.getTracks().forEach(t => t.stop())
        videoRef.current.srcObject = null
      }
    }
  }, [onCode])

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: 'relative', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
        <video
          ref={videoRef}
          style={{ width: '100%', display: 'block', maxHeight: 240, objectFit: 'cover' }}
          autoPlay playsInline muted
        />
        {ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 220, height: 110, border: '2px solid rgba(255,255,255,0.85)', borderRadius: 8, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: '#185FA5', top: '50%', animation: 'scanline 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        )}
        {!ready && !error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>
            Avvio fotocamera...
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <p style={{ color: '#F09595', fontSize: 13, textAlign: 'center', whiteSpace: 'pre-line' }}>{error}</p>
          </div>
        )}
      </div>
      {ready && <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 8 }}>Inquadra un barcode — rilevamento automatico</p>}
      <button onClick={onClose} style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: '#666' }}>
        ✕ Ferma fotocamera
      </button>
    </div>
  )
}