'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [note, setNote] = useState('') // Catatan fleksibel menggantikan kategori
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [mood, setMood] = useState('Gabut / Scrolling')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const moods = [
    { label: 'Senang / Pencapaian', emoji: '🎉' },
    { label: 'Gabut / Scrolling', emoji: '📱' },
    { label: 'Stres / Tekanan', emoji: '🤯' },
    { label: 'Darurat / Terpaksa', emoji: '🚨' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const cleanAmount = parseFloat(amount.replace(/\./g, ''))

    const payload = {
      title,
      amount: cleanAmount,
      type,
      category: note ? note : (type === 'income' ? 'Pemasukan Umum' : 'Pengeluaran Umum'),
      date,
      mood: type === 'expense' ? mood : null,
      user_id: user?.id || null
    }

    const { error } = await supabase.from('transactions').insert([payload] as any)
    setLoading(false)

    if (error) {
      alert('Gagal menyimpan transaksi: ' + error.message)
    } else {
      setTitle('')
      setAmount('')
      setNote('')
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-md p-6 text-zinc-100 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            ✨ Catat Transaksi Baru
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800/50 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Tipe Selector */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'income' ? 'bg-lime-400 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowDownLeft size={14} /> Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight size={14} /> Pengeluaran
            </button>
          </div>

          {/* Judul */}
          <div>
            <label className="block mb-1 font-medium text-zinc-400">Nama / Judul Transaksi</label>
            <input 
              type="text" 
              required
              placeholder={type === 'income' ? 'Contoh: Gaji Bulanan / Bonus' : 'Contoh: Kopi Janji Jiwa'} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Nominal */}
          <div>
            <label className="block mb-1 font-medium text-zinc-400">Nominal (Rp)</label>
            <input 
              type="text" 
              required
              placeholder="150.000" 
              value={amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '')
                setAmount(raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-lime-400 font-mono text-sm"
            />
          </div>

          {/* Catatan Fleksibel (Menggantikan Kategori) */}
          <div>
            <label className="block mb-1 font-medium text-zinc-400">Catatan / Keterangan (Opsional)</label>
            <input 
              type="text" 
              placeholder="Contoh: Dibayar oleh kantor / Patungan teman" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Tanggal Sesuai Inputan */}
          <div>
            <label className="block mb-1 font-medium text-zinc-400">Tanggal Transaksi</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Mood Tracker (Khusus Pengeluaran) */}
          {type === 'expense' && (
            <div>
              <label className="block mb-1 font-medium text-zinc-400">Financial Mood (Kondisi Emosi)</label>
              <div className="grid grid-cols-2 gap-2">
                {moods.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMood(m.label)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      mood === m.label 
                        ? 'bg-lime-400/10 border-lime-400 text-lime-400 font-semibold' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span className="truncate">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold py-3 rounded-xl transition-all shadow-lg cursor-pointer mt-2"
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi 🚀'}
          </button>

        </form>
      </div>
    </div>
  )
}