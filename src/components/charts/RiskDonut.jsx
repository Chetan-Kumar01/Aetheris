import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function DonutTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white shadow-xl">
            {payload[0].name}: {payload[0].value}%
        </div>
    )
}

/**
 * RiskDonut — Overall risk score donut chart.
 *
 * Props:
 *   score  — numeric 0-100 (default 15)
 *   color  — risk fill color (default amber)
 *   height — chart height in px (default 140)
 *   label  — centre label line 2 (default 'Overall')
 */
export default function RiskDonut({
    score = 15,
    color = '#f59e0b',
    height = 140,
    label = 'Overall',
}) {
    const data = [
        { name: 'Risk', value: score },
        { name: 'Clear', value: 100 - score },
    ]

    return (
        <div className="relative">
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%" cy="50%"
                        innerRadius={40}
                        outerRadius={58}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        <Cell fill={color} />
                        <Cell fill="#1f2937" />
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold" style={{ color }}>{score}%</span>
                <span className="text-[10px] text-gray-500 -mt-0.5">{label}</span>
            </div>
        </div>
    )
}
