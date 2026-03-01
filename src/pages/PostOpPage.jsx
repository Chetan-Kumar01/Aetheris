import { useState, useEffect, useCallback } from 'react'
import {
    Heart, Wind, Activity, Thermometer, Zap,
    FileText, Download, Send, Copy,
    AlertTriangle, CheckCircle, ShieldAlert,
    Sparkles, BrainCircuit,
    Bell, Clock, User, Loader2,
} from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import RiskDonut from '../components/charts/RiskDonut'
import ApiErrorBanner from '../components/ui/ApiErrorBanner'
import { getComplicationRisk, generateReport, sendToEHR } from '../api/client'
import { useAetheris } from '../context/AetherisContext'

/* ─────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────────────── */
function useElapsed(startHHMM) {
    const [elapsed, setElapsed] = useState('')
    useEffect(() => {
        const calc = () => {
            const [h, m] = startHHMM.split(':').map(Number)
            const now = new Date()
            const start = new Date(now)
            start.setHours(h, m, 0, 0)
            let diff = Math.floor((now - start) / 1000)
            if (diff < 0) diff += 86400
            const hh = Math.floor(diff / 3600)
            const mm = Math.floor((diff % 3600) / 60)
            const ss = diff % 60
            setElapsed(
                `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
            )
        }
        calc()
        const id = setInterval(calc, 1000)
        return () => clearInterval(id)
    }, [startHHMM])
    return elapsed
}

const DOT = { normal: 'bg-green-500', borderline: 'bg-amber-500', critical: 'bg-red-500' }
const DOT_GLOW = { normal: 'shadow-green-500/60', borderline: 'shadow-amber-500/60', critical: 'shadow-red-500/60' }

const PAIN_COLOR = p => p <= 3 ? 'text-green-400' : p <= 6 ? 'text-amber-400' : 'text-red-400'
const PAIN_BG = p => p <= 3 ? 'bg-green-500' : p <= 6 ? 'bg-amber-500' : 'bg-red-500'
const PAIN_LABEL = p => p <= 3 ? 'Mild' : p <= 6 ? 'Moderate' : 'Severe'

const RISK_STYLE = {
    low: { bar: 'bg-green-500', badge: 'bg-green-900/40 text-green-400 border border-green-800/40', label: 'Low' },
    medium: { bar: 'bg-amber-500', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40', label: 'Medium' },
    high: { bar: 'bg-red-500', badge: 'bg-red-900/40 text-red-400 border border-red-800/40', label: 'High' },
    // uppercase variants from API
    LOW: { bar: 'bg-green-500', badge: 'bg-green-900/40 text-green-400 border border-green-800/40', label: 'Low' },
    MEDIUM: { bar: 'bg-amber-500', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40', label: 'Medium' },
    HIGH: { bar: 'bg-red-500', badge: 'bg-red-900/40 text-red-400 border border-red-800/40', label: 'High' },
}

/* ─────────────────────────────────────────────────────────
   RECOVERY MONITOR
───────────────────────────────────────────────────────── */
const STATIC_VITALS = [
    { label: 'Heart Rate', value: '74 bpm', status: 'normal' },
    { label: 'SpO₂', value: '98%', status: 'normal' },
    { label: 'Blood Pressure', value: '138/86', status: 'borderline' },
    { label: 'Temperature', value: '37.1°C', status: 'normal' },
    { label: 'Resp. Rate', value: '16 /min', status: 'normal' },
    { label: 'EtCO₂', value: '38 mmHg', status: 'normal' },
]

function RecoveryMonitor({ currentPatient, preOpForm }) {
    const [pain, setPain] = useState(3)
    const [alerted, setAlerted] = useState(false)

    const name = preOpForm?.name || currentPatient?.name || 'Unknown Patient'
    const age = preOpForm?.age || currentPatient?.age || '—'
    const room = currentPatient?.room || 'PACU'
    const blood = currentPatient?.blood_type || '—'
    const surgery = preOpForm?.surgery_type || currentPatient?.surgery_type || 'N/A'
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const elapsed = useElapsed('08:05')

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Heart size={16} className="text-teal-400" />
                <h3 className="text-white font-semibold text-sm">Recovery Monitor</h3>
            </div>

            {/* Patient card */}
            <div className="bg-gray-800/70 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700
            flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm">{name}</p>
                        <p className="text-xs text-gray-400">{age} · {blood} · {room}</p>
                    </div>
                </div>
                <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Procedure</span>
                        <span className="text-gray-200 font-medium text-right max-w-[60%] leading-tight">{surgery}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Completed</span>
                        <span className="text-gray-200 font-medium">08:05</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Elapsed</span>
                        <span className="text-teal-400 font-mono font-semibold">{elapsed}</span>
                    </div>
                </div>
            </div>

            {/* Recovery vitals */}
            <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-2">Recovery Vitals</p>
                <div className="space-y-2">
                    {STATIC_VITALS.map(({ label, value, status }) => (
                        <div key={label}
                            className="flex items-center justify-between py-2 border-b border-gray-800/60 last:border-0">
                            <span className="text-xs text-gray-400">{label}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white">{value}</span>
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[status]} shadow-sm ${DOT_GLOW[status]}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pain scale */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400 font-medium">Pain Scale</p>
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${PAIN_COLOR(pain)}`}>{pain}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
              ${pain <= 3 ? 'bg-green-900/40 text-green-400 border border-green-800/40'
                                : pain <= 6 ? 'bg-amber-900/40 text-amber-400 border border-amber-800/40'
                                    : 'bg-red-900/40 text-red-400 border border-red-800/40'}`}>
                            {PAIN_LABEL(pain)}
                        </span>
                    </div>
                </div>
                <div className="relative mb-1">
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${PAIN_BG(pain)}`}
                            style={{ width: `${pain * 10}%` }} />
                    </div>
                    <input
                        type="range" min={0} max={10} step={1}
                        value={pain} onChange={e => setPain(Number(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                    />
                </div>
                <div className="flex justify-between text-[10px] text-gray-600 font-medium">
                    <span>None (0)</span><span>Severe (10)</span>
                </div>
            </div>

            {/* Alert button */}
            <button
                onClick={() => {
                    setAlerted(true)
                    try {
                        const ctx = new (window.AudioContext || window.webkitAudioContext)()
                        const osc = ctx.createOscillator()
                        const gain = ctx.createGain()
                        osc.connect(gain)
                        gain.connect(ctx.destination)
                        osc.type = 'square' // Harsher, more alarming tone
                        osc.frequency.setValueAtTime(1000, ctx.currentTime) // Higher pitch

                        // Start loud
                        gain.gain.setValueAtTime(1.0, ctx.currentTime)

                        // Fade out slowly over 1.5 seconds
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5)

                        osc.start()
                        osc.stop(ctx.currentTime + 1.5)
                    } catch (e) { console.warn("Audio error", e) }
                    setTimeout(() => setAlerted(false), 3000)
                }}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2
          transition-all ${alerted
                        ? 'bg-red-700 text-red-100'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 active:scale-[0.98]'}`}
            >
                <Bell size={15} />
                {alerted ? 'Nursing Staff Alerted ✓' : 'Alert Nursing Staff'}
            </button>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────
   REPORTS PANEL
───────────────────────────────────────────────────────── */
function ReportsPanel({
    currentPatient, currentSurgery,
    activeReport, reportContent, reportLoading, reportStatus, sendingToEHR,
    onGenerateReport, onSendToEHR, onCopy,
}) {
    const [tab, setTab] = useState('operative_note')

    const tabConfig = [
        { key: 'operative_note', label: 'Operative Note' },
        { key: 'discharge_summary', label: 'Discharge Summary' },
    ]

    const handleTabClick = (key) => {
        setTab(key)
        onGenerateReport(key)
    }

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <FileText size={16} className="text-teal-400" />
                <h3 className="text-white font-semibold text-sm">Auto-Generated Reports</h3>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full
          bg-teal-900/40 text-teal-400 border border-teal-800/30">AI</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                {tabConfig.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => handleTabClick(key)}
                        className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px
              ${tab === key
                                ? 'border-teal-500 text-teal-400'
                                : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-gray-800 rounded-xl p-4 text-xs text-gray-300 font-mono leading-relaxed
        min-h-64 overflow-auto flex-1 whitespace-pre-wrap border border-gray-700/50 relative">
                {reportLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <Loader2 size={24} className="text-teal-400 animate-spin" />
                        <p className="text-gray-500 text-xs">Generating report…</p>
                    </div>
                ) : reportContent ? (
                    reportContent
                ) : (
                    <span className="text-gray-600">
                        Select a report tab to generate content from the backend.
                    </span>
                )}
            </div>

            {/* EHR status */}
            {reportStatus === 'sent_to_ehr' && (
                <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                    <CheckCircle size={13} />
                    Report successfully sent to EHR
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={onCopy}
                    disabled={!reportContent}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white
            rounded-lg px-4 py-2 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Copy size={13} />
                    Copy
                </button>
                <button
                    onClick={onSendToEHR}
                    disabled={!activeReport || sendingToEHR || reportStatus === 'sent_to_ehr'}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
            rounded-lg px-4 py-2 text-xs font-medium transition-all shadow-sm shadow-blue-900/30
            disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {sendingToEHR
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Send size={13} />}
                    {sendingToEHR ? 'Sending…' : reportStatus === 'sent_to_ehr' ? 'Sent ✓' : 'Send to EHR'}
                </button>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────
   RISK PREDICTOR
───────────────────────────────────────────────────────── */
function RiskPredictor({ complicationData, riskLoading, onRefresh }) {
    const complications = complicationData?.complications || []
    const overallScore = complicationData?.overall_score ?? null

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <BrainCircuit size={16} className="text-purple-400" />
                    <h3 className="text-white font-semibold text-sm">Complication Risk Predictor</h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
          bg-purple-600/20 text-purple-400 border border-purple-700/40 whitespace-nowrap">
                    Powered by ML
                </span>
            </div>

            {riskLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 size={24} className="text-purple-400 animate-spin" />
                    <p className="text-gray-500 text-xs">Fetching risk data…</p>
                </div>
            ) : complications.length > 0 ? (
                <>
                    {/* Risk items */}
                    <div className="space-y-4">
                        {complications.map((comp) => {
                            const style = RISK_STYLE[comp.risk_level] || RISK_STYLE.low
                            const pct = Math.min(100, Math.max(0, Math.round(comp.risk_pct ?? 0)))
                            return (
                                <div key={comp.name}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-gray-400 font-medium">{comp.name} Risk</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white">{pct}%</span>
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${style.badge}`}>
                                                {style.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${style.bar} rounded-full transition-all duration-700`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="border-t border-gray-800" />

                    {/* Overall donut */}
                    {overallScore !== null && (
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-3 text-center">Overall Risk Score</p>
                            <RiskDonut score={overallScore} />
                            <div className="flex justify-center gap-4 mt-1">
                                {[
                                    { color: 'bg-amber-500', label: 'Risk' },
                                    { color: 'bg-gray-700', label: 'Clear' },
                                ].map(({ color, label }) => (
                                    <div key={label} className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-sm ${color}`} />
                                        <span className="text-[10px] text-gray-500">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BrainCircuit size={28} className="text-gray-600 mb-3" />
                    <p className="text-gray-500 text-sm">No risk data available</p>
                    <p className="text-gray-600 text-xs mt-1">Select a patient to load complication risk</p>
                </div>
            )}

            {/* Refresh button */}
            <button
                onClick={onRefresh}
                disabled={riskLoading}
                className={`w-full rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2
          transition-all ${riskLoading
                        ? 'bg-purple-800 text-purple-200 cursor-not-allowed'
                        : complications.length > 0
                            ? 'bg-green-700 hover:bg-green-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 active:scale-[0.98]'}`}
            >
                {riskLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> Fetching…</>
                ) : complications.length > 0 ? (
                    <><CheckCircle size={15} /> Risk Data Loaded</>
                ) : (
                    <><Sparkles size={15} /> Load Risk Prediction</>
                )}
            </button>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════
   PAGE ROOT — holds all API state
═══════════════════════════════════════════════════════ */
export default function PostOpPage() {
    const { currentPatient, currentSurgery, setLoading, preOpForm, dischargeCurrentPatient } = useAetheris()

    // ── Complication Risk state ──────────────────────────
    const [complicationData, setComplicationData] = useState(null)
    const [riskLoading, setRiskLoading] = useState(false)
    const [apiError, setApiError] = useState(null) // Added apiError state

    // ── Report state ─────────────────────────────────────
    const [activeReport, setActiveReport] = useState(null)
    const [reportContent, setReportContent] = useState('')
    const [reportLoading, setReportLoading] = useState(false)
    const [reportStatus, setReportStatus] = useState(null)   // null | 'sent_to_ehr'
    const [sendingToEHR, setSendingToEHR] = useState(false)

    // ── Toast helper (simple inline since no toast import in original) ──
    const toast = {
        success: (msg) => console.info('[toast:success]', msg),
        error: (msg) => console.error('[toast:error]', msg),
    }

    // ── Fetch complication risk ───────────────────────────
    const fetchComplicationRisk = useCallback(async () => {
        setRiskLoading(true)
        setLoading('postop', true)
        try {
            const result = await getComplicationRisk({
                patient_id: currentPatient?.id || 'p001',
                surgery_type: preOpForm?.surgery_type || 'General',
                age: preOpForm?.age ? Number(preOpForm.age) : 50,
                asa_class: preOpForm?.asa_class || 'II',
                diabetes: preOpForm?.diabetes || false,
                hypertension: preOpForm?.hypertension || false,
                cardiac_hx: preOpForm?.cardiac_hx || false,
                smoker: preOpForm?.smoking || false,
                duration_min: currentSurgery?.duration_minutes || 180,
                blood_loss_ml: currentSurgery?.estimated_blood_loss_ml || 300,
            })
            setComplicationData(result)
            setApiError(null) // Clear error on success
        } catch (err) {
            setApiError(err?.message || 'Could not load complication risk data') // Set error on failure
        } finally {
            setRiskLoading(false)
            setLoading('postop', false)
        }
    }, [currentPatient, currentSurgery, setLoading])

    // Auto-fetch when patient changes
    useEffect(() => {
        if (!currentPatient) return
        fetchComplicationRisk()
    }, [currentPatient?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Generate report ───────────────────────────────────
    const handleGenerateReport = useCallback(async (reportType) => {
        setReportLoading(true)
        setReportStatus(null)
        try {
            const result = await generateReport({
                patient_id: currentPatient?.id || 'p001',
                surgery_id: currentSurgery?.id || null,
                report_type: reportType,
                patient_name: preOpForm?.name || currentPatient?.name || undefined,
                patient_age: preOpForm?.age?.toString() || currentPatient?.age?.toString() || undefined,
                surgery_name: preOpForm?.surgery_type || currentPatient?.surgery_type || undefined,
            })
            setActiveReport(result)
            setReportContent(result.content ?? JSON.stringify(result, null, 2))
            toast.success('Report generated successfully!')
        } catch {
            toast.error('Report generation failed. Is backend running?')
        } finally {
            setReportLoading(false)
        }
    }, [currentPatient, currentSurgery])

    // ── Send to EHR ───────────────────────────────────────
    const handleSendToEHR = useCallback(async () => {
        if (!activeReport) return
        setSendingToEHR(true)
        try {
            const result = await sendToEHR({
                report_id: activeReport.id,
                ehr_system: 'mock_ehr',
            })
            toast.success(`Report sent! Confirmation: ${result.confirmation}`)
            setReportStatus('sent_to_ehr')
        } catch {
            toast.error('Failed to send to EHR')
        } finally {
            setSendingToEHR(false)
        }
    }, [activeReport])

    // ── Copy to clipboard ─────────────────────────────────
    const handleCopy = useCallback(async () => {
        if (!reportContent) return
        await navigator.clipboard.writeText(reportContent)
        toast.success('Report copied to clipboard!')
    }, [reportContent])

    return (
        <div className="animate-fadeIn space-y-5">
            <SectionHeader
                title="Post-Op & Recovery"
                subtitle="Automated recovery monitoring, reports, and risk prediction"
                icon={Activity}
                actionLabel="Discharge Patient"
                onAction={async () => {
                    const success = await dischargeCurrentPatient()
                    if (success) toast.success('Patient discharged successfully.')
                    else toast.error('Failed to discharge patient.')
                }}
            />

            {/* API error banner */}
            {apiError && (
                <ApiErrorBanner
                    error={apiError}
                    onRetry={() => { setApiError(null); fetchComplicationRisk() }}
                    onDismiss={() => setApiError(null)}
                />
            )}

            <div className="grid grid-cols-3 gap-5">
                <RecoveryMonitor currentPatient={currentPatient} preOpForm={preOpForm} />

                <ReportsPanel
                    currentPatient={currentPatient}
                    currentSurgery={currentSurgery}
                    activeReport={activeReport}
                    reportContent={reportContent}
                    reportLoading={reportLoading}
                    reportStatus={reportStatus}
                    sendingToEHR={sendingToEHR}
                    onGenerateReport={handleGenerateReport}
                    onSendToEHR={handleSendToEHR}
                    onCopy={handleCopy}
                />

                <RiskPredictor
                    complicationData={complicationData}
                    riskLoading={riskLoading}
                    onRefresh={fetchComplicationRisk}
                />
            </div>
        </div>
    )
}
