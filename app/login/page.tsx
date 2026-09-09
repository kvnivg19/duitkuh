'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Flame, Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        alert('Gagal mendaftar: ' + error.message)
      } else {
        alert('Registrasi berhasil! Silakan login.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert('Gagal login: ' + error.message)
      } else {
        // Tulis cookie manual agar dibaca oleh middleware
        document.cookie = "sb-auth-token=true; path=/; max-age=31536000"
        window.location.href = '/'
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 font-sans items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121214] border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 px-3 py-1 rounded-full text-lime-400 text-xs font-semibold">
            <Flame size={14} /> Ivan May Tracker
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            {isSignUp ? 'Buat Akun Baru ✨' : 'Selamat Datang Kembali 👋'}
          </h1>
          <p className="text-xs text-zinc-400">
            {isSignUp ? 'Daftar untuk mengamankan data keuangan pribadimu.' : 'Masuk untuk mengakses dashboard keuangan bersama.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-3 text-zinc-100 focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1.5 font-medium">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-3 text-zinc-100 focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-lime-400/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{loading ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Masuk ke Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
          {isSignUp ? (
            <p>
              Sudah punya akun?{' '}
              <button onClick={() => setIsSignUp(false)} className="text-lime-400 font-semibold hover:underline cursor-pointer">
                Masuk di sini
              </button>
            </p>
          ) : (
            <p>
              Belum punya akun?{' '}
              <button onClick={() => setIsSignUp(true)} className="text-lime-400 font-semibold hover:underline cursor-pointer">
                Daftar gratis
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}