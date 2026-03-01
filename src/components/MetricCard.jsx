import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * MetricCard
 * Props:
 *   title      string
 *   icon       lucide-react component
 *   value      string | number
 *   unit       string          (e.g. "bpm", "%")
 *   trend      "up" | "down" | null
 *   trendValue string          (e.g. "+4.2%")
 *   color      string          tailwind color name: "teal"|"green"|"red"|"amber"|"blue"|"violet"
 */

const COLOR_MAP = {
    teal: { icon: 'text-teal-400', bg: 'bg-teal-500/20' },
    green: { icon: 'text-green-400', bg: 'bg-green-500/20' },
    red: { icon: 'text-red-400', bg: 'bg-red-500/20' },
    amber: { icon: 'text-amber-400', bg: 'bg-amber-500/20' },
    blue: { icon: 'text-blue-400', bg: 'bg-blue-500/20' },
    violet: { icon: 'text-violet-400', bg: 'bg-violet-500/20' },
}

export default function MetricCard({
    title = '',
    icon: Icon,
    value = '—',
    unit = '',
    trend = null,
    trendValue = '',
    color = 'teal',
}) {
    const { icon: iconColor, bg: iconBg } = COLOR_MAP[color] ?? COLOR_MAP.teal
    const isUp = trend === 'up'
    const isDown = trend === 'down'

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-all group">
            {/* Top row: label + icon */}
            <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider leading-snug">
                    {title}
                </p>
                {Icon && (
                    <div
                        className={`rounded-xl p-2 ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                        <Icon size={18} className={iconColor} />
                    </div>
                )}
            </div>

            {/* Value */}
            <div className="flex items-end gap-1.5 mb-3">
                <span className="text-3xl font-bold text-white leading-none">{value}</span>
                {unit && (
                    <span className="text-sm text-gray-400 mb-0.5 leading-none">{unit}</span>
                )}
            </div>

            {/* Trend */}
            {trend && (
                <div
                    className={`flex items-center gap-1 text-xs font-semibold ${isUp ? 'text-green-400' : 'text-red-400'
                        }`}
                >
                    {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>{trendValue}</span>
                    <span className="text-gray-500 font-normal ml-1">vs last hour</span>
                </div>
            )}
        </div>
    )
}
