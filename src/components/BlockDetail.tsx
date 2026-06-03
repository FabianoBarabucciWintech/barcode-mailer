import { useState, useCallback, useRef } from 'react'
import { Block } from '../types'
import { Scanner } from './Scanner'

interface Props {
  block: Block
  onUpdate: (b: Block) => void
  onBack: () => void
}

export function BlockDetail({ block, onUpdate, onBack }: Props) {
  const [scanning, setScanning] = useState(false)
  const [manual, setManual] = useState('')
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const lastCodeRef = useRef({ code: '', time: 0 })

  const addCode = useCallback((raw: string) => {
    const code = raw.trim()
    if (!code) return
    const now = Date.now()
    if (code === lastCodeRef.current.code && now - lastCodeRef.current.time < 2000) return
    lastCodeRef.current = { code, time: now }

    if (block.codes.includes(code)) {
      setLastAdded('⚠️ Già presente: ' + code)
      setTimeout(() => setLastAdded(null), 2000)
      return
    }
    const updated = { ...block, codes: [...block.codes, code] }
    onUpdate(updated)
    setLastAdded('✓ ' + code)
    setTimeout(() => setLastAdded(null), 2000)
  }, [block, onUpdate])

  const deleteCode = (i: number) => {
    const codes = block.codes.filter((_, idx) => idx !== i)
    onUpdate({ ...block, codes })
  }

  const clearAll = () => {
    if (!block.codes.length) return
    if (!confirm(`Eliminare tutti i ${block.codes.length} codici?`)) return
    onUpdate({ ...block, codes: [] })
  }

  const sendEmail = () => {
    const subject = encodeURIComponent(`Blocco barcode: ${block.name}`)
    const body = encodeURIComponent(
      `Blocco: ${block.name}\n` +
      `Data: ${new Date(block.created).toLocaleDateString('it-IT')}\n` +
      `Codici acquisiti: ${block.codes.length}\n\n` +
      block.codes.map((c, i) => `${i + 1}. ${c}`).join('\n')
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div style={{ padding: 16 }}>

      {/* Pulsante scansione */}
      {!scanning ? (
        <button onClick={() => setScanning(true)} style={btnPrimary}>
          📷 Avvia scansione
        </button>
      ) : (
        <Scanner onCode={addCode} onClose={() => setScanning(false)} />
      )}

      {/* Toast feedback */}
      {lastAdded && (
        <div style={{ background: lastAdded.startsWith('⚠️') ? '#FCEBEB' : '#EAF3DE', border: `1px solid ${lastAdded.startsWith('⚠️') ? '#F09595' : '#C0DD97'}`, borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: lastAdded.startsWith('⚠️') ? '#791F1F' : '#27500A' }}>
          {lastAdded}
        </div>
      )}

      {/* Inserimento manuale */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={manual}
          onChange={e => setManual(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { addCode(manual); setManual('') } }}
          placeholder="Inserimento manuale..."
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none' }}
        />
        <button onClick={() => { addCode(manual); setManual('') }} style={{ padding: '0 16px', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', fontSize: 20, cursor: 'pointer' }}>+</button>
      </div>

      {/* Header lista */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#888' }}>{block.codes.length} codici acquisiti</span>
        {block.codes.length > 0 && (
          <button onClick={clearAll} style={{ background: 'none', border: 'none', color: '#A32D2D', fontSize: 12, cursor: 'pointer' }}>Cancella tutti</button>
        )}
      </div>

      {/* Lista codici */}
      {block.codes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa', fontSize: 14 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>▦</div>
          Nessun barcode ancora.<br />Avvia la fotocamera o inserisci manualmente.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {block.codes.map((code, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#185FA5', background: '#E6F1FB', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', flexShrink: 0 }}>#{String(i + 1).padStart(2, '0')}</span>
              <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{code}</span>
              <button onClick={() => deleteCode(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 16, padding: 2, lineHeight: 1 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Invia email */}
      <button onClick={sendEmail} disabled={block.codes.length === 0} style={block.codes.length ? btnSend : btnSendDisabled}>
        ✉️ Invia via email
      </button>
    </div>
  )
}

const btnPrimary: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#185FA5', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 16px', fontSize: 16, fontWeight: 500, width: '100%', cursor: 'pointer', marginBottom: 16 }
const btnSend: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', background: '#0F6E56', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 16px', fontSize: 15, fontWeight: 500, cursor: 'pointer' }
const btnSendDisabled: React.CSSProperties = { ...btnSend, background: '#eee', color: '#bbb', cursor: 'not-allowed' }
