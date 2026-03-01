import { useState, useCallback, useRef } from 'react'
import {
    Brain, Sparkles, CheckCircle, AlertTriangle, Circle,
    ShieldCheck, Pill, ClipboardCheck, Loader2,
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import SectionHeader from '../components/SectionHeader'
import ApiErrorBanner from '../components/ui/ApiErrorBanner'
import useApiCall from '../hooks/useApiCall'
import { runPreOpAssessment } from '../api/client'
import { useAetheris } from '../context/AetherisContext'

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */

/** Normalise the risk_level string from the API to a display config */
function riskLevelStyle(level = '') {
    const l = level.toUpperCase()
    if (l === 'CRITICAL') return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500', ring: '#ef4444', badge: 'bg-red-900/40 text-red-400 border border-red-800/40' }
    if (l === 'HIGH') return { label: 'High', color: 'text-red-400', bg: 'bg-red-500', ring: '#ef4444', badge: 'bg-red-900/40 text-red-400 border border-red-800/40' }
    if (l === 'MEDIUM') return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500', ring: '#f59e0b', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40' }
    return { label: 'Low', color: 'text-green-400', bg: 'bg-green-500', ring: '#22c55e', badge: 'bg-green-900/40 text-green-400 border border-green-800/40' }
}

const SEV_STYLE = {
    HIGH: { badge: 'bg-red-900/40 text-red-400 border border-red-800/40', dot: 'bg-red-500', label: 'High' },
    MEDIUM: { badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40', dot: 'bg-amber-500', label: 'Medium' },
    LOW: { badge: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/40', dot: 'bg-yellow-400', label: 'Low' },
    // lower-case fallbacks
    high: { badge: 'bg-red-900/40 text-red-400 border border-red-800/40', dot: 'bg-red-500', label: 'High' },
    medium: { badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40', dot: 'bg-amber-500', label: 'Medium' },
    low: { badge: 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/40', dot: 'bg-yellow-400', label: 'Low' },
}

/* ═══════════════════════════════════════════════════
   SVG CIRCULAR PROGRESS RING
═══════════════════════════════════════════════════ */
function RiskRing({ score, color }) {
    const R = 52
    const C = 2 * Math.PI * R
    const offset = C - (Math.min(100, Math.max(0, score)) / 100) * C

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
                <circle cx="65" cy="65" r={R} fill="none" stroke="#1f2937" strokeWidth="10" />
                <circle
                    cx="65" cy="65" r={R}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-white">{Math.round(score)}</span>
                <span className="text-xs text-gray-500 -mt-0.5">/ 100</span>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════════════════════ */
function ProgressBar({ color = 'bg-teal-500', label, pct }) {
    const safePct = Math.min(100, Math.max(0, Math.round(pct || 0)))
    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-300 font-semibold">{safePct}%</span>
            </div>
            <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${safePct}%` }}
                />
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   CARD 1 — AI RISK SCORE
═══════════════════════════════════════════════════ */
function RiskScoreCard({ result }) {
    if (!result) {
        return (
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                    <Brain size={16} className="text-teal-400" />
                    <h3 className="text-white font-semibold text-sm">AI Risk Score</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-3">
                        <Brain size={22} className="text-gray-600" />
                    </div>
                    <p className="text-gray-500 text-sm">Run the AI Assessment to see risk analysis</p>
                </div>
            </div>
        )
    }

    const score = result.overall_risk_score ?? 0
    const level = riskLevelStyle(result.risk_level)
    const breakdown = result.risk_breakdown || {}
    const cardiac = breakdown.cardiac_risk ?? 0
    const anesthesia = breakdown.anesthesia_risk ?? 0
    const surgical = breakdown.surgical_risk ?? 0

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Brain size={16} className="text-teal-400" />
                    <h3 className="text-white font-semibold text-sm">AI Risk Score</h3>
                </div>
                <div className="flex items-center gap-2">
                    {result.asa_predicted && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-900/40 text-teal-400 border border-teal-800/30">
                            Predicted ASA {result.asa_predicted}
                        </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${level.badge}`}>
                        {level.label} Risk
                    </span>
                </div>
            </div>

            {/* Ring */}
            <div className="flex justify-center mb-6">
                <RiskRing score={score} color={level.ring} />
            </div>

            {/* AI Summary */}
            {result.ai_summary && (
                <div className="mb-4 p-3 rounded-xl bg-teal-900/20 border border-teal-800/30">
                    <p className="text-xs text-teal-300 leading-relaxed">{result.ai_summary}</p>
                </div>
            )}

            {/* Breakdown progress bars */}
            <div className="border-t border-gray-800 pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-3">Risk Breakdown</p>
                <ProgressBar label="Cardiac Risk" pct={cardiac} color="bg-red-500" />
                <ProgressBar label="Anesthesia Risk" pct={anesthesia} color="bg-amber-500" />
                <ProgressBar label="Surgical Risk" pct={surgical} color="bg-blue-500" />
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   CARD 2 — DRUG INTERACTION CHECKER
═══════════════════════════════════════════════════ */
function DrugInteractionCard({ interactions, hasRun }) {
    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Pill size={16} className="text-teal-400" />
                    <h3 className="text-white font-semibold text-sm">Drug Interaction Checker</h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-900/40 text-teal-400 border border-teal-800/30">
                    OpenFDA API
                </span>
            </div>

            {!hasRun && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Pill size={22} className="text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm">Enter medications and run assessment</p>
                </div>
            )}

            {hasRun && interactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-green-900/30 border border-green-800/30 flex items-center justify-center mb-3">
                        <CheckCircle size={18} className="text-green-400" />
                    </div>
                    <p className="text-green-400 text-sm font-semibold">No interactions found</p>
                    <p className="text-gray-500 text-xs mt-1">Medication profile appears safe</p>
                </div>
            )}

            {hasRun && interactions.length > 0 && (
                <div className="space-y-2.5">
                    {interactions.map((item, i) => {
                        const sev = SEV_STYLE[item.severity] || SEV_STYLE.LOW
                        return (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30">
                                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                        <span className="text-xs font-semibold text-white">{item.drug_a}</span>
                                        <span className="text-gray-600 text-xs">+</span>
                                        <span className="text-xs font-semibold text-white">{item.drug_b}</span>
                                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sev.badge}`}>
                                            {sev.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">{item.description}</p>
                                    {item.source && (
                                        <p className="text-[10px] text-gray-600 mt-0.5">Source: {item.source}</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   CARD 3 — PRE-OP CHECKLIST
═══════════════════════════════════════════════════ */
function ChecklistCard({ checklistItems, hasRun }) {
    // Local toggle state seeded from API response
    const [localChecked, setLocalChecked] = useState({})

    const toggle = useCallback((id) => {
        setLocalChecked(prev => ({ ...prev, [id]: !prev[id] }))
    }, [])

    if (!hasRun || !checklistItems?.length) {
        return (
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-teal-400" />
                    <h3 className="text-white font-semibold text-sm">AI-Generated Checklist</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ClipboardCheck size={22} className="text-gray-600 mb-2" />
                    <p className="text-gray-500 text-sm">Checklist generates after AI assessment</p>
                </div>
            </div>
        )
    }

    // Merge API checked state with local overrides
    const isChecked = (item) =>
        localChecked[item.id] !== undefined ? localChecked[item.id] : item.checked

    const doneCount = checklistItems.filter(item => isChecked(item)).length
    const total = checklistItems.length
    const pct = Math.round((doneCount / total) * 100)

    // Group by category if present
    const categories = [...new Set(checklistItems.map(i => i.category).filter(Boolean))]
    const grouped = categories.length > 0
        ? categories.map(cat => ({ cat, items: checklistItems.filter(i => i.category === cat) }))
        : [{ cat: null, items: checklistItems }]

    return (
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-teal-400" />
                <h3 className="text-white font-semibold text-sm">AI-Generated Checklist</h3>
            </div>

            <div className="space-y-4 mb-5">
                {grouped.map(({ cat, items }) => (
                    <div key={cat || 'default'}>
                        {cat && (
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-2">{cat}</p>
                        )}
                        <div className="space-y-1">
                            {items.map((item) => {
                                const checked = isChecked(item)
                                return (
                                    <label
                                        key={item.id}
                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-800/50 cursor-pointer transition-colors group"
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                                                ${checked ? 'bg-teal-600 border-teal-600' : 'border-gray-600 group-hover:border-gray-500'}`}
                                            onClick={() => toggle(item.id)}
                                        >
                                            {checked && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 flex items-center justify-between gap-2">
                                            <span className={`text-sm transition-colors ${checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                {item.label}
                                            </span>
                                            {item.required && !checked && (
                                                <span className="text-[10px] text-red-400 font-semibold shrink-0">Required</span>
                                            )}
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 font-medium">{doneCount} of {total} complete</span>
                    <span className={`font-bold ${pct === 100 ? 'text-green-400' : 'text-teal-400'}`}>{pct}%</span>
                </div>
                <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-teal-500'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════
   FORM FIELD HELPERS
═══════════════════════════════════════════════════ */
const inputClass =
    'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-full text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ' +
    'placeholder-gray-600'

const labelClass = 'block text-gray-400 text-xs mb-1 font-medium'

function Field({ label, children }) {
    return (
        <div>
            <label className={labelClass}>{label}</label>
            {children}
        </div>
    )
}

function ToggleField({ label, checked, onChange }) {
    return (
        <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-xs text-gray-400 font-medium">{label}</span>
            <div
                className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-teal-600' : 'bg-gray-700'}`}
                onClick={onChange}
            >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
            </div>
        </label>
    )
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */

export default function PreOpPage() {
    const {
        currentPatient,
        setLoading,
        preOpForm,
        updatePreOpForm,
        preOpAssessment,
        setPreOpAssessment
    } = useAetheris()

    const [hasRun, setHasRun] = useState(!!preOpAssessment)
    const lastPayloadRef = useRef(null)

    const {
        data: apiAssessmentResult,
        loading: isRunning,
        error,
        execute: runAssess,
        clearError,
    } = useApiCall(runPreOpAssessment, {
        onSuccess: (result) => {
            setHasRun(true)
            setPreOpAssessment(result)
        },
    })

    // Use currently loaded data or fallback to previously persisted global assessment
    const activeAssessment = isRunning ? null : (apiAssessmentResult || preOpAssessment)

    const set = useCallback((key, val) =>
        updatePreOpForm({ [key]: val }), [updatePreOpForm])

    const buildPayload = useCallback(() => ({
        patient_id: currentPatient?.id || 'p001',
        surgery_type: preOpForm.surgery_type,
        asa_class: preOpForm.asa_class,
        medications: preOpForm.medications
            .split(/[,\n]/).map(m => m.trim()).filter(Boolean),
        allergies: preOpForm.allergies
            .split(/[,\n]/).map(a => a.trim()).filter(Boolean),
        diabetes: preOpForm.diabetes,
        hypertension: preOpForm.hypertension,
        cardiac_hx: preOpForm.cardiac_hx,
        smoking: preOpForm.smoking,
        weight_kg: preOpForm.weight_kg ? Number(preOpForm.weight_kg) : null,
        height_cm: preOpForm.height_cm ? Number(preOpForm.height_cm) : null,
        systolic_bp: preOpForm.systolic_bp ? Number(preOpForm.systolic_bp) : null,
        diastolic_bp: preOpForm.diastolic_bp ? Number(preOpForm.diastolic_bp) : null,
    }), [preOpForm, currentPatient])

    const handleAssess = useCallback(async () => {
        setLoading('preop', true)
        const payload = buildPayload()
        lastPayloadRef.current = payload
        await runAssess(payload)
        setLoading('preop', false)
    }, [buildPayload, runAssess, setLoading])

    const handleRetry = useCallback(async () => {
        if (!lastPayloadRef.current) return
        clearError()
        setLoading('preop', true)
        await runAssess(lastPayloadRef.current)
        setLoading('preop', false)
    }, [clearError, runAssess, setLoading])

    const drug_interactions = activeAssessment?.drug_interactions ?? []
    const checklist = activeAssessment?.checklist ?? []

    return (
        <div className="animate-fadeIn">
            <SectionHeader
                title="Pre-Op Management"
                subtitle="Patient intake, AI risk assessment and pre-operative checklist"
                icon={ClipboardCheck}
                actionLabel="Export Summary"
                onAction={() => {
                    // Build a formatted Pre-Op summary text
                    const lines = []
                    const hr = '═'.repeat(55)
                    const divider = '─'.repeat(55)

                    lines.push(hr)
                    lines.push('  AETHERIS — PRE-OP ASSESSMENT SUMMARY')
                    lines.push(`  Generated: ${new Date().toLocaleString()}`)
                    lines.push(hr)
                    lines.push('')

                    // Patient demographics
                    lines.push('▎ PATIENT INFORMATION')
                    lines.push(divider)
                    lines.push(`  Name:        ${preOpForm.name || 'N/A'}`)
                    lines.push(`  Age:         ${preOpForm.age || 'N/A'}`)
                    lines.push(`  Gender:      ${preOpForm.gender || 'N/A'}`)
                    if (preOpForm.weight_kg) lines.push(`  Weight:      ${preOpForm.weight_kg} kg`)
                    if (preOpForm.height_cm) lines.push(`  Height:      ${preOpForm.height_cm} cm`)
                    if (preOpForm.weight_kg && preOpForm.height_cm) {
                        const bmi = (Number(preOpForm.weight_kg) / ((Number(preOpForm.height_cm) / 100) ** 2)).toFixed(1)
                        lines.push(`  BMI:         ${bmi}`)
                    }
                    if (preOpForm.systolic_bp || preOpForm.diastolic_bp) {
                        lines.push(`  Blood Pressure: ${preOpForm.systolic_bp || '—'}/${preOpForm.diastolic_bp || '—'} mmHg`)
                    }
                    lines.push('')

                    // Surgery info
                    lines.push('▎ SURGICAL DETAILS')
                    lines.push(divider)
                    lines.push(`  Surgery Type:     ${preOpForm.surgery_type || 'N/A'}`)
                    lines.push(`  ASA Class:        ${preOpForm.asa_class || 'N/A'}`)
                    lines.push('')

                    // Medical history
                    lines.push('▎ MEDICAL HISTORY')
                    lines.push(divider)
                    lines.push(`  Diabetes:         ${preOpForm.diabetes ? 'Yes' : 'No'}`)
                    lines.push(`  Hypertension:     ${preOpForm.hypertension ? 'Yes' : 'No'}`)
                    lines.push(`  Cardiac History:  ${preOpForm.cardiac_hx ? 'Yes' : 'No'}`)
                    lines.push(`  Smoking:          ${preOpForm.smoking ? 'Yes' : 'No'}`)
                    lines.push('')

                    // Allergies & Medications
                    lines.push('▎ ALLERGIES')
                    lines.push(divider)
                    const allergyList = preOpForm.allergies?.split(/[,\n]/).map(a => a.trim()).filter(Boolean)
                    if (allergyList?.length) {
                        allergyList.forEach(a => lines.push(`  • ${a}`))
                    } else {
                        lines.push('  None reported')
                    }
                    lines.push('')

                    lines.push('▎ CURRENT MEDICATIONS')
                    lines.push(divider)
                    const medList = preOpForm.medications?.split(/[,\n]/).map(m => m.trim()).filter(Boolean)
                    if (medList?.length) {
                        medList.forEach(m => lines.push(`  • ${m}`))
                    } else {
                        lines.push('  None reported')
                    }
                    lines.push('')

                    // AI Assessment results (if available)
                    if (activeAssessment) {
                        lines.push('▎ AI RISK ASSESSMENT')
                        lines.push(divider)
                        lines.push(`  Overall Risk Score: ${Math.round(activeAssessment.overall_risk_score ?? 0)} / 100`)
                        lines.push(`  Risk Level:         ${activeAssessment.risk_level || 'N/A'}`)
                        if (activeAssessment.asa_predicted) {
                            lines.push(`  Predicted ASA:      ${activeAssessment.asa_predicted}`)
                        }
                        if (activeAssessment.risk_breakdown) {
                            const rb = activeAssessment.risk_breakdown
                            lines.push(`  Cardiac Risk:       ${Math.round(rb.cardiac_risk ?? 0)}%`)
                            lines.push(`  Anesthesia Risk:    ${Math.round(rb.anesthesia_risk ?? 0)}%`)
                            lines.push(`  Surgical Risk:      ${Math.round(rb.surgical_risk ?? 0)}%`)
                        }
                        if (activeAssessment.ai_summary) {
                            lines.push('')
                            lines.push(`  AI Summary: ${activeAssessment.ai_summary}`)
                        }
                        if (activeAssessment.recommendation) {
                            lines.push(`  Recommendation: ${activeAssessment.recommendation}`)
                        }
                        lines.push('')

                        // Drug interactions
                        const interactions = activeAssessment.drug_interactions || []
                        if (interactions.length > 0) {
                            lines.push('▎ DRUG INTERACTIONS')
                            lines.push(divider)
                            interactions.forEach(di => {
                                lines.push(`  ⚠ ${di.drug_a} + ${di.drug_b} [${di.severity}]`)
                                lines.push(`    ${di.description}`)
                            })
                            lines.push('')
                        }

                        // Checklist
                        const cl = activeAssessment.checklist || []
                        if (cl.length > 0) {
                            lines.push('▎ PRE-OP CHECKLIST')
                            lines.push(divider)
                            cl.forEach(item => {
                                const mark = item.checked ? '✓' : '☐'
                                const req = item.required ? ' (Required)' : ''
                                lines.push(`  ${mark} ${item.label}${req}`)
                            })
                            lines.push('')
                        }
                    } else {
                        lines.push('▎ AI RISK ASSESSMENT')
                        lines.push(divider)
                        lines.push('  Not yet performed — run the AI assessment first.')
                        lines.push('')
                    }

                    lines.push(hr)
                    lines.push('  End of Pre-Op Summary')
                    lines.push(hr)

                    // Trigger file download
                    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `preop_summary_${(preOpForm.name || 'patient').replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.txt`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                }}
            />

            <div className="grid grid-cols-3 gap-6">

                {/* ── LEFT PANEL: Patient Intake Form ─────── */}
                <div className="col-span-1">
                    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-7 h-7 rounded-lg bg-teal-600/20 flex items-center justify-center">
                                <ClipboardCheck size={14} className="text-teal-400" />
                            </div>
                            <h3 className="text-white font-semibold text-sm">Patient Intake Form</h3>
                        </div>

                        <div className="space-y-4">
                            {/* ── Display-only fields ── */}
                            <Field label="Patient Name">
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    value={preOpForm.name}
                                    onChange={e => set('name', e.target.value)}
                                    className={inputClass}
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Age">
                                    <input
                                        type="number"
                                        placeholder="Years"
                                        min={0} max={130}
                                        value={preOpForm.age}
                                        onChange={e => set('age', e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Gender">
                                    <select
                                        value={preOpForm.gender}
                                        onChange={e => set('gender', e.target.value)}
                                        className={inputClass + ' appearance-none cursor-pointer'}
                                    >
                                        <option value="" disabled>Select</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Non-binary</option>
                                        <option>Prefer not to say</option>
                                    </select>
                                </Field>
                            </div>

                            {/* ── API fields ── */}
                            <Field label="Surgery Type">
                                <select
                                    value={preOpForm.surgery_type}
                                    onChange={e => set('surgery_type', e.target.value)}
                                    className={inputClass + ' appearance-none cursor-pointer'}
                                >
                                    <option value="Cardiac">Cardiac</option>
                                    <option value="Orthopedic">Orthopedic</option>
                                    <option value="Neurological">Neurological</option>
                                    <option value="General">General</option>
                                    <option value="Vascular">Vascular</option>
                                    <option value="Thoracic">Thoracic</option>
                                    <option value="Abdominal">Abdominal</option>
                                    <option value="Ophthalmic">Ophthalmic</option>
                                </select>
                            </Field>

                            <Field label="ASA Classification">
                                <select
                                    value={preOpForm.asa_class}
                                    onChange={e => set('asa_class', e.target.value)}
                                    className={inputClass + ' appearance-none cursor-pointer'}
                                >
                                    <option value="I">Class I — Normal healthy</option>
                                    <option value="II">Class II — Mild systemic disease</option>
                                    <option value="III">Class III — Severe systemic disease</option>
                                    <option value="IV">Class IV — Life-threatening disease</option>
                                    <option value="V">Class V — Moribund</option>
                                </select>
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Weight (kg)">
                                    <input
                                        type="number" placeholder="e.g. 75"
                                        value={preOpForm.weight_kg}
                                        onChange={e => set('weight_kg', e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Height (cm)">
                                    <input
                                        type="number" placeholder="e.g. 170"
                                        value={preOpForm.height_cm}
                                        onChange={e => set('height_cm', e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Systolic BP">
                                    <input
                                        type="number" placeholder="mmHg"
                                        value={preOpForm.systolic_bp}
                                        onChange={e => set('systolic_bp', e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>
                                <Field label="Diastolic BP">
                                    <input
                                        type="number" placeholder="mmHg"
                                        value={preOpForm.diastolic_bp}
                                        onChange={e => set('diastolic_bp', e.target.value)}
                                        className={inputClass}
                                    />
                                </Field>
                            </div>

                            <Field label="Known Allergies">
                                <textarea
                                    placeholder="List allergies (comma or one per line)…"
                                    value={preOpForm.allergies}
                                    onChange={e => set('allergies', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' resize-none leading-relaxed'}
                                />
                            </Field>

                            <Field label="Current Medications">
                                <textarea
                                    placeholder="List medications (comma or one per line)…"
                                    value={preOpForm.medications}
                                    onChange={e => set('medications', e.target.value)}
                                    rows={2}
                                    className={inputClass + ' resize-none leading-relaxed'}
                                />
                            </Field>

                            {/* Medical history toggles */}
                            <div className="bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700/40 space-y-1.5">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mb-2">Medical History</p>
                                <ToggleField label="Diabetes" checked={preOpForm.diabetes} onChange={() => set('diabetes', !preOpForm.diabetes)} />
                                <ToggleField label="Hypertension" checked={preOpForm.hypertension} onChange={() => set('hypertension', !preOpForm.hypertension)} />
                                <ToggleField label="Cardiac Hx" checked={preOpForm.cardiac_hx} onChange={() => set('cardiac_hx', !preOpForm.cardiac_hx)} />
                                <ToggleField label="Smoking" checked={preOpForm.smoking} onChange={() => set('smoking', !preOpForm.smoking)} />
                            </div>
                        </div>

                        {/* Error banner */}
                        {error && (
                            <ApiErrorBanner
                                error={error}
                                onRetry={handleRetry}
                                onDismiss={clearError}
                            />
                        )}

                        {/* CTA */}
                        <button
                            onClick={handleAssess}
                            disabled={isRunning}
                            className={`w-full mt-5 rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all
                                ${isRunning
                                    ? 'bg-teal-700 text-teal-200 cursor-not-allowed'
                                    : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/30 active:scale-[0.98]'}`}
                        >
                            {isRunning ? (
                                <>
                                    <LoadingSpinner size="sm" color="white" />
                                    Analysing…
                                </>
                            ) : (
                                <>
                                    <Brain size={16} />
                                    Run AI Risk Assessment
                                </>
                            )}
                        </button>

                        {activeAssessment && !isRunning && (
                            <p className="text-center text-xs text-gray-500 mt-3 font-medium">
                                ✓ Assessment complete · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── RIGHT PANEL: Three stacked cards ────── */}
                <div className="col-span-2 flex flex-col gap-5">
                    <RiskScoreCard result={activeAssessment} />
                    <DrugInteractionCard interactions={drug_interactions} hasRun={hasRun} />
                    <ChecklistCard checklistItems={checklist} hasRun={hasRun} />
                </div>

            </div>
        </div>
    )
}
