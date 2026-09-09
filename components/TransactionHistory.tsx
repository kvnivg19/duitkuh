'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { ArrowUpRight, ArrowDownLeft, Trash2, Search, User } from 'lucide-react'

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [currentUser, setCurrentUser] = useState<any>(null)

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (!error && data) {
      setTransactions(data)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) {
      fetchHistory()
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const filteredTransactions = transactions.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-4 w-full">
      <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-4 md:p-6 text-zinc-100">
        <div className="mb-6">
          <h2 className="text-base md:text-lg font-bold">Riwayat Bersama Duitku 📜</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Semua pemasukan & pengeluaran dari user yang terekam di sini.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 mb-6 text-xs">
          <div className="relative w-full md:flex-1">
            <Search size={16} className="absolute left-3 top-3 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex w-full md:w-auto justify-center">
            <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded-lg ${filterType === 'all' ? 'bg-lime-400 text-zinc-950 font-semibold' : 'text-zinc-400'}`}>Semua</button>
            <button onClick={() => setFilterType('income')} className={`px-3 py-1 rounded-lg ${filterType === 'income' ? 'bg-lime-400 text-zinc-950 font-semibold' : 'text-zinc-400'}`}>Masuk</button>
            <button onClick={() => setFilterType('expense')} className={`px-3 py-1 rounded-lg ${filterType === 'expense' ? 'bg-rose-500 text-white font-semibold' : 'text-zinc-400'}`}>Keluar</button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">Belum ada catatan transaksi.</div>
          ) : (
            filteredTransactions.map((item) => (
              <div 
                key={item.id} 
                className="bg-zinc-900/60 border border-zinc-800/70 p-3.5 md:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-start md:items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${item.type === 'income' ? 'bg-lime-400/10 text-lime-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {item.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-200">{item.title}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{item.category}</span>
                      <span>• {formatDate(item.date)}</span>
                      <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">
                        <User size={10} /> {item.user_id === currentUser?.id ? 'Anda' : 'Partner'}
                      </span>
                      {item.mood && <span>• 🧠 {item.mood}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t border-zinc-800/50 md:border-t-0 pt-2 md:pt-0">
                  <span className={`font-bold text-sm md:text-base ${item.type === 'income' ? 'text-lime-400' : 'text-zinc-100'}`}>
                    {item.type === 'income' ? '+' : '-'} Rp {Number(item.amount).toLocaleString('id-ID')}
                  </span>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                    title="Hapus Transaksi"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}