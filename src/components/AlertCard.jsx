import { X } from 'lucide-react'

/**
 * AlertCard
 * Props:
 *   severity  "high" | "medium" | "low"
 *   title     string
 *   message   string
 *   time      string   (e.g. "2 min ago")
 *   onDismiss function | undefined
 */

const SEVERITY_MAP = {
    high: { border: 'border-red-500', dot: 'bg-red-500', badge: 'bg-red-500/20 text-red-400', label: 'High' },
    medium: { border: 'border-amber-500', dot: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-400', label: 'Medium' },
    low: { border: 'border-blue-500', dot: 'bg-blue-500', badge: 'bg-blue-500/20 text-blue-400', label: 'Low' },
}

export default function AlertCard({
    severity = 'medium',
    title = '',
    message = '',
    time = '',
    onDismiss,
}) {
    const { border, dot, badge, label } = SEVERITY_MAP[severity] ?? SEVERITY_MAP.medium

    return (
        <div className={`flex border-l-4 ${border} bg-gray-800 rounded-r-xl overflow-hidden`}>
            <div className="flex-1 p-4 min-w-0">
                {/* Top: title + severity badge + time */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                        {label}
                    </span>
                    <p className="text-sm font-semibold text-white leading-tight">{title}</p>
                </div>

                {/* Message */}
                {message && (
                    <p className="text-xs text-gray-400 leading-snug mt-1 truncate">{message}</p>
                )}

                {/* Time */}
                {time && (
                    <p className="text-[10px] text-gray-600 mt-2 font-medium">{time}</p>
                )}
            </div>

            {/* Dismiss button */}
            {onDismiss && (
                <div className="flex items-start p-3">
                    <button
                        onClick={onDismiss}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-white hover:bg-gray-700/60 transition-all"
                        aria-label="Dismiss alert"
                    >
                        <X size={13} />
                    </button>
                </div>
            )}
        </div>
    )
}
