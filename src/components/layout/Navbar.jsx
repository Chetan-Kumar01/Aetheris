import { useLocation } from 'react-router-dom'
import { Menu, Bell, Sun, Moon } from 'lucide-react'
import BackendStatus from '../ui/BackendStatus'

const PAGE_TITLES = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/preop': 'Pre-Op',
    '/intraop': 'Intra-Op',
    '/postop': 'Post-Op',
    '/reports': 'Reports',
    '/components': 'Components',
    '/settings': 'Settings',
}

/**
 * Navbar (top header bar)
 *
 * Props:
 *   onMenuClick   – opens mobile sidebar
 *   isDark        – current theme
 *   toggleTheme   – switches dark / light
 *   unreadCount   – badge on bell icon
 *   onBellClick   – opens notification panel
 */
export default function Navbar({ onMenuClick, isDark, toggleTheme, unreadCount, onBellClick }) {
    const location = useLocation()
    const title = PAGE_TITLES[location.pathname] ?? 'Dashboard'

    return (
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center
      justify-between px-4 lg:px-6 gap-4 flex-shrink-0 sticky top-0 z-30">

            {/* Left: hamburger (mobile only) + breadcrumb + title */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
                <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest hidden sm:block">
                        Aetheris / {title}
                    </p>
                    <h1 className="text-white font-semibold text-base leading-tight">{title}</h1>
                </div>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2 flex-shrink-0">

                {/* System active badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-green-900/30 border border-green-800/30">
                    <span className="relative flex h-2 w-2">
                        <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-xs font-medium text-green-400">System Active</span>
                </div>

                {/* Backend health badge */}
                <BackendStatus />

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-lg flex items-center justify-center
            text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={isDark ? 'Light mode' : 'Dark mode'}
                >
                    {isDark ? <Sun size={17} /> : <Moon size={17} />}
                </button>

                {/* Notification bell */}
                <button
                    onClick={onBellClick}
                    className="relative w-9 h-9 rounded-lg flex items-center justify-center
            text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                    aria-label="Notifications"
                >
                    <Bell size={17} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                    )}
                </button>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700
          flex items-center justify-center text-white font-bold text-xs cursor-pointer
          hover:ring-2 hover:ring-teal-500/50 transition-all">
                    JD
                </div>
            </div>
        </header>
    )
}
