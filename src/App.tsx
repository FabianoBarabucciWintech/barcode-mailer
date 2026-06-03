import { useState, useCallback } from 'react'
import { Block } from './types'
import { useLocalStorage } from './useLocalStorage'
import { Home } from './components/Home'
import { BlockDetail } from './components/BlockDetail'

export default function App() {
  const [blocks, setBlocks] = useLocalStorage<Block[]>('bm_blocks', [])
  const [currentId, setCurrentId] = useState<string | null>(null)

  const currentBlock = blocks.find(b => b.id === currentId) ?? null

  const createBlock = (name: string) => {
    const block: Block = { id: Date.now().toString(), name, codes: [], created: Date.now() }
    setBlocks(prev => [...prev, block])
    setCurrentId(block.id)
  }

  const updateBlock = useCallback((updated: Block) => {
    setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b))
  }, [setBlocks])

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5' }}>

        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 10 }}>
          {currentBlock && (
            <button onClick={() => setCurrentId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666', padding: '0 8px 0 0', display: 'flex', alignItems: 'center' }}>←</button>
          )}
          <span style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>
            {currentBlock ? currentBlock.name : '📦 BarcodeMailer'}
          </span>
          {!currentBlock && (
            <span style={{ fontSize: 12, color: '#aaa' }}>v1.0</span>
          )}
        </div>

        {/* Content */}
        {currentBlock ? (
          <BlockDetail block={currentBlock} onUpdate={updateBlock} onBack={() => setCurrentId(null)} />
        ) : (
          <Home blocks={blocks} onSelect={setCurrentId} onCreate={createBlock} onDelete={deleteBlock} />
        )}
      </div>
    </div>
  )
}
