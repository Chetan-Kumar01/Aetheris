import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
} from 'recharts'

/* ── Custom tooltip ──────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="text-gray-400 mb-1 font-medium">{label}</p>
            {payload.map(p => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-gray-300">{p.name}:</span>
                    <span className="text-white font-semibold">{p.value}</span>
                </div>
            ))}
        </div>
    )
}

/* ── Series config ───────────────────────────────────────── */
const SERIES = [
    { key: 'hr', name: 'HR', color: '#ef4444', gradId: 'g-hr' },
    { key: 'spo2', name: 'SpO₂', color: '#3b82f6', gradId: 'g-spo2' },
    { key: 'bp', name: 'BP', color: '#eab308', gradId: 'g-bp' },
    { key: 'etco2', name: 'EtCO₂', color: '#a855f7', gradId: 'g-etco2' },
]

/**
 * VitalsChart — reusable real-time operative vitals area chart.
 *
 * Props:
 *   data   — array of { time, hr, spo2, bp, etco2 }
 *   height — chart height in px (default 220)
 */
export default function VitalsChart({ data = [], height = 220 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                    {SERIES.map(({ gradId, color }) => (
                        <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                    dataKey="time"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                />
                <Tooltip content={<ChartTooltip />} />

                {SERIES.map(({ key, name, color, gradId }) => (
                    <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={name}
                        stroke={color}
                        strokeWidth={1.5}
                        fill={`url(#${gradId})`}
                        dot={false}
                        isAnimationActive={false}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    )
}
