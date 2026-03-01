import { useState, useEffect, useRef } from 'react'
import { subscribeToast } from '../utils/toast'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const STYLES = {
    success: {
        border: 'border-green-500/50',
        iconBg: 'bg-green-900/40',
        icon: CheckCircle,
        iconCls: 'text-green-400',
        bar: 'bg-green-500',
        title: 'Success',
    },
    error: {
        border: 'border-red-500/50',
        iconBg: 'bg-red-900/40',
        icon: XCircle,
        iconCls: 'text-red-400',
        bar: 'bg-red-500',
        title: 'Error',
    },
    warning: {
        border: 'border-amber-500/50',
        iconBg: 'bg-amber-900/40',
        icon: AlertTriangle,
        iconCls: 'text-amber-400',
        bar: 'bg-amber-500',
        title: 'Warning',
    },
    info: {
        border: 'border-blue-500/50',
        iconBg: 'bg-blue-900/40',
        icon: Info,
        iconCls: 'text-blue-400',
        bar: 'bg-blue-500',
        title: 'Info',
    },
}

/* Single toast card with animated progress bar auto-dismiss */
function ToastCard({ toast, onRemove }) {
    const [progress, setProgress] = useState(100)
    const [visible, setVisible] = useState(false)
    const intervalRef = useRef(null)

    /* Slide-in on mount */
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true))
    }, [])

    /* Countdown bar */
    useEffect(() => {
        const start = Date.now()
        const dur = toast.duration ?? 4000
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - start
            const pct = Math.max(0, 100 - (elapsed / dur) * 100)
            setProgress(pct)
            if (pct === 0) {
                clearInterval(intervalRef.current)
                dismiss()
            }
        }, 50)
        return () => clearInterval(intervalRef.current)
    }, []) // eslint-disable-line

    const dismiss = () => {
        setVisible(false)
        setTimeout(() => onRemove(toast.id), 300)
    }

    const s = STYLES[toast.type] ?? STYLES.info
    const Icon = s.icon

    return (
        <div
            className={`relative w-80 bg-gray-900 border ${s.border} rounded-xl shadow-2xl
        overflow-hidden transition-all duration-300
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className="flex items-start gap-3 p-4">
                <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={15} className={s.iconCls} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs font-semibold text-white">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{toast.msg}</p>
                </div>
                <button
                    onClick={dismiss}
                    className="text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0 -mt-0.5"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-gray-800">
                <div
                    className={`h-full ${s.bar} transition-none`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}

/* Container fixed to bottom-right, renders toast stack */
export default function ToastContainer() {
    const [toasts, setToasts] = useState([])

    useEffect(() => {
        const unsub = subscribeToast(t =>
            setToasts(prev => [...prev, t])
        )
        return unsub
    }, [])

    const remove = id =>
        setToasts(prev => prev.filter(t => t.id !== id))

    return (
        <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-3 items-end pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastCard toast={t} onRemove={remove} />
                </div>
            ))}
        </div>
    )
}
