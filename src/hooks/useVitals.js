import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── Clinical range bounds per vital ─── */
const RANGES = {
    hr: { min: 55, max: 110, step: 3, normal: { lo: 65, hi: 95 } },
    spo2: { min: 91, max: 100, step: 0.5, normal: { lo: 96, hi: 100 } },
    sbp: { min: 95, max: 165, step: 4, normal: { lo: 110, hi: 140 } },
    dbp: { min: 55, max: 100, step: 2, normal: { lo: 60, hi: 85 } },
    temp: { min: 36.0, max: 38.6, step: 0.1, normal: { lo: 36.3, hi: 37.5 } },
    etco2: { min: 30, max: 48, step: 1, normal: { lo: 34, hi: 42 } },
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }

function jitter(v, step, min, max) {
    const delta = (Math.random() - 0.5) * step * 2  // unbiased
    return parseFloat(clamp(v + delta, min, max).toFixed(1))
}

/**
 * Anomaly injection: ~8% chance each tick of an anomaly event.
 * When triggered, picks a random vital and pushes it toward
 * an abnormal value for 3-6 ticks (4.5s-9s), then recovers.
 */
const ANOMALY_TYPES = [
    { vital: 'hr', dir: 'low', target: 57, label: 'Bradycardia' },
    { vital: 'hr', dir: 'high', target: 108, label: 'Tachycardia' },
    { vital: 'spo2', dir: 'low', target: 92, label: 'SpO2 Desaturation' },
    { vital: 'spo2', dir: 'low', target: 94, label: 'SpO2 Decline' },
    { vital: 'sbp', dir: 'high', target: 160, label: 'Hypertensive Spike' },
    { vital: 'sbp', dir: 'low', target: 98, label: 'Hypotension' },
    { vital: 'temp', dir: 'high', target: 38.4, label: 'Fever' },
]

const HISTORY_SIZE = 20
const INTERVAL_MS = 1500
const ANOMALY_CHANCE = 0.08   // 8% per tick → ~1 anomaly every 20 ticks (~30 seconds)
const ANOMALY_DURATION = () => 3 + Math.floor(Math.random() * 4) // 3-6 ticks

/**
 * useVitals(patientId, initialVitals?)
 *
 * Returns { hr, spo2, bp, temp, etco2, history }
 * history: array of last 20 readings shaped { time, hr, spo2, bp, temp, etco2 }
 */
export default function useVitals(patientId, initialVitals = {}) {
    const [state, setState] = useState(() => ({
        hr: initialVitals.hr ?? 76,
        spo2: initialVitals.spo2 ?? 98,
        sbp: initialVitals.sbp ?? 120,
        dbp: initialVitals.dbp ?? 80,
        temp: initialVitals.temp ?? 36.8,
        etco2: initialVitals.etco2 ?? 36,
        history: [],
    }))

    // Anomaly state: { type, ticksLeft } or null
    const anomalyRef = useRef(null)

    const tick = useCallback(() => {
        setState(prev => {
            // Check if we should start a new anomaly
            if (!anomalyRef.current && Math.random() < ANOMALY_CHANCE) {
                const type = ANOMALY_TYPES[Math.floor(Math.random() * ANOMALY_TYPES.length)]
                anomalyRef.current = { ...type, ticksLeft: ANOMALY_DURATION() }
            }

            let hr = jitter(prev.hr, RANGES.hr.step, RANGES.hr.min, RANGES.hr.max)
            let spo2 = jitter(prev.spo2, RANGES.spo2.step, RANGES.spo2.min, RANGES.spo2.max)
            let sbp = jitter(prev.sbp, RANGES.sbp.step, RANGES.sbp.min, RANGES.sbp.max)
            let dbp = jitter(prev.dbp, RANGES.dbp.step, RANGES.dbp.min, RANGES.dbp.max)
            let temp = jitter(prev.temp, RANGES.temp.step, RANGES.temp.min, RANGES.temp.max)
            let etco2 = jitter(prev.etco2, RANGES.etco2.step, RANGES.etco2.min, RANGES.etco2.max)

            // Apply anomaly: pull the affected vital toward the target
            if (anomalyRef.current) {
                const a = anomalyRef.current
                const lerp = 0.3 + Math.random() * 0.2  // move 30-50% toward target each tick
                switch (a.vital) {
                    case 'hr':
                        hr = parseFloat((prev.hr + (a.target - prev.hr) * lerp).toFixed(1))
                        hr = clamp(hr, RANGES.hr.min, RANGES.hr.max)
                        break
                    case 'spo2':
                        spo2 = parseFloat((prev.spo2 + (a.target - prev.spo2) * lerp).toFixed(1))
                        spo2 = clamp(spo2, RANGES.spo2.min, RANGES.spo2.max)
                        break
                    case 'sbp':
                        sbp = parseFloat((prev.sbp + (a.target - prev.sbp) * lerp).toFixed(1))
                        sbp = clamp(sbp, RANGES.sbp.min, RANGES.sbp.max)
                        break
                    case 'temp':
                        temp = parseFloat((prev.temp + (a.target - prev.temp) * lerp).toFixed(1))
                        temp = clamp(temp, RANGES.temp.min, RANGES.temp.max)
                        break
                    default:
                        break
                }
                a.ticksLeft--
                if (a.ticksLeft <= 0) anomalyRef.current = null
            } else {
                // When no anomaly, gently pull back toward normal range (mean reversion)
                const pull = 0.05
                const nr = RANGES.hr.normal
                if (hr < nr.lo) hr = parseFloat((hr + (nr.lo - hr) * pull).toFixed(1))
                else if (hr > nr.hi) hr = parseFloat((hr + (nr.hi - hr) * pull).toFixed(1))

                const ns = RANGES.spo2.normal
                if (spo2 < ns.lo) spo2 = parseFloat((spo2 + (ns.lo - spo2) * pull).toFixed(1))
            }

            const now = new Date()
            const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

            const entry = { time: timeLabel, hr, spo2, bp: Math.round(sbp), temp, etco2 }
            const history = [...prev.history, entry].slice(-HISTORY_SIZE)

            return { hr, spo2, sbp, dbp, temp, etco2, history }
        })
    }, [])

    useEffect(() => {
        // Reset anomaly state on patient change
        anomalyRef.current = null

        // Seed history with initial readings immediately
        setState(prev => {
            const now = new Date()
            const seed = Array.from({ length: HISTORY_SIZE }, (_, i) => {
                const t = new Date(now - (HISTORY_SIZE - i) * INTERVAL_MS)
                const label = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`
                return {
                    time: label,
                    hr: jitter(prev.hr, RANGES.hr.step, RANGES.hr.min, RANGES.hr.max),
                    spo2: jitter(prev.spo2, RANGES.spo2.step, RANGES.spo2.min, RANGES.spo2.max),
                    bp: Math.round(jitter(prev.sbp, RANGES.sbp.step, RANGES.sbp.min, RANGES.sbp.max)),
                    temp: jitter(prev.temp, RANGES.temp.step, RANGES.temp.min, RANGES.temp.max),
                    etco2: jitter(prev.etco2, RANGES.etco2.step, RANGES.etco2.min, RANGES.etco2.max),
                }
            })
            return { ...prev, history: seed }
        })

        const id = setInterval(tick, INTERVAL_MS)
        return () => clearInterval(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId])   // restart when patient changes

    const { hr, spo2, sbp, dbp, temp, etco2, history } = state
    return {
        hr,
        spo2,
        bp: `${Math.round(sbp)}/${Math.round(dbp)}`,
        temp,
        etco2,
        history,
    }
}
