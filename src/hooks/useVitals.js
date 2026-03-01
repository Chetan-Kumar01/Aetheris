import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── Clinical range bounds per vital ─── */
const RANGES = {
    hr: { min: 55, max: 110, step: 3 },  // bpm
    spo2: { min: 91, max: 100, step: 0.5 },  // %
    sbp: { min: 95, max: 165, step: 4 },  // systolic mmHg
    dbp: { min: 55, max: 100, step: 2 },  // diastolic mmHg
    temp: { min: 36.0, max: 38.6, step: 0.1 },  // °C
    etco2: { min: 30, max: 48, step: 1 },  // mmHg
}

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)) }
function jitter(v, step, min, max) {
    const delta = (Math.random() - 0.48) * step * 2
    return parseFloat(clamp(v + delta, min, max).toFixed(1))
}

const HISTORY_SIZE = 20
const INTERVAL_MS = 1500

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

    // Keep a mutable ref so the interval always has fresh values
    const stateRef = useRef(state)
    stateRef.current = state

    const tick = useCallback(() => {
        setState(prev => {
            const hr = jitter(prev.hr, RANGES.hr.step, RANGES.hr.min, RANGES.hr.max)
            const spo2 = jitter(prev.spo2, RANGES.spo2.step, RANGES.spo2.min, RANGES.spo2.max)
            const sbp = jitter(prev.sbp, RANGES.sbp.step, RANGES.sbp.min, RANGES.sbp.max)
            const dbp = jitter(prev.dbp, RANGES.dbp.step, RANGES.dbp.min, RANGES.dbp.max)
            const temp = jitter(prev.temp, RANGES.temp.step, RANGES.temp.min, RANGES.temp.max)
            const etco2 = jitter(prev.etco2, RANGES.etco2.step, RANGES.etco2.min, RANGES.etco2.max)

            const now = new Date()
            const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

            const entry = { time: timeLabel, hr, spo2, bp: Math.round(sbp), temp, etco2 }
            const history = [...prev.history, entry].slice(-HISTORY_SIZE)

            return { hr, spo2, sbp, dbp, temp, etco2, history }
        })
    }, [])

    useEffect(() => {
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
