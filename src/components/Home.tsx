import { useState } from 'react'
import { Block } from '../types'

interface Props {
  blocks: Block[]
  onSelect: (id: string) => void
  onCreate: (name: string) => void
  onDelete: (id: string) => void
}

export function Home({ blocks, onSelect, onCreate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')

  const create = () => {
    const n = name.trim()
    if (!n) return
    onCreate(n)
    setName('')
    setShowModal(false)
  }

  return (
    <div>
      <div style={{ padding: '16px 16px 8px' }}>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          Crea blocchi di acquisizione e invia i codici via email.
        </p>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#185FA5', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 16px', fontSize: 15, fontWeight: 500, width: '100%', cursor: 'pointer', marginBottom: 20 }}>
          + Nuovo blocco di acquisizione
        </button>
      </div>

      <div style={{ padding: '0 8px 4px 16px' }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Blocchi salvati</span>
      </div>

      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {blocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb', fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            Nessun blocco ancora.<br />Crea il primo!
          </div>
        ) : (
          blocks.slice().reverse().map(b => (
            <div key={b.id} onClick={() => onSelect(b.id)} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>📦</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>{b.name}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                  {new Date(b.created).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#185FA5', background: '#E6F1FB', padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
                {b.codes.length} codici
              </span>
              <button
                onClick={e => { e.stopPropagation(); if (confirm(`Eliminare il blocco "${b.name}"?`)) onDelete(b.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16, padding: '4px', flexShrink: 0 }}
                title="Elimina blocco"
              >🗑</button>
            </div>
          ))
        )}
      </div>

      {/* Modal nuovo blocco */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 }}>
            <h3 style={{ fontSize: 17, fontWeight: 500, marginBottom: 16 }}>Nuovo blocco</h3>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && create()}
              placeholder="Es. Ordine Rossi, Magazzino A..."
              maxLength={60}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 15, marginBottom: 16, outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowModal(false); setName('') }} style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid #ddd', background: 'none', fontSize: 14, cursor: 'pointer', color: '#666' }}>Annulla</button>
              <button onClick={create} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: '#185FA5', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Crea</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
