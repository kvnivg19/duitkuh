'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Trash2, ArrowUpRight, ArrowDownLeft, User } from 'lucide-react'

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTransactions = async () => {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (filterType !== 'all') {
      query = query.eq('type', filterType)
    }

    const { data } = await query
    if (data) setTransactions(data)
  }

  useEffect(() => {
    fetchTransactions()
  }, [filterType])

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin mau hapus catatan transaksi ini?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) fetchTransactions()
  }

  const filteredData = transactions.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Riwayat Bersama Duitku 📜</h2>
          <p className="text-xs text-zinc-400">Semua pemasukan & pengeluaran dari user yang terhubung terekam di sini.</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <input 
            type="text" 
            placeholder="Cari transaksi..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-200 focus:outline-none focus:border-lime-400"
          />
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex">
            <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded-lg ${filterType === 'all' ? 'bg-lime-400 text-zinc-950 font-semibold' : 'text-zinc-400'}`}>Semua</button>
            <button onClick={() => setFilterType('income')} className={`px-3 py-1 rounded-lg ${filterType === 'income' ? 'bg-lime-400 text-zinc-950 font-semibold' : 'text-zinc-400'}`}>Masuk</button>
            <button onClick={() => setFilterType('expense')} className={`px-3 py-1 rounded-lg ${filterType === 'expense' ? 'bg-rose-500 text-white font-semibold' : 'text-zinc-400'}`}>Keluar</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">Belum ada data transaksi bersama.</div>
        ) : (
          filteredData.map((item) => (
            <div key={item.id} className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${item.type === 'income' ? 'bg-lime-400/10 text-lime-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {item.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-sm">{item.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{item.category}</span>
                    <span>• {item.date}</span>
                    <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      <User size={10} /> ID: {item.user_id ? item.user_id.slice(0, 6) + '...' : 'System'}
                    </span>
                    {item.mood && <span>• 🧠 {item.mood}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`font-bold text-sm ${item.type === 'income' ? 'text-lime-400' : 'text-zinc-100'}`}>
                  {item.type === 'income' ? '+' : '-'} Rp {Number(item.amount).toLocaleString('id-ID')}
                </span>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}