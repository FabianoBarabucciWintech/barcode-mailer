import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library'

interface Props {
  onCode: (code: string) => void
  onClose: () => void
}

export function Scanner({ onCode, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          }
        })

        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream

        // Abilita autofocus continuo se disponibile
        const track = stream.getVideoTracks()[0]
        try {
          // @ts-ignore
          await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] })
        } catch {}
        const video = videoRef.current!
        video.srcObject = stream
        await video.play()
        setReady(true)

        const hints = new Map()
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
        ])
        hints.set(DecodeHintType.TRY_HARDER, true)

        const reader = new BrowserMultiFormatReader(hints, 300)
        readerRef.current = reader

        const scan = () => {
          if (!active) return
          try {
            const result = reader.decodeFromVideoElement(video)
            // @ts-ignore
            if (result) onCode(result.getText())
          } catch {}
          requestAnimationFrame(scan)
        }

        // Usa decodeOnce in loop tramite RAF
        const loopScan = async () => {
          while (active) {
            try {
              const result = await reader.decodeOnce(video)
              if (result && active) onCode(result.getText())
            } catch {
              // NotFoundException tra frame è normale
            }
            await new Promise(r => setTimeout(r, 300))
          }
        }
        loopScan()

      } catch (e: unknown) {
        if (!active) return
        const err = e as DOMException
        if (err.name === 'NotAllowedError') setError('Permesso fotocamera negato.\nConsenti l\'accesso nelle impostazioni del browser.')
        else if (err.name === 'NotFoundError') setError('Nessuna fotocamera trovata.')
        else setError('Errore fotocamera: ' + err.message)
      }
    }

    start()

    return () => {
      active = false
      try { readerRef.current?.reset() } catch {}
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [onCode])

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ position: 'relative', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
        <video
          ref={videoRef}
          style={{ width: '100%', display: 'block', maxHeight: 260, objectFit: 'cover' }}
          autoPlay playsInline muted
        />
        {ready && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ width: 240, height: 120, border: '2px solid rgba(255,255,255,0.85)', borderRadius: 8, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: '#185FA5', top: 0, animation: 'scanline 1.5s ease-in-out infinite' }} />
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
      {ready && (
        <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 8 }}>
          Centra il barcode nel riquadro e tieni fermo il telefono
        </p>
      )}
      <button onClick={onClose} style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: '#666' }}>
        ✕ Ferma fotocamera
      </button>
      <style>{`@keyframes scanline { 0%,100%{top:0%} 50%{top:90%} }`}</style>
    </div>
  )
}