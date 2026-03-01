/**
 * StatusBadge
 * Props: status ("active"|"warning"|"critical"|"inactive"), label (string)
 */

const STYLES = {
    active: {
        wrap: 'bg-green-500/20 text-green-400 border border-green-500/30',
        dot: 'bg-green-400',
    },
    warning: {
        wrap: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        dot: null,
    },
    critical: {
        wrap: 'bg-red-500/20 text-red-400 border border-red-500/30',
        dot: null,
    },
    inactive: {
        wrap: 'bg-gray-700 text-gray-400',
        dot: null,
    },
}

export default function StatusBadge({ status = 'inactive', label = '' }) {
    const { wrap, dot } = STYLES[status] ?? STYLES.inactive

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${wrap}`}
        >
            {/* Pulsing dot — only for 'active' */}
            {dot && (
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span className={`pulse-dot absolute inline-flex h-full w-full rounded-full ${dot} opacity-75`} />
                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${dot}`} />
                </span>
            )}
            {label}
        </span>
    )
}
