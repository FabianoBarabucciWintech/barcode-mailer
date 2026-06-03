import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType, BarcodeFormat } from '@zxing/library'

interface Controls {
  stop: () => void
}

interface Props {
  onCode: (code: string) => void
  onClose: () => void
}

export function Scanner({ onCode, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<Controls | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    const hints = new Map()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE, BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E, BarcodeFormat.DATA_MATRIX,
    ])
    hints.set(DecodeHintType.TRY_HARDER, true)

    const reader = new BrowserMultiFormatReader(hints)

    reader.decodeFromVideoDevice(
      undefined,
      videoRef.current!,
      (result, _err, controls) => {
        if (!active) { controls.stop(); return }
        if (result) onCode(result.getText())
      }
    ).then((controls) => {
      if (!active) { controls.stop(); return }
      controlsRef.current = controls
      setReady(true)
    }).catch((e: Error) => {
      if (!active) return
      if (e.name === 'NotAllowedError') setError('Permesso fotocamera negato.\nConsenti l\'accesso nelle impostazioni del browser.')
      else if (e.name === 'NotFoundError') setError('Nessuna fotocamera trovata.')
      else setError('Errore: ' + e.message)
    })

    return () => {
      active = false
      try { controlsRef.current?.stop() } catch {}
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
      {ready && <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 8 }}>Centra il barcode nel riquadro e tieni fermo</p>}
      <button onClick={onClose} style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, cursor: 'pointer', color: '#666' }}>
        ✕ Ferma fotocamera
      </button>
      <style>{`@keyframes scanline { 0%,100%{top:0%} 50%{top:90%} }`}</style>
    </div>
  )
}