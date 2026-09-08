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
  Database,
  User,
  ShieldCheck,
  LogOut,
  Mail,
  CheckCircle2,
  FileText,
  Filter,
  Sun,
  Moon,
  Target,
  Brain
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import TransactionModal from '@/components/TransactionModal'
import TransactionHistory from '@/components/TransactionHistory'

export const dynamic = 'force-dynamic'

interface Pocket {
  id: string
  title: string
  target_amount: number
  current_amount: number
  user_id?: string
}

interface Wishlist {
  id: string
  title: string
  price: number
  user_id?: string
}

interface Budget {
  id: string
  category: string
  limit_amount: number
  user_id?: string
}

export default function DuitkuDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analitik' | 'report' | 'kantong' | 'wishlist' | 'budgeting' | 'settings'>('analitik')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [dbStatus, setDbStatus] = useState('Terhubung Aman')
  const [userEmail, setUserEmail] = useState<string>('Memuat akun...')
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({})
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const [pockets, setPockets] = useState<Pocket[]>([])
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])

  const [newPocketTitle, setNewPocketTitle] = useState('')
  const [newPocketTarget, setNewPocketTarget] = useState('')
  const [newWishTitle, setNewWishTitle] = useState('')
  const [newWishPrice, setNewWishPrice] = useState('')
  const [newBudgetCat, setNewBudgetCat] = useState('Kuliner / Gofood')
  const [newBudgetLimit, setNewBudgetLimit] = useState('')

  const [selectedUserFilter, setSelectedUserFilter] = useState('all')
  const [reportSearch, setReportSearch] = useState('')
  const [reportTypeFilter, setReportTypeFilter] = useState<'all' | 'income' | 'expense'>('all')

  const router = useRouter()

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.email) {
      setUserEmail(user.email)
    }

    const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false })
    if (txData) {
      setTransactions(txData)
      const newMap: { [key: string]: string } = {}
      txData.forEach((item: any) => {
        if (item.user_id) {
          newMap[item.user_id] = item.user_id === user?.id ? (user?.email || item.user_id) : `User (${item.user_id.slice(0, 6)}...)`
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

    setDbStatus('Terhubung Aktif (Supabase)')
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSuccess = () => {
    alert('Transaksi berhasil disimpan! 🚀')
    fetchData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    document.cookie = "sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push('/login')
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
    await supabase.from('pockets').insert([{
      title: newPocketTitle,
      target_amount: parseFloat(newPocketTarget.replace(/\./g, '')),
      current_amount: 0,
      user_id: user?.id ?? ''
    }] as any)
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
    await supabase.from('wishlists').insert([{
      title: newWishTitle,
      price: parseFloat(newWishPrice.replace(/\./g, '')),
      user_id: user?.id ?? ''
    }] as any)
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
    await supabase.from('budgets').insert([{
      category: newBudgetCat,
      limit_amount: parseFloat(newBudgetLimit.replace(/\./g, '')),
      user_id: user?.id ?? ''
    }] as any)
    setNewBudgetLimit('')
    fetchData()
  }

  const handleDeleteBudget = async (id: string) => {
    await supabase.from('budgets').delete().eq('id', id)
    fetchData()
  }

  const netBalance = totalIncome - totalExpense

  const categoryTotals: { [key: string]: number } = {}
  transactions.filter(item => item.type === 'expense').forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amount)
  })
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])

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
    const matchesType = reportTypeFilter === 'all' || item.type === reportTypeFilter
    const matchesUser = selectedUserFilter === 'all' || item.user_id === selectedUserFilter
    return matchesSearch && matchesType && matchesUser
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
      <aside className={`w-64 border-r flex-col justify-between p-4 hidden md:flex ${bgSidebar}`}>
        <div>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="bg-lime-400 text-zinc-950 font-black px-2.5 py-1 rounded-lg text-lg tracking-wider">
              Duitku
            </div>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 mb-6 transition-all shadow-lg shadow-lime-400/10 cursor-pointer">
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
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left font-medium">
            <LogOut size={18} /> <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      <div className={`md:hidden flex items-center justify-around border-t p-2 fixed bottom-0 left-0 right-0 z-30 ${bgSidebar}`}>
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 flex flex-col items-center text-[10px] ${activeTab === 'dashboard' ? 'text-lime-500 font-bold' : textMuted}`}>
          <LayoutDashboard size={20} /> <span>Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('analitik')} className={`p-2 flex flex-col items-center text-[10px] ${activeTab === 'analitik' ? 'text-lime-500 font-bold' : textMuted}`}>
          <BarChart3 size={20} /> <span>Analitik</span>
        </button>
        <button onClick={() => setIsModalOpen(true)} className="bg-lime-400 text-zinc-950 p-3 rounded-full shadow-lg -mt-4">
          <Plus size={22} />
        </button>
        <button onClick={() => setActiveTab('report')} className={`p-2 flex flex-col items-center text-[10px] ${activeTab === 'report' ? 'text-lime-500 font-bold' : textMuted}`}>
          <FileText size={20} /> <span>Report</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`p-2 flex flex-col items-center text-[10px] ${activeTab === 'settings' ? 'text-lime-500 font-bold' : textMuted}`}>
          <Settings size={20} /> <span>Settings</span>
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
        <header className={`h-16 border-b backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 ${isLight ? 'bg-white/70 border-zinc-200' : 'bg-[#121214]/50 border-zinc-800'}`}>
          <div className="flex items-center gap-2">
            <div className={`text-[11px] md:text-xs px-3 py-1 rounded-full text-lime-500 font-medium flex items-center gap-1.5 border truncate max-w-[220px] md:max-w-none ${isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-800/60 border-zinc-700/50'}`}>
              <Flame size={14} className="text-lime-500 shrink-0" />
              <span className="truncate">Shared Financial Database</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`p-2 rounded-full border transition-all cursor-pointer ${isLight ? 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200' : 'bg-zinc-900 border-zinc-800 text-amber-400 hover:bg-zinc-800'}`}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setIsModalOpen(true)} className="hidden md:flex bg-lime-400 hover:bg-lime-300 text-zinc-950 font-semibold text-xs px-4 py-2 rounded-full items-center gap-1.5 transition-all shadow-md shadow-lime-400/10 cursor-pointer">
              <Plus size={14} /> <span>Transaksi Baru</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard & Riwayat 📋</h1>
                <p className={`text-xs mt-0.5 ${textMuted}`}>Kelola dan pantau seluruh histori transaksi bersama.</p>
              </div>
              <TransactionHistory />
            </div>
          )}

          {activeTab === 'analitik' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  Cek Jalur Duit Kamu 📊
                </h1>
                <p className={`text-xs mt-0.5 ${textMuted}`}>— No Judgement, Just Facts (Data Database Supabase)</p>
              </div>

              {/* ARUS KAS */}
              <div className={`border rounded-2xl p-4 md:p-6 space-y-4 ${bgCard}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <span className={`text-xs uppercase tracking-wider font-medium ${textMuted}`}>Analisis Tren Keuangan</span>
                    <h2 className="text-base font-bold">Arus Kas Database (Tren Masuk vs Keluar)</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-lime-400"></span> Masuk: Rp {totalIncome.toLocaleString('id-ID')}</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Keluar: Rp {totalExpense.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className={`h-48 md:h-52 flex items-end justify-around gap-2 md:gap-4 px-2 md:px-4 pt-8 border-b pb-2 ${borderColor}`}>
                  {['T1', 'T2', 'T3', 'T4', 'Terbaru'].map((label, idx) => {
                    const sampleIn = totalIncome > 0 ? (idx % 2 === 0 ? totalIncome * 0.4 : totalIncome * 0.6) : 10
                    const sampleEx = totalExpense > 0 ? (idx % 2 !== 0 ? totalExpense * 0.4 : totalExpense * 0.5) : 10
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full flex items-end justify-center gap-1 md:gap-2 h-full">
                          <div className="w-2/5 bg-lime-400 rounded-t-md transition-all group-hover:bg-lime-300" style={{ height: `${Math.min(100, (sampleIn / (totalIncome || 1)) * 100)}%` }}></div>
                          <div className="w-2/5 bg-rose-500 rounded-t-md transition-all group-hover:bg-rose-400" style={{ height: `${Math.min(100, (sampleEx / (totalExpense || 1)) * 100)}%` }}></div>
                        </div>
                        <span className={`text-[10px] font-medium ${textMuted}`}>{label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className={`flex flex-col md:flex-row items-start md:items-center justify-between text-xs gap-1 ${textMuted}`}>
                  <span>📈 Saldo Bersih: <strong className="text-lime-500">Rp {netBalance.toLocaleString('id-ID')}</strong></span>
                  <span>Total {transactions.length} Item Tercatat</span>
                </div>
              </div>

              {/* KEBOCORAN DANA */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`lg:col-span-2 border rounded-2xl p-4 md:p-6 flex flex-col justify-between ${bgCard}`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className={`text-xs uppercase tracking-wider font-medium ${textMuted}`}>Kebocoran Dana</span>
                        <h3 className="text-base font-bold">Grafik Proporsi Kategori Paling Boncos</h3>
                      </div>
                      <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full">Real-time</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-4">
                      <div className="flex items-center justify-center">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-8 border-rose-500 border-t-lime-400 border-r-amber-400 flex items-center justify-center shadow-inner relative">
                          <div className="text-center">
                            <span className={`text-[10px] block ${textMuted}`}>Total Keluar</span>
                            <span className="font-bold text-[11px] md:text-xs">Rp {totalExpense.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        {sortedCategories.length === 0 ? (
                          <div className={textMuted}>Belum ada pengeluaran tercatat.</div>
                        ) : (
                          sortedCategories.map(([cat, amount], idx) => {
                            const percent = totalExpense > 0 ? ((Number(amount) / totalExpense) * 100).toFixed(1) : 0
                            return (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between font-medium">
                                  <span className="truncate max-w-[140px]">{cat}</span>
                                  <span className="text-rose-500 font-bold">{percent}%</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                                  <div className={`h-full ${idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-400' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 p-3 rounded-xl border text-xs ${bgSubCard}`}>
                    <p>💡 <strong className="text-rose-500">Analisis Boncos:</strong> Pengeluaran terbesar di kategori <strong className="text-zinc-100">{sortedCategories.length > 0 ? sortedCategories[0][0] : '-'}</strong>.</p>
                  </div>
                </div>

                <div className={`border rounded-2xl p-4 md:p-6 flex flex-col justify-between ${bgCard}`}>
                  <div>
                    <span className={`text-xs uppercase tracking-wider font-medium ${textMuted}`}>Score Card</span>
                    <h3 className="text-lg font-bold mt-1">Status Keuangan</h3>
                    <div className={`border rounded-xl p-4 my-4 ${bgSubCard}`}>
                      <h4 className="text-sm font-semibold text-lime-500 mb-1">{netBalance >= 0 ? 'Sultan Terkendali' : 'Wajib Rem'}</h4>
                      <p className={`text-xs leading-relaxed ${textMuted}`}>
                        {netBalance >= 0 ? 'Arus kas masuk membackup pengeluaran dengan sangat baik.' : 'Pengeluaran melampaui batas aman pemasukan saat ini.'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-[11px] ${textMuted}`}>Sinkronisasi otomatis dengan database bersama.</div>
                </div>
              </div>

              {/* MOOD TRACKER */}
              <div className={`border rounded-2xl p-4 md:p-6 space-y-4 ${bgCard}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Brain size={18} className="text-lime-500" /> Financial Mood Tracker
                    </h3>
                    <p className={`text-xs mt-0.5 ${textMuted}`}>Analisis pengeluaran berdasarkan suasana hati saat bertransaksi.</p>
                  </div>
                  <div className={`border px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 ${inputBg}`}>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Mood Teratas: <strong className="text-amber-400">{sortedMoods.length > 0 ? sortedMoods[0][0] : 'Belum ada data'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sortedMoods.length === 0 ? (
                    <div className={`col-span-3 text-center py-8 text-xs ${textMuted}`}>Belum ada data transaksi dengan mood tercatat.</div>
                  ) : (
                    sortedMoods.slice(0, 3).map(([moodName, stats], idx) => (
                      <div key={idx} className={`border rounded-xl p-4 flex flex-col justify-between ${bgSubCard}`}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-lime-500">{moodName}</span>
                            <span className="text-[10px] bg-lime-400/10 text-lime-500 px-2 py-0.5 rounded font-medium">{stats.count} Transaksi</span>
                          </div>
                        </div>
                        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${borderColor}`}>
                          <span className={textMuted}>Total Keluar:</span>
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
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><FileText className="text-lime-500" /> Report Detail Transaksi 📑</h1>
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
                      <span className={textMuted}>{item.category} • {item.date} • <strong className="text-indigo-500">{userMap[item.user_id]}</strong></span>
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
                <h1 className="text-2xl font-bold tracking-tight">Kantong Nabung Bersama 💰</h1>
                <p className={`text-xs mt-0.5 ${textMuted}`}>Buat target tabungan bersama.</p>
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
                <h1 className="text-2xl font-bold tracking-tight">Wishlist Impian ✨</h1>
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
                <h1 className="text-2xl font-bold tracking-tight">Budgeting Bulanan 🎯</h1>
              </div>
              <form onSubmit={handleAddBudget} className={`border rounded-2xl p-4 md:p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-sm font-bold text-lime-500">Atur Limit Budget</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <select value={newBudgetCat} onChange={(e) => setNewBudgetCat(e.target.value)} className={`border rounded-xl px-3.5 py-2.5 ${inputBg}`}>
                    <option value="Kuliner / Gofood">Kuliner / Gofood</option>
                    <option value="E-Commerce / Gadget">E-Commerce / Gadget</option>
                    <option value="Hangout & Party">Hangout & Party</option>
                    <option value="Transport">Transport</option>
                  </select>
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
              <h1 className="text-2xl font-bold tracking-tight">Pengaturan Aplikasi ⚙️</h1>
              <div className={`border rounded-2xl p-6 space-y-4 ${bgCard}`}>
                <h3 className="text-sm font-bold text-lime-500">Preferensi Tampilan Tema</h3>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-xl border ${theme === 'dark' ? 'bg-zinc-800 text-amber-400 font-bold' : textMuted}`}>Dark Mode</button>
                  <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-xl border ${theme === 'light' ? 'bg-white text-zinc-900 font-bold shadow' : textMuted}`}>Light Mode</button>
                </div>
              </div>
              <div className="border border-rose-500/30 rounded-2xl p-6 bg-rose-500/5 space-y-3">
                <h3 className="text-sm font-bold text-rose-500">Zona Manajemen Data Bersama</h3>
                <button onClick={handleResetData} className="w-full md:w-auto bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer">Hapus & Reset Semua Data Transaksi</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
    </div>
  )
}