'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [title, setTitle] = useState('')
  const [displayAmount, setDisplayAmount] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [category, setCategory] = useState('Kuliner / Gofood')
  const [mood, setMood] = useState('Gabut / Scrolling')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    if (!rawValue) {
      setDisplayAmount('')
      return
    }
    setDisplayAmount(Number(rawValue).toLocaleString('id-ID'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Sesi habis, silakan login ulang.')
      setLoading(false)
      return
    }

    const rawAmount = parseFloat(displayAmount.replace(/\./g, ''))
    const transactionToInsert: any = {
      title,
      amount: rawAmount,
      type,
      category,
      mood,
      date: new Date().toISOString().split('T')[0],
      user_id: user.id
    }

    const { error } = await supabase.from('transactions').insert([transactionToInsert] as any)

    setLoading(false)

    if (error) {
      alert('Gagal nambah transaksi: ' + error.message)
    } else {
      setTitle('')
      setDisplayAmount('')
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121214] border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 cursor-pointer">
          <X size={20} />
        </button>

        <h2 className="text-lg font-bold mb-1 text-zinc-100">Catat Transaksi Baru 💸</h2>
        <p className="text-xs text-zinc-400 mb-6">Tercatat otomatis atas akun yang sedang aktif.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${type === 'expense' ? 'bg-rose-500 text-white' : 'text-zinc-400'}`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${type === 'income' ? 'bg-lime-400 text-zinc-950' : 'text-zinc-400'}`}
            >
              Pemasukan
            </button>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">Judul / Merchant</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kopi Susu Kenangan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">Nominal (Rp)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-zinc-500 font-bold">Rp</span>
              <input
                type="text"
                required
                placeholder="2.000"
                value={displayAmount}
                onChange={handleAmountChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-zinc-100 text-sm font-semibold focus:outline-none focus:border-lime-400 tracking-wider"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-lime-400"
            >
              <option value="Kuliner / Gofood">Kuliner / Gofood</option>
              <option value="E-Commerce / Gadget">E-Commerce / Gadget</option>
              <option value="Hangout & Party">Hangout & Party</option>
              <option value="Transport">Transport</option>
              <option value="Gaji / Income">Gaji / Income</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">Financial Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-lime-400"
            >
              <option value="Stres / Burnout">🔥 Stres / Burnout</option>
              <option value="Senang / Pencapaian">🎉 Senang / Pencapaian</option>
              <option value="Gabut / Scrolling">🥱 Gabut / Scrolling</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-lime-400/10 mt-2 cursor-pointer"
          >
            {loading ? 'Nyimpen data...' : 'Simpan Transaksi 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}