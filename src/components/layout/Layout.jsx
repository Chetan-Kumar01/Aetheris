import { useState, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Bell, X, CheckCheck, Settings, ShieldCheck } from 'lucide-react'

import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Toast from '../ui/Toast'
import { toast } from '../../utils/toast'
import { useAetheris } from '../../context/AetherisContext'

import DashboardPage from '../../pages/DashboardPage'
import PreOpPage from '../../pages/PreOpPage'
import IntraOpPage from '../../pages/IntraOpPage'
import PostOpPage from '../../pages/PostOpPage'
import ReportsPage from '../../pages/ReportsPage'
import ComponentShowcase from '../../pages/ComponentShowcase'

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function timeAgo(timestamp) {
    if (!timestamp) return 'just now'
    // Accept ISO strings or already-formatted strings like "2 min ago"
    if (typeof timestamp === 'string' && !timestamp.includes('T')) return timestamp
    const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

const NOTIF_STYLE = {
    critical: { dot: 'bg-red-500', badge: 'bg-red-900/40 text-red-400 border border-red-800/40' },
    warning: { dot: 'bg-amber-500', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40' },
    info: { dot: 'bg-blue-500', badge: 'bg-blue-900/40 text-blue-400 border border-blue-800/40' },
    success: { dot: 'bg-green-500', badge: 'bg-green-900/40 text-green-400 border border-green-800/40' },
    // severity aliases
    HIGH: { dot: 'bg-red-500', badge: 'bg-red-900/40 text-red-400 border border-red-800/40' },
    MEDIUM: { dot: 'bg-amber-500', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40' },
    LOW: { dot: 'bg-blue-500', badge: 'bg-blue-900/40 text-blue-400 border border-blue-800/40' },
}

/* ── Notification panel ──────────────────────────────────────────────────── */
function NotificationPanel({ open, onClose }) {
    const { alerts, unreadAlertCount, acknowledgeAlert, acknowledgeAll } = useAetheris()

    const styleFor = (alert) =>
        NOTIF_STYLE[alert.type] ||
        NOTIF_STYLE[alert.severity] ||
        NOTIF_STYLE.info

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            )}
            <div className={`fixed top-0 right-0 h-screen w-80 bg-gray-900 border-l border-gray-800
        z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Bell size={16} className="text-teal-400" />
                        <h3 className="text-white font-semibold text-sm">Notifications</h3>
                        {unreadAlertCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                                {unreadAlertCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadAlertCount > 0 && (
                            <button
                                onClick={acknowledgeAll}
                                className="text-[10px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                            >
                                <CheckCheck size={12} /> Mark all read
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Alert list */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
                            <div className="w-12 h-12 rounded-full bg-green-900/30 border border-green-800/30 flex items-center justify-center">
                                <ShieldCheck size={22} className="text-green-400" />
                            </div>
                            <p className="text-green-400 text-sm font-semibold">No active alerts</p>
                            <p className="text-gray-500 text-xs">All systems normal</p>
                        </div>
                    ) : (
                        alerts.map(alert => {
                            const s = styleFor(alert)
                            const isRead = alert.acknowledged
                            return (
                                <div
                                    key={alert.id}
                                    className={`px-5 py-4 hover:bg-gray-800/50 transition-colors
                      ${!isRead ? 'bg-gray-800/20' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${isRead ? 'bg-gray-700' : s.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold mb-0.5 ${isRead ? 'text-gray-400' : 'text-white'}`}>
                                                {alert.title}
                                            </p>
                                            <p className="text-xs text-gray-500 leading-snug">{alert.message}</p>
                                            <p className="text-[10px] text-gray-600 mt-1">
                                                {timeAgo(alert.timestamp || alert.time)}
                                            </p>
                                        </div>
                                        {!isRead && (
                                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.badge}`}>NEW</span>
                                                <button
                                                    onClick={() => acknowledgeAlert(alert.id)}
                                                    className="text-[10px] text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                                                    title="Acknowledge"
                                                >
                                                    ✓
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </>
    )
}

/* ── Settings placeholder ────────────────────────────────── */
function SettingsPage() {
    return (
        <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                <Settings size={28} className="text-gray-600" />
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Settings</h2>
            <p className="text-gray-500 text-sm max-w-xs">
                Configuration panel coming soon. Manage your preferences, notifications, and security here.
            </p>
        </div>
    )
}

/* ── Layout — top-level shell rendered inside BrowserRouter ─ */
export default function Layout() {
    const { unreadAlertCount } = useAetheris()

    /* Mobile sidebar */
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const closeSidebar = useCallback(() => setSidebarOpen(false), [])

    /* Dark / light theme */
    const [isDark, setIsDark] = useState(() =>
        localStorage.getItem('aetheris-theme') !== 'light'
    )
    useEffect(() => {
        document.documentElement.classList.toggle('light', !isDark)
        localStorage.setItem('aetheris-theme', isDark ? 'dark' : 'light')
    }, [isDark])

    const toggleTheme = useCallback(() => {
        setIsDark(d => !d)
        toast.info(isDark ? 'Switched to light mode' : 'Switched to dark mode')
    }, [isDark])

    /* Notification panel */
    const [notifOpen, setNotifOpen] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-gray-950">

            {/* Sidebar (desktop + mobile) */}
            <Sidebar
                open={sidebarOpen}
                onClose={closeSidebar}
                unreadCount={unreadAlertCount}
            />

            {/* Main content column */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                    isDark={isDark}
                    toggleTheme={toggleTheme}
                    unreadCount={unreadAlertCount}
                    onBellClick={() => setNotifOpen(o => !o)}
                />

                <main className="flex-1 overflow-y-auto bg-gray-950 p-4 lg:p-6">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/preop" element={<PreOpPage />} />
                        <Route path="/intraop" element={<IntraOpPage />} />
                        <Route path="/postop" element={<PostOpPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/components" element={<ComponentShowcase />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>

            {/* Notification panel — driven by global context */}
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

            {/* Toast notifications */}
            <Toast />
        </div>
    )
}
