'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function UserMenu() {
  const t = useTranslations('auth')
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
  }

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        {t('sign_in')}
      </Link>
    )
  }

  const user = session.user
  const isAdmin = user.role === 'admin'
  const initials = (user.name || 'U').slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={t('user_menu')}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border border-white/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 rounded">
                Admin
              </span>
            )}
          </div>
          <div className="py-1">
            {isAdmin && (
              <Link
                href="/admin"
                className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                onClick={() => setOpen(false)}
              >
                {t('admin_panel')}
              </Link>
            )}
            <button
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors"
            >
              {t('sign_out')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
