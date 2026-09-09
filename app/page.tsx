'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Wallet, 
  BarChart3, 
  Bookmark, 
  PieChart, 
  Settings, 
  RefreshCw, 
  Plus, 
  Search, 
  Flame, 
  Trash2, 
  LogOut, 
  FileText, 
  Sun, 
  Moon, 
  Target, 
  Brain,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import TransactionModal from '@/components/TransactionModal'
import TransactionHistory from '@/components/TransactionHistory'

export const dynamic = 'force-dynamic'

export default function DuitkuDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analitik' | 'report' | 'kantong' | 'wishlist' | 'budgeting' | 'settings'>('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({})
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const [expenseLimit, setExpenseLimit] = useState<number>(2000000)
  const [inputLimit, setInputLimit] = useState('2.000.000')

  const [pockets, setPockets] = useState<any[]>([])
  const [wishlists, setWishlists] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])

  const [newPocketTitle, setNewPocketTitle] = useState('')
  const [newPocketTarget, setNewPocketTarget] = useState('')
  const [newWishTitle, setNewWishTitle] = useState('')
  const [newWishPrice, setNewWishPrice] = useState('')
  const [newBudgetCat, setNewBudgetCat] = useState('Kuliner / Lainnya')
  const [newBudgetLimit, setNewBudgetLimit] = useState('')

  const [selectedUserFilter, setSelectedUserFilter] = useState('all')
  const [reportSearch, setReportSearch] = useState('')

  const router = useRouter()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false })
    if (txData) {
      setTransactions(txData)
      const newMap: { [key: string]: string } = {}
      txData.forEach((item: any) => {
        if (item.user_id) {
          const isCurrentUser = !!user && item.user_id === user.id
          newMap[item.user_id] = isCurrentUser ? (user.email || item.user_id) : `User (${item.user_id.slice(0, 6)}...)`
        }
      })
      setUserMap(newMap)
      
      let income = 0
      let expense = 0
      txData.forEach((item: any) => {
        if (item.type === 'income') income += Number(item.amount)
        if (item.type === 'expense') expense += Number(item.amount)
      })
      setTotalIncome(income)
      setTotalExpense(expense)
    }

    const { data: pData } = await supabase.from('pockets').select('*')
    if (pData) setPockets(pData)

    const { data: wData } = await supabase.from('wishlists').select('*')
    if (wData) setWishlists(wData)

    const { data: bData } = await supabase.from('budgets').select('*')
    if (bData) setBudgets(bData)

    const savedLimit = localStorage.getItem('duitku_limit')
    if (savedLimit) {
      setExpenseLimit(Number(savedLimit))
      setInputLimit(Number(savedLimit).toLocaleString('id-ID'))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSuccess = () => {
    fetchData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = "sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push('/login')
  }

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = parseFloat(inputLimit.replace(/\./g, ''))
    setExpenseLimit(clean)
    localStorage.setItem('duitku_limit', clean.toString())
    alert('Batas aman pengeluaran berhasil diperbarui!')
  }

  const handleResetData = async () => {
    if (!confirm('Yakin ingin menghapus SELURUH data transaksi bersama di database?')) return
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    fetchData()
  }

  const handleAddPocket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPocketTitle || !newPocketTarget) return
    const { data: { user } } = await supabase.auth.getUser()
    await (supabase.from('pockets') as any).insert([{
      title: newPocketTitle,
      target_amount: parseFloat(newPocketTarget.replace(/\./g, '')),
      current_amount: 0,
      user_id: user?.id ?? ''
    }])
    setNewPocketTitle('')
    setNewPocketTarget('')
    fetchData()
  }

  const handleDeletePocket = async (id: string) => {
    await supabase.from('pockets').delete().eq('id', id)
    fetchData()
  }

  const handleAddWishlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWishTitle || !newWishPrice) return
    const { data: { user } } = await supabase.auth.getUser()
    await (supabase.from('wishlists') as any).insert([{
      title: newWishTitle,
      price: parseFloat(newWishPrice.replace(/\./g, '')),
      user_id: user?.id ?? ''
    }])
    setNewWishTitle('')
    setNewWishPrice('')
    fetchData()
  }

  const handleDeleteWishlist = async (id: string) => {
    await supabase.from('wishlists').delete().eq('id', id)
    fetchData()
  }

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBudgetLimit) return
    const { data: { user } } = await supabase.auth.getUser()
    await (supabase.from('budgets') as any).insert([{
      category: newBudgetCat,
      limit_amount: parseFloat(newBudgetLimit.replace(/\./g, '')),
      user_id: user?.id ?? ''
    }])
    setNewBudgetLimit('')
    fetchData()
  }

  const handleDeleteBudget = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id)
    fetchData()
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

  const netBalance = totalIncome - totalExpense

  let highestExpenseItem = { title: 'Belum ada data', amount: 0, date: '-' }
  transactions.filter(item => item.type === 'expense').forEach(item => {
    const amt = Number(item.amount)
    if (amt > highestExpenseItem.amount) {
      highestExpenseItem = { title: item.title, amount: amt, date: formatDate(item.date) }
    }
  })

  const moodTotals: { [key: string]: { count: number, total: number } } = {}
  transactions.filter(item => item.type === 'expense').forEach(item => {
    const moodKey = item.mood || 'Gabut / Scrolling'
    if (!moodTotals[moodKey]) {
      moodTotals[moodKey] = { count: 0, total: 0 }
    }
    moodTotals[moodKey].count += 1
    moodTotals[moodKey].total += Number(item.amount)
  })
  const sortedMoods = Object.entries(moodTotals).sort((a, b) => b[1].total - a[1].total)

  const uniqueUsers = Array.from(new Set(transactions.map(item => item.user_id)))
  const filteredReportData = transactions.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(reportSearch.toLowerCase()) || item.category.toLowerCase().includes(reportSearch.toLowerCase())
    const matchesUser = selectedUserFilter === 'all' || item.user_id === selectedUserFilter
    return matchesSearch && matchesUser
  })

  const isLight = theme === 'light'
  const bgMain = isLight ? 'bg-zinc-100 text-zinc-900' : 'bg-[#0a0a0a] text-zinc-100'
  const bgSidebar = isLight ? 'bg-white border-zinc-200' : 'bg-[#121214] border-zinc-800'
  const bgCard = isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#121214] border-zinc-800/80 text-zinc-100'
  const bgSubCard = isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-zinc-900/80 border-zinc-800/60 text-zinc-200'
  const textMuted = isLight ? 'text-zinc-500' : 'text-zinc-400'
  const borderColor = isLight ? 'border-zinc-200' : 'border-zinc-800'
  const inputBg = isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'

  return (
    <div className={`flex flex-col md:flex-row h-screen font-sans overflow-hidden transition-colors duration-300 ${bgMain}`}>
      
      {/* SIDEBAR (Desktop Only) */}
      <aside className={`w-64 border-r flex-col justify-between p-4 hidden md:flex shrink-0 ${bgSidebar}`}>
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="bg-lime-400 text-zinc-950 font-black px-2.5 py-1 rounded-lg text-lg tracking-wider">
              Duitku
            </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 mb-6 transition-all shadow-lg cursor-pointer">
            <Plus size={18} /> <span>Catat Cepat</span>
          </button>

          <nav className="space-y-1 text-xs font-medium">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'bg-lime-400/10 text-lime-500 font-bold' : `${textMuted} hover:bg-zinc-500/10`}`}>
              <LayoutDashboard size={18} /> <span>Dashboard & Riwayat</span>
            </button>
            <button onClick={() => setActiveTab('analitik')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${activeTab === 'analitik' ? 'bg-lime-400/10 text-lime-500 font-bold' : `${textMuted} hover:bg-zinc-500/10`}`}>
              <BarChart3 size={18} /> <span>Analitik</span>
            </button>
            <button onClick={() => setActiveTab('report')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${activeTab === 'report' ? 'bg-lime-400/10 text-lime-500 font-bold' : `${textMuted} hover:bg-zinc-500/10`}`}>
              <FileText size={18} /> <span>Report Detail</span>
            </button>
            <button onClick={() => setActiveTab('kantong')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${activeTab === 'kantong' ? 'bg-lime-400/10 text-lime-500 font-bold' : `${textMuted} hover:bg-zinc-500/10`}`}>
              <Wallet size={18} /> <span>Kantong Nabung</span>
            </button>
            <button onClick={() => setActiveTab('wishlist')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${activeTab === 'wishlist' ? 'bg-lime-400/10 text-lime-500 font-bold' : `${textMuted} hover:bg-zinc-500/10`}`}>
              <Bookmark size={18} /> <span>Wishlist</span>
            </button>
            <button onClick={() => setActiveTab('budgeting')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${activeTab === 'budgeting' ? 'bg-lime-400/10 text-lime-500 font-bold' : `${textMuted} hover:bg-zinc-500/10`}`}>
              <PieChart size={18} /> <span>Budgeting</span>
            </button>
          </nav>
        </div>

        <div className={`space-y-1 border-t pt-4 text-xs ${borderColor}`}>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${activeTab === 'settings' ? 'bg-lime-400/10 text-lime-500 font-bold' : `${textMuted} hover:bg-zinc-500/10`}`}>
            <Settings size={18} /> <span>Pengaturan</span>
          </button>
          <button onClick={fetchData} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-lime-500 hover:bg-lime-400/10 transition-colors cursor-pointer text-left font-medium">
            <RefreshCw size={18} /> <span>Muat Ulang Data</span>
          </button>
  
        </div>
      </aside>

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      <div className={`md:hidden flex items-center justify-around border-t py-2 px-1 fixed bottom-0 left-0 right-0 z-30 shadow-2xl ${bgSidebar}`}>
        <button onClick={() => setActiveTab('dashboard')} className={`p-1 flex flex-col items-center text-[10px] ${activeTab === 'dashboard' ? 'text-lime-500 font-bold' : textMuted}`}>
          <LayoutDashboard size={16} /> <span>Home</span>
        </button>
        <button onClick={() => setActiveTab('analitik')} className={`p-1 flex flex-col items-center text-[10px] ${activeTab === 'analitik' ? 'text-lime-500 font-bold' : textMuted}`}>
          <BarChart3 size={16} /> <span>Analitik</span>
        </button>
        <button onClick={() => setIsModalOpen(true)} className="bg-lime-400 text-zinc-950 p-2.5 rounded-full shadow-lg -mt-4 cursor-pointer">
          <Plus size={20} />
        </button>
        <button onClick={() => setActiveTab('report')} className={`p-1 flex flex-col items-center text-[10px] ${activeTab === 'report' ? 'text-lime-500 font-bold' : textMuted}`}>
          <FileText size={16} /> <span>Report</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`p-1 flex flex-col items-center text-[10px] ${activeTab === 'settings' ? 'text-lime-500 font-bold' : textMuted}`}>
          <Settings size={16} /> <span>Set</span>
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-24 md:pb-0">
        <header className={`h-16 border-b backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 ${isLight ? 'bg-white/70 border-zinc-200' : 'bg-[#121214]/50 border-zinc-800'}`}>
          <div className="flex items-center gap-2">
            <div className={`text-[11px] md:text-xs px-3 py-1 rounded-full text-lime-500 font-medium flex items-center gap-1.5 border truncate max-w-[200px] md:max-w-none ${isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-800/60 border-zinc-700/50'}`}>
              <Flame size={14} className="text-lime-500 shrink-0" />
              <span className="truncate">Shared Financial Database</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-full border transition-all cursor-pointer ${isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200' : 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800'}`}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="hidden md:flex bg-lime-400 hover:bg-lime-300 text-zinc-950 font-semibold text-xs px-4 py-2 rounded-full items-center gap-1.5 transition-all shadow-md cursor-pointer">
              <Plus size={14} /> <span>Transaksi Baru</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard & Riwayat 📋</h1>
                <p className={`text-xs mt-0.5 ${textMuted}`}>Kelola dan pantau seluruh histori transaksi bersama.</p>
              </div>

              {/* 2 KOTAK BESAR: PEMASUKAN DAN PENGELUARAN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`border rounded-2xl p-5 flex flex-col justify-between ${bgCard}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs uppercase font-semibold tracking-wider ${textMuted}`}>Total Pemasukan</span>
                      <h2 className="text-2xl font-black text-lime-400 mt-1">Rp {totalIncome.toLocaleString('id-ID')}</h2>
                    </div>
                    <div className="bg-lime-400/10 text-lime-400 p-2.5 rounded-xl">
                      <ArrowDownLeft size={20} />
                    </div>
                  </div>
                  <div className={`mt-4 pt-3 border-t text-xs flex justify-between ${borderColor}`}>
                    <span className={textMuted}>Saldo Bersih Saat Ini:</span>
                    <span className="font-bold">Rp {netBalance.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className={`border rounded-2xl p-5 flex flex-col justify-between ${bgCard}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs uppercase font-semibold tracking-wider ${textMuted}`}>Total Pengeluaran</span>
                      <h2 className="text-2xl font-black text-rose-500 mt-1">Rp {totalExpense.toLocaleString('id-ID')}</h2>
                    </div>
                    <div className="bg-rose-500/10 text-rose-500 p-2.5 rounded-xl">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                  <div className={`mt-4 pt-3 border-t text-xs flex justify-between items-center ${borderColor}`}>
                    <span className={textMuted}>Status Batas Aman:</span>
                    <span className={`font-bold ${totalExpense > expenseLimit ? 'text-rose-500' : 'text-lime-400'}`}>
                      {totalExpense > expenseLimit ? '⚠️ Over Limit' : '✨ Aman Terkendali'}
                    </span>
                  </div>
                </div>
              </div>

              <TransactionHistory />
            </div>
          )}

          {activeTab === 'analitik' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Analisis Keuangan 📊</h1>
                <p className={`text-xs mt-0.5 ${textMuted}`}>Ringkasan data penting langsung dari database.</p>
              </div>

              {/* Pengeluaran Paling Tinggi */}
              <div className={`border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 ${bgCard}`}>
                <div className="space-y-2 text-center md:text-left">
                  <span className={`text-xs uppercase font-semibold tracking-wider text-rose-500`}>⚠️ Pengeluaran Paling Tinggi (Tertinggi)</span>
                  <h3 className="text-xl font-black">{highestExpenseItem.title}</h3>
                  <p className={`text-xs ${textMuted}`}>Tanggal: {highestExpenseItem.date}</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/30 px-6 py-4 rounded-2xl text-center">
                  <span className="text-[10px] text-zinc-400 block uppercase">Nominal</span>
                  <span className="text-xl font-black text-rose-500">Rp {highestExpenseItem.amount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Batas Aman Arus Kas */}
              <div className={`border rounded-2xl p-5 space-y-3 ${bgCard}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold flex items-center gap-1.5"><ShieldCheck size={16} className="text-lime-400" /> Batas Aman Pengeluaran</span>
                  <span className="text-lime-400 font-mono">Limit: Rp {expenseLimit.toLocaleString('id-ID')}</span>
                </div>
                <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${totalExpense > expenseLimit ? 'bg-rose-500' : 'bg-lime-400'}`} 
                    style={{ width: `${Math.min(100, (totalExpense / (expenseLimit || 1)) * 100)}%` }}
                  ></div>
                </div>
                <p className={`text-[11px] ${textMuted}`}>
                  {totalExpense > expenseLimit ? '⚠️ Pengeluaran sudah melampaui batas aman yang diatur di menu Pengaturan!' : '✨ Pengeluaran masih dalam batas aman.'}
                </p>
              </div>

              {/* Financial Mood Tracker */}
              <div className={`border rounded-2xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Brain size={18} className="text-lime-400" /> Financial Mood Tracker Analisis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sortedMoods.length === 0 ? (
                    <div className={`col-span-3 text-center py-6 text-xs ${textMuted}`}>Belum ada data emosi/mood tercatat.</div>
                  ) : (
                    sortedMoods.slice(0, 3).map(([moodName, stats], idx) => (
                      <div key={idx} className={`border rounded-xl p-4 flex flex-col justify-between ${bgSubCard}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-lime-400">{moodName}</span>
                          <span className="text-[10px] bg-lime-400/10 text-lime-400 px-2 py-0.5 rounded font-medium">{stats.count}x</span>
                        </div>
                        <div className={`pt-2 border-t flex justify-between text-xs ${borderColor}`}>
                          <span className={textMuted}>Total:</span>
                          <span className="font-bold text-rose-500">Rp {stats.total.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-6">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2"><FileText className="text-lime-500" /> Report Detail Transaksi 📑</h1>
              <div className={`border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${bgCard}`}>
                <input type="text" placeholder="Cari judul..." value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} className={`border rounded-xl px-3 py-2 w-full md:w-64 ${inputBg}`} />
                <select value={selectedUserFilter} onChange={(e) => setSelectedUserFilter(e.target.value)} className={`border px-3 py-2 rounded-xl w-full md:w-auto ${inputBg}`}>
                  <option value="all">Semua User</option>
                  {uniqueUsers.map(uid => uid && <option key={uid} value={uid}>{userMap[uid] || uid}</option>)}
                </select>
              </div>
              <div className={`border rounded-2xl overflow-hidden ${bgCard}`}>
                {filteredReportData.map((item) => (
                  <div key={item.id} className={`p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs ${borderColor}`}>
                    <div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <span className={textMuted}>{item.category} • {formatDate(item.date)} • <strong className="text-indigo-500">{userMap[item.user_id]}</strong></span>
                    </div>
                    <span className={`font-bold text-sm ${item.type === 'income' ? 'text-lime-500' : ''}`}>Rp {Number(item.amount).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'kantong' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Kantong Nabung Bersama 💰</h1>
              </div>
              <form onSubmit={handleAddPocket} className={`border rounded-2xl p-4 md:p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-sm font-bold text-lime-500 flex items-center gap-2"><Target size={16} /> Tambah Kantong Baru</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className={`block mb-1 font-medium ${textMuted}`}>Nama Kantong</label>
                    <input type="text" required placeholder="Contoh: Liburan Jepang" value={newPocketTitle} onChange={(e) => setNewPocketTitle(e.target.value)} className={`w-full border rounded-xl px-3.5 py-2.5 ${inputBg}`} />
                  </div>
                  <div>
                    <label className={`block mb-1 font-medium ${textMuted}`}>Target Dana (Rp)</label>
                    <input type="text" required placeholder="5.000.000" value={newPocketTarget} onChange={(e) => setNewPocketTarget(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} className={`w-full border rounded-xl px-3.5 py-2.5 ${inputBg}`} />
                  </div>
                </div>
                <button type="submit" className="w-full md:w-auto bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-md">Simpan Kantong 🚀</button>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pockets.map((p) => (
                  <div key={p.id} className={`border rounded-2xl p-5 flex flex-col justify-between ${bgCard}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-sm">{p.title}</h4>
                      <button onClick={() => handleDeletePocket(p.id)} className="text-zinc-400 hover:text-rose-500 cursor-pointer"><Trash2 size={14} /></button>
                    </div>
                    <div className="text-xs text-zinc-400 mb-3">Target: Rp {Number(p.target_amount).toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Wishlist Impian ✨</h1>
              </div>
              <form onSubmit={handleAddWishlist} className={`border rounded-2xl p-4 md:p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-sm font-bold text-lime-500">Tambah Barang Impian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <input type="text" required placeholder="Nama Barang" value={newWishTitle} onChange={(e) => setNewWishTitle(e.target.value)} className={`border rounded-xl px-3.5 py-2.5 ${inputBg}`} />
                  <input type="text" required placeholder="Harga" value={newWishPrice} onChange={(e) => setNewWishPrice(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} className={`border rounded-xl px-3.5 py-2.5 ${inputBg}`} />
                </div>
                <button type="submit" className="w-full md:w-auto bg-lime-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer">Simpan Wishlist</button>
              </form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlists.map((w) => (
                  <div key={w.id} className={`border rounded-2xl p-5 flex justify-between items-center ${bgCard}`}>
                    <div>
                      <h4 className="font-bold text-sm">{w.title}</h4>
                      <span className="text-xs text-lime-500">Rp {Number(w.price).toLocaleString('id-ID')}</span>
                    </div>
                    <button onClick={() => handleDeleteWishlist(w.id)} className="text-zinc-400 hover:text-rose-500 cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'budgeting' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Budgeting Bulanan 🎯</h1>
              </div>
              <form onSubmit={handleAddBudget} className={`border rounded-2xl p-4 md:p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-sm font-bold text-lime-500">Atur Limit Budget</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <input type="text" required placeholder="Kategori / Keperluan" value={newBudgetCat} onChange={(e) => setNewBudgetCat(e.target.value)} className={`border rounded-xl px-3.5 py-2.5 ${inputBg}`} />
                  <input type="text" required placeholder="Limit Maksimal" value={newBudgetLimit} onChange={(e) => setNewBudgetLimit(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))} className={`border rounded-xl px-3.5 py-2.5 ${inputBg}`} />
                </div>
                <button type="submit" className="w-full md:w-auto bg-lime-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer">Simpan Budget</button>
              </form>
              <div className="space-y-3">
                {budgets.map((b) => (
                  <div key={b.id} className={`border rounded-2xl p-4 flex justify-between items-center ${bgCard}`}>
                    <div>
                      <h4 className="font-bold text-sm">{b.category}</h4>
                      <span className="text-xs text-zinc-400">Limit: Rp {Number(b.limit_amount).toLocaleString('id-ID')}</span>
                    </div>
                    <button onClick={() => handleDeleteBudget(b.id)} className="text-zinc-400 hover:text-rose-500 cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Pengaturan Aplikasi ⚙️</h1>
              
              {/* Tema */}
              <div className={`border rounded-2xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-sm font-bold text-lime-500">Preferensi Tampilan Tema</h3>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-xl border ${theme === 'dark' ? 'bg-zinc-800 text-amber-400 font-bold' : textMuted}`}>Dark Mode</button>
                  <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-xl border ${theme === 'light' ? 'bg-white text-zinc-900 font-bold shadow' : textMuted}`}>Light Mode</button>
                </div>
              </div>

              {/* Setting Batas Aman Pengeluaran */}
              <form onSubmit={handleSaveLimit} className={`border rounded-2xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-sm font-bold text-lime-500 flex items-center gap-2"><ShieldCheck size={16} /> Atur Batas Aman Pengeluaran</h3>
                <p className={`text-xs ${textMuted}`}>Tentukan batas maksimal pengeluaran bulanan agar sistem memberikan peringatan jika melebihi limit.</p>
                <div className="text-xs space-y-1">
                  <label className={`block font-medium ${textMuted}`}>Maksimal Batas Pengeluaran (Rp)</label>
                  <input 
                    type="text" 
                    value={inputLimit} 
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '')
                      setInputLimit(raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
                    }} 
                    className={`w-full border rounded-xl px-3.5 py-2.5 font-mono ${inputBg}`}
                  />
                </div>
                <button type="submit" className="w-full md:w-auto bg-lime-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer">
                  Simpan Batas Limit 💾
                </button>
              </form>

              {/* Tombol Keluar */}
              <div className={`border rounded-2xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2"><LogOut size={16} /> Keluar dari Akun</h3>
                <p className={`text-xs ${textMuted}`}>Akhiri sesi login aktif di perangkat ini.</p>
                <button 
                  onClick={() => {
                    if (confirm('Yakin mau keluar dari akun?')) {
                      handleLogout()
                    }
                  }} 
                  className="w-full md:w-auto bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Keluar Akun Sekarang
                </button>
              </div>

              {/* Tombol Reset Data */}
              <div className="border border-rose-500/30 rounded-2xl p-6 bg-rose-500/5 space-y-3">
                <h3 className="text-sm font-bold text-rose-500">Zona Manajemen Data Bersama</h3>
                <p className={`text-xs ${textMuted}`}>Hapus seluruh riwayat transaksi yang tersimpan di database bersama.</p>
                <button 
                  onClick={handleResetData} 
                  className="w-full md:w-auto bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Hapus & Reset Semua Data Transaksi 🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
    </div>
  )
}