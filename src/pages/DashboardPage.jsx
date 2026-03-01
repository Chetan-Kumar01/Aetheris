import React, { useState, useEffect, useCallback } from 'react'
import {
    Users, AlertTriangle, Scissors, FileText,
    Heart, Activity, TrendingUp, Download, X,
    ChevronUp, Wind, Thermometer, Wifi, WifiOff,
    RefreshCw, Sparkles, Zap,
} from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAetheris } from '../context/AetherisContext'
import { DEMO_PATIENT } from '../api/constants'
import useVitals from '../hooks/useVitals'
import { useNavigate } from 'react-router-dom'

/* ── COUNT-UP HOOK ────────────────────────────────────── */
function useCountUp(target, duration = 800) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        let frame
        const start = performance.now()
        const tick = now => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 2)
            setCount(Math.round(eased * target))
            if (progress < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [target, duration])
    return count
}

/* ── SKELETON SCREEN ──────────────────────────────────── */
function SkeletonCard({ className = '' }) {
    return (
        <div className={`bg-gray-800 rounded-2xl border border-gray-700/50 animate-pulse ${className}`}>
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                        <div className="h-2.5 w-24 bg-gray-700 rounded-full" />
                        <div className="h-8 w-16 bg-gray-700 rounded-lg" />
                    </div>
                    <div className="w-10 h-10 bg-gray-700 rounded-xl" />
                </div>
                <div className="h-2 w-20 bg-gray-700 rounded-full" />
            </div>
        </div>
    )
}

function SkeletonDashboard() {
    return (
        <div className="animate-fadeIn space-y-5">
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div className="bg-gray-800 rounded-2xl border border-gray-700/50 animate-pulse p-5">
                <div className="h-[280px] bg-gray-700/50 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-72 bg-gray-800 rounded-2xl border border-gray-700/50 animate-pulse" />
                <div className="h-72 bg-gray-800 rounded-2xl border border-gray-700/50 animate-pulse" />
            </div>
        </div>
    )
}

/* ── CONNECTION STATUS BANNER ─────────────────────────── */
function ConnectionBanner({ isConnected }) {
    if (isConnected) {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl
        bg-green-900/20 border border-green-800/30 text-green-400 text-xs font-medium">
                <Wifi size={13} />
                <span>All systems operational — WebSocket connected</span>
            </div>
        )
    }
    return (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl
      bg-amber-900/20 border border-amber-800/30 text-amber-400 text-xs font-medium">
            <div className="flex items-center gap-2">
                <WifiOff size={13} />
                <span>Vitals stream offline — Backend may be unavailable</span>
            </div>
            <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1
          rounded-lg bg-amber-800/40 hover:bg-amber-700/50 transition-colors whitespace-nowrap"
            >
                <RefreshCw size={10} />
                Retry
            </button>
        </div>
    )
}

/* ── DEMO BANNER ──────────────────────────────────────── */
function DemoBanner({ onLoad, currentPatient }) {
    const [loaded, setLoaded] = useState(false)

    const handleLoad = useCallback(() => {
        onLoad(DEMO_PATIENT)
        setLoaded(true)
    }, [onLoad])

    if (currentPatient) return null   // hide once a patient is selected

    return (
        <div className="relative overflow-hidden rounded-2xl border border-teal-700/40
      bg-gradient-to-r from-teal-950 via-gray-900 to-gray-950 p-5">
            {/* Decorative glow */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full
        bg-teal-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-600/20 border border-teal-700/40
            flex items-center justify-center flex-shrink-0">
                        <Sparkles size={22} className="text-teal-400" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-base mb-0.5 flex items-center gap-2">
                            Live Demo Mode
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                bg-teal-600/30 text-teal-400 border border-teal-700/40">
                                JUDGE READY
                            </span>
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Load <span className="text-teal-400 font-semibold">Rajesh Kumar</span> — Cardiac surgery,
                            ASA III, known drug interactions &amp; live vitals stream
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLoad}
                    disabled={loaded}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
            transition-all flex-shrink-0 shadow-lg
            ${loaded
                            ? 'bg-green-700 text-green-100 cursor-default shadow-green-900/30'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/50 active:scale-[0.97]'}`}
                >
                    {loaded ? (
                        <><Zap size={15} className="fill-current" /> Patient Loaded ✓</>
                    ) : (
                        <><Sparkles size={15} /> Load Demo Patient</>
                    )}
                </button>
            </div>
        </div>
    )
}

/* ── STATIC CHART DATA ────────────────────────────────── */
const vitalsData = [
    { time: '08:00', hr: 72, spo2: 97, bp: 118, temp: 36.5 },
    { time: '08:10', hr: 75, spo2: 98, bp: 121, temp: 36.6 },
    { time: '08:20', hr: 78, spo2: 97, bp: 119, temp: 36.7 },
    { time: '08:30', hr: 80, spo2: 99, bp: 123, temp: 36.8 },
    { time: '08:40', hr: 76, spo2: 98, bp: 120, temp: 36.7 },
    { time: '08:50', hr: 79, spo2: 98, bp: 122, temp: 36.9 },
    { time: '09:00', hr: 78, spo2: 98, bp: 120, temp: 36.8 },
    { time: '09:10', hr: 81, spo2: 97, bp: 124, temp: 36.8 },
    { time: '09:20', hr: 77, spo2: 99, bp: 119, temp: 36.7 },
]

const reports = []

/* ── HELPERS ──────────────────────────────────────────── */
const statusStyle = {
    'in_progress': 'bg-teal-900/50 text-teal-300 border border-teal-800/40',
    'In Progress': 'bg-teal-900/50 text-teal-300 border border-teal-800/40',
    'pre_op': 'bg-amber-900/50 text-amber-300 border border-amber-800/40',
    'Pre-Op': 'bg-amber-900/50 text-amber-300 border border-amber-800/40',
    'recovery': 'bg-gray-700/50 text-gray-300 border border-gray-600/40',
    'Recovery': 'bg-gray-700/50 text-gray-300 border border-gray-600/40',
}

const severityStyle = {
    High: { dot: 'bg-red-500', badge: 'bg-red-900/40 text-red-400 border border-red-800/40' },
    Medium: { dot: 'bg-amber-500', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40' },
    Low: { dot: 'bg-yellow-500', badge: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/40' },
    // API lowercase variants
    high: { dot: 'bg-red-500', badge: 'bg-red-900/40 text-red-400 border border-red-800/40' },
    medium: { dot: 'bg-amber-500', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40' },
    low: { dot: 'bg-yellow-500', badge: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/40' },
    critical: { dot: 'bg-red-500', badge: 'bg-red-900/40 text-red-400 border border-red-800/40' },
    warning: { dot: 'bg-amber-500', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40' },
}

const avatarGradients = [
    'from-teal-500 to-teal-700',
    'from-blue-500 to-blue-700',
    'from-violet-500 to-violet-700',
    'from-rose-500 to-rose-700',
]

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

/* ── CUSTOM TOOLTIP ───────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs shadow-xl">
            <p className="text-gray-400 mb-2 font-medium">{label}</p>
            {payload.map(p => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-gray-300">{p.name}:</span>
                    <span className="text-white font-semibold">{p.value}</span>
                </div>
            ))}
        </div>
    )
}

/* ── STATS ROW — powered by context ───────────────────── */
function StatsRow() {
    const { patients, alerts, unreadAlertCount } = useAetheris()

    const activePatientsCount = patients.length
    const surgeriesCount = patients.length
    const reportsCount = 24   // static placeholder (no reports endpoint yet)

    const stats = [
        {
            label: 'Active Patients', target: activePatientsCount,
            badge: 'In Surgery', badgeStyle: 'bg-green-900/40 text-green-400 border border-green-800/40',
            icon: Users, iconBg: 'bg-teal-600/20', iconColor: 'text-teal-400',
        },
        {
            label: 'Risk Alerts', target: unreadAlertCount,
            badge: unreadAlertCount > 0 ? 'Requires Attention' : 'All Clear',
            badgeStyle: unreadAlertCount > 0
                ? 'bg-red-900/40 text-red-400 border border-red-800/40'
                : 'bg-green-900/40 text-green-400 border border-green-800/40',
            icon: AlertTriangle, iconBg: 'bg-red-600/20', iconColor: 'text-red-400',
        },
        {
            label: 'Surgeries Today', target: surgeriesCount,
            badge: null, trend: 'All loaded',
            icon: Scissors, iconBg: 'bg-green-600/20', iconColor: 'text-green-400',
        },
        {
            label: 'Reports Generated', target: reportsCount,
            badge: 'Auto-Generated', badgeStyle: 'bg-teal-900/40 text-teal-400 border border-teal-800/40',
            icon: FileText, iconBg: 'bg-teal-600/20', iconColor: 'text-teal-400',
        },
    ]

    return (
        <div className="grid grid-cols-4 gap-4">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
    )
}

function StatCard({ label, target, badge, badgeStyle, trend, icon: Icon, iconBg, iconColor }) {
    const count = useCountUp(target)
    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-gray-700
          transition-colors duration-200 group cursor-default">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-3xl font-bold text-white tabular-nums">{count}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center
                  flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
            {badge && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeStyle}`}>
                    {badge}
                </span>
            )}
            {trend && (
                <div className="flex items-center gap-1.5 text-green-400">
                    <ChevronUp size={14} />
                    <span className="text-xs font-medium">{trend}</span>
                </div>
            )}
        </div>
    )
}

/* ── SHARED AUDIO CONTEXT (auto-resumes on first user gesture) ─── */
let _audioCtx = null
function getAudioCtx() {
    if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        // Auto-resume on any user gesture if suspended
        const resume = () => {
            if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume()
        }
        document.addEventListener('click', resume, { once: false })
        document.addEventListener('keydown', resume, { once: false })
        document.addEventListener('touchstart', resume, { once: false })
    }
    if (_audioCtx.state === 'suspended') _audioCtx.resume()
    return _audioCtx
}

function playSpo2Alarm() {
    try {
        const ctx = getAudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(1000, ctx.currentTime)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
    } catch (e) { console.warn("Audio error", e) }
}

function playHRAlarm() {
    try {
        const ctx = getAudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.4, ctx.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
    } catch (e) { console.warn("Audio error", e) }
}

function LiveVitals() {
    const { currentPatient, addAlert } = useAetheris()
    const patientLabel = currentPatient ? `${currentPatient.name} · OR` : 'Select a patient'

    // Create random seed for initial static vitals based on patient ID, then simulate
    const vitals = useVitals(currentPatient?.id || 'demo')

    // Cooldown ref to avoid flooding alerts (minimum 10s between alerts)
    const lastAlertTime = React.useRef(0);

    const maybeAlert = React.useCallback((alertData) => {
        const now = Date.now();
        if (now - lastAlertTime.current < 10000) return; // 10s cooldown
        lastAlertTime.current = now;
        if (addAlert) {
            addAlert({
                id: now.toString() + Math.random().toString(36).slice(2),
                timestamp: new Date().toISOString(),
                ...alertData,
            });
        }
        // Auto-trigger nursing staff alert sound for warning/critical
        if (alertData.type === 'critical' || alertData.type === 'warning') {
            try {
                const ctx = getAudioCtx()
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.type = 'square'
                // Urgent triple-beep nurse alert
                osc.frequency.setValueAtTime(alertData.type === 'critical' ? 1200 : 800, ctx.currentTime)
                gain.gain.setValueAtTime(0.5, ctx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
                // Beep 2
                gain.gain.setValueAtTime(0.5, ctx.currentTime + 0.2)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.32)
                // Beep 3
                gain.gain.setValueAtTime(0.5, ctx.currentTime + 0.4)
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.52)
                osc.start()
                osc.stop(ctx.currentTime + 0.6)
            } catch (e) { console.warn("Nurse alert audio error", e) }
        }
    }, [addAlert]);

    // SpO2 alarm effect — visual + audio
    const prevSpo2 = React.useRef(vitals.spo2);
    React.useEffect(() => {
        if (vitals.spo2 < 94) {
            playSpo2Alarm();
            maybeAlert({
                type: 'critical',
                title: 'CRITICAL: SpO\u2082 Desaturation',
                message: `SpO\u2082 dropped to ${vitals.spo2}% — immediate attention required!`,
            });
        } else if (vitals.spo2 < 96 && vitals.spo2 < prevSpo2.current) {
            playSpo2Alarm();
            maybeAlert({
                type: 'warning',
                title: 'WARNING: SpO\u2082 Declining',
                message: `SpO\u2082 trending down at ${vitals.spo2}%. Monitor closely.`,
            });
        }
        prevSpo2.current = vitals.spo2;
    }, [vitals.spo2, maybeAlert]);

    // HR alarm effect — bradycardia, tachycardia, sudden change
    const prevHr = React.useRef(vitals.hr);
    React.useEffect(() => {
        if (vitals.hr < 60) {
            playHRAlarm();
            maybeAlert({
                type: 'critical',
                title: 'CRITICAL: Bradycardia Detected',
                message: `Heart rate dropped to ${vitals.hr} bpm — below safe threshold!`,
            });
        } else if (vitals.hr > 105) {
            playHRAlarm();
            maybeAlert({
                type: 'warning',
                title: 'WARNING: Tachycardia Detected',
                message: `Heart rate elevated to ${vitals.hr} bpm.`,
            });
        } else if (Math.abs(prevHr.current - vitals.hr) > 4) {
            maybeAlert({
                type: 'warning',
                title: 'WARNING: Sudden HR Change',
                message: `Heart rate changed rapidly from ${Math.round(prevHr.current)} to ${vitals.hr} bpm.`,
            });
        }
        prevHr.current = vitals.hr;
    }, [vitals.hr, maybeAlert]);

    const chips = [
        { label: 'HR', value: `${vitals.hr} bpm`, icon: Heart, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800/30' },
        { label: 'SpO₂', value: `${vitals.spo2}%`, icon: Wind, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800/30' },
        { label: 'BP', value: vitals.bp, icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-800/30' },
        { label: 'Temp', value: `${vitals.temp}°C`, icon: Thermometer, color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-800/30' },
    ]

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                    </span>
                    <h2 className="text-white font-semibold text-base">Live Patient Vitals</h2>
                </div>
                <span className="text-xs text-gray-500 font-medium">Patient: {patientLabel}</span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={vitals.history.length ? vitals.history : vitalsData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af', paddingTop: '12px' }} iconType="circle" iconSize={8} />
                    <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="spo2" name="SpO₂" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="bp" name="Blood Pressure" stroke="#eab308" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                    <Line type="monotone" dataKey="temp" name="Temperature" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-4 gap-3 mt-5">
                {chips.map(({ label, value, icon: Icon, color, bg, border }) => (
                    <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${bg} border ${border}`}>
                        <Icon size={16} className={color} />
                        <div>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                            <p className={`text-sm font-bold ${color}`}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── ACTIVE SURGERIES — from context patients[] ───────── */
function ActiveSurgeries() {
    const { patients } = useAetheris()
    const navigate = useNavigate()
    // Show all patients as active surgeries (demo)
    const list = patients.length > 0 ? patients : []

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-base">Active Surgeries</h2>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-medium">{list.length} {list.length === 1 ? 'patient' : 'patients'}</span>
                    <button
                        onClick={() => navigate('/preop')}
                        className="text-[11px] font-semibold bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 border border-teal-700/50 px-3 py-1.5 rounded-lg transition-colors">
                        + Schedule
                    </button>
                </div>
            </div>
            {list.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-8 text-gray-500 text-sm">
                    No patients loaded yet
                </div>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {list.map(({ id, name, surgery_type, status, asa_class }, idx) => {
                        const displayStatus = status === 'in_progress' ? 'In Progress'
                            : status === 'pre_op' ? 'Pre-Op'
                                : status === 'recovery' ? 'Recovery'
                                    : status || 'Active'
                        return (
                            <div
                                key={id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/40 hover:border-gray-600/60 transition-all"
                            >
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                    {getInitials(name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{name}</p>
                                    <p className="text-xs text-gray-400 truncate">{surgery_type || 'Procedure TBD'}</p>
                                </div>
                                <div className="text-right flex-shrink-0 space-y-1">
                                    {asa_class && (
                                        <p className="text-[9px] text-gray-500">ASA {asa_class}</p>
                                    )}
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle[displayStatus] || statusStyle['Active'] || 'bg-gray-700 text-gray-300'}`}>
                                        {displayStatus}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/* ── RISK ALERTS — from context alerts[] ──────────────── */
function RiskAlerts() {
    const { alerts, acknowledgeAlert } = useAetheris()
    const visible = alerts.filter(a => !a.acknowledged).slice(0, 5)

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-base">Risk Alerts</h2>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-900/40 text-red-400 border border-red-800/30">
                    {visible.length} active
                </span>
            </div>
            <div className="space-y-3">
                {visible.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">All clear — no active alerts</div>
                )}
                {visible.map((alert) => {
                    const sev = severityStyle[alert.type] || severityStyle[alert.severity] || severityStyle.Low
                    const label = alert.type === 'critical' ? 'High'
                        : alert.type === 'warning' ? 'Medium' : 'Low'
                    return (
                        <div
                            key={alert.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/40 hover:border-gray-600/60 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-900/30 border border-red-800/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <AlertTriangle size={14} className="text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                    <p className="text-sm font-semibold text-white">{alert.title}</p>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${sev.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                                        {label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 truncate">{alert.message}</p>
                            </div>
                            <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-gray-700/60 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                                title="Acknowledge"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* ── RECENT REPORTS (static) ──────────────────────────── */
function RecentReports() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-base">Recent Reports</h2>
                <button className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium">View All →</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {reports.map(({ id, icon: Icon, color, bg, border, type, patient, time }) => (
                    <div
                        key={id}
                        className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-all group flex flex-col gap-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                                <Icon size={18} className={color} />
                            </div>
                            <TrendingUp size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white mb-1">{type}</p>
                            <p className="text-xs text-gray-400">{patient}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{time}</p>
                        </div>
                        <button className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-teal-400 transition-colors mt-auto">
                            <Download size={13} />
                            Download PDF
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── PAGE ROOT ────────────────────────────────────────── */
export default function DashboardPage() {
    const { isConnected, loading, currentPatient, selectPatient } = useAetheris()
    const [initialWait, setInitialWait] = useState(true)

    // Brief skeleton while patients load for the first time
    useEffect(() => {
        const t = setTimeout(() => setInitialWait(false), 1000)
        return () => clearTimeout(t)
    }, [])

    if (initialWait && loading?.patients) return <SkeletonDashboard />

    return (
        <div className="animate-fadeIn space-y-5">
            {/* Connection status banner */}
            <ConnectionBanner isConnected={isConnected} />

            {/* Demo banner — auto-hides once a patient is selected */}
            <DemoBanner onLoad={selectPatient} currentPatient={currentPatient} />

            <StatsRow />
            <LiveVitals />
            <div className="grid grid-cols-2 gap-4">
                <ActiveSurgeries />
                <RiskAlerts />
            </div>
            <RecentReports />
        </div>
    )
}
