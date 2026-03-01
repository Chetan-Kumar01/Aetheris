import { useState, useEffect, useRef, useCallback } from 'react'
import {
    Heart, Wind, Activity, Thermometer, Zap,
    TrendingUp, TrendingDown, Minus,
    AlertCircle, ShieldCheck, Mic, MicOff, Clock,
    ChevronRight, Send, MessageSquare
} from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import VitalsChart from '../components/charts/VitalsChart'
import ApiErrorBanner from '../components/ui/ApiErrorBanner'
import { VitalsWebSocket } from '../api/websocket'
import { sendVoiceCommand, sendVoiceAudio, sendTextCommand, advanceProcedureStep, createAlert } from '../api/client'
import { useAetheris } from '../context/AetherisContext'

/* ═══ CONSTANTS ══════════════════════════════════════════════ */

const PROCEDURE_STEPS = [
    { id: 'induction', label: 'Anesthesia Induction', time: '07:02' },
    { id: 'incision', label: 'Incision', time: '07:18' },
    { id: 'phase1', label: 'Procedure Phase 1', time: '07:45' },
    { id: 'phase2', label: 'Procedure Phase 2', time: '09:10' },
    { id: 'closure', label: 'Closure', time: '10:40' },
    { id: 'handoff', label: 'Recovery Handoff', time: '11:00' },
]

/* ═══ VITAL CARD ═════════════════════════════════════════════ */
function VitalCard({ label, value, unit, prev, icon: Icon, iconColor, iconBg, getStyle }) {
    const [flash, setFlash] = useState(false)
    const prevRef = useRef(value)

    useEffect(() => {
        if (prevRef.current !== value) {
            setFlash(true)
            const t = setTimeout(() => setFlash(false), 500)
            prevRef.current = value
            return () => clearTimeout(t)
        }
    }, [value])

    const trend = prev == null ? 0 : value > prev ? 1 : value < prev ? -1 : 0
    const style = getStyle ? getStyle(value) : {}

    return (
        <div className={`bg-gray-900 rounded-xl p-4 border transition-colors duration-500
      ${flash ? 'border-teal-700/80 bg-gray-800' : 'border-gray-800'}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon size={14} className={iconColor} />
                </div>
            </div>
            <div className="flex items-end gap-1.5">
                <span className={`text-2xl font-bold leading-none transition-colors duration-500 ${style.value ?? 'text-white'}`}>
                    {typeof value === 'number' ? value.toFixed(1).replace('.0', '') : value}
                </span>
                <span className="text-xs text-gray-500 mb-0.5">{unit}</span>
                {trend !== 0 && (
                    trend === 1
                        ? <TrendingUp size={13} className="text-green-400 mb-0.5" />
                        : <TrendingDown size={13} className="text-red-400 mb-0.5" />
                )}
                {trend === 0 && <Minus size={13} className="text-gray-600 mb-0.5" />}
            </div>
            {style.badge && (
                <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
                    {style.badgeLabel}
                </span>
            )}
        </div>
    )
}

/* ═══ ANOMALY ALERT PANEL ════════════════════════════════════ */
function AlertPanel({ alerts, onAcknowledge }) {
    const BORDER = { critical: 'border-red-500', warning: 'border-amber-500', info: 'border-blue-500' }
    const BADGE = {
        critical: 'bg-red-900/40 text-red-400 border border-red-800/40',
        warning: 'bg-amber-900/40 text-amber-400 border border-amber-800/40',
        info: 'bg-blue-900/40 text-blue-400 border border-blue-800/40',
    }

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <AlertCircle size={16} className="text-red-400" />
                <h3 className="text-white font-semibold text-sm flex-1">Real-Time Alerts</h3>
                {alerts.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-800/40">
                        {alerts.length} active
                    </span>
                )}
            </div>

            {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-green-900/30 border border-green-800/30 flex items-center justify-center mb-3">
                        <ShieldCheck size={22} className="text-green-400" />
                    </div>
                    <p className="text-green-400 text-sm font-semibold">All vitals normal</p>
                    <p className="text-gray-500 text-xs mt-1">Monitoring active</p>
                </div>
            ) : (
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
                    {alerts.map(a => (
                        <div key={a.id} className={`border-l-4 ${BORDER[a.type] ?? 'border-gray-600'} bg-gray-800 rounded-r-xl p-3`}>
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${BADGE[a.type] ?? BADGE.info}`}>
                                            {(a.type ?? 'info').toUpperCase()}
                                        </span>
                                        <p className="text-xs font-semibold text-white">{a.title}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-snug">{a.message}</p>
                                    <p className="text-[10px] text-gray-600 mt-1">{a.time}</p>
                                </div>
                                <button
                                    onClick={() => onAcknowledge(a.id)}
                                    className="text-[10px] font-semibold text-teal-400 hover:text-teal-300 whitespace-nowrap mt-0.5 transition-colors flex-shrink-0"
                                >
                                    Ack ✓
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}



/* ═══ CHATBOT PANEL ════════════════════════════════════════════ */
function ChatbotPanel({ currentPatient, addAlert }) {
    const [listening, setListening] = useState(false)
    const [voiceProcessing, setVoiceProcessing] = useState(false)
    const [textInput, setTextInput] = useState('')
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Aetheris AI initialized. How can I assist you?', type: 'text' }
    ])

    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const messagesEndRef = useRef(null)

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setListening(false);
    }, []);

    const startListening = useCallback(async () => {
        if (listening || voiceProcessing) return

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop()); // Stop mic
                await handleVoiceAudio(audioBlob);
            };

            mediaRecorder.start();
            setListening(true)
        } catch (error) {
            console.error("Microphone access error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Microphone access denied or error occurred.', type: 'error' }])
        }
    }, [listening, voiceProcessing]) // eslint-disable-line react-hooks/exhaustive-deps

    async function handleVoiceAudio(audioBlob) {
        setVoiceProcessing(true)
        const tempId = Date.now()
        setMessages(prev => [...prev, { id: tempId, role: 'user', content: 'Transcribing voice...', type: 'processing' }])
        try {
            const result = await sendVoiceAudio(currentPatient?.id || 'p001', audioBlob);
            setMessages(prev => prev.map(m => m.id === tempId ? { role: 'user', content: result.transcription || '...', type: 'voice' } : m))
            setMessages(prev => [...prev, { role: 'assistant', content: result.response, type: 'text' }])
        } catch (error) {
            console.error("Audio upload failed:", error);
            setMessages(prev => prev.map(m => m.id === tempId ? { role: 'user', content: 'Voice capture failed', type: 'error' } : m))
        } finally {
            setVoiceProcessing(false)
        }
    }

    const handleTextSubmit = async (e) => {
        e.preventDefault()
        if (!textInput.trim() || voiceProcessing) return

        const query = textInput.trim()
        setTextInput('')
        setMessages(prev => [...prev, { role: 'user', content: query, type: 'text' }])
        setVoiceProcessing(true)

        try {
            const result = await sendTextCommand(currentPatient?.id || 'p001', query);
            setMessages(prev => [...prev, { role: 'assistant', content: result.response, type: 'text' }])
        } catch (error) {
            console.error("Text command failed:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to reach AI. Check connection.', type: 'error' }])
        } finally {
            setVoiceProcessing(false)
        }
    }

    const busy = listening || voiceProcessing

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex flex-col h-[400px]">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-teal-400" />
                <h3 className="text-white font-semibold text-sm">Aetheris AI Co-Pilot</h3>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                {messages.map((msg, idx) => (
                    <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                            ? 'bg-teal-600/20 text-teal-100 border border-teal-500/20 rounded-br-sm'
                            : msg.type === 'error'
                                ? 'bg-red-900/20 text-red-200 border border-red-800/30 rounded-bl-sm'
                                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'
                            }`}>
                            {msg.type === 'voice' && <Mic size={12} className="inline mr-1.5 text-teal-400 mb-0.5" />}
                            {msg.type === 'processing' && <span className="animate-pulse">🎙️ Processing...</span>}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {listening && (
                    <div className="flex justify-end">
                        <div className="max-w-[85%] bg-amber-500/10 text-amber-200 border border-amber-500/20 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm flex items-center gap-2 animate-pulse shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500 block" /> Listening...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="relative mt-auto">
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                    <button
                        type="button"
                        title={listening ? "Stop Recording" : "Use Voice Input"}
                        onClick={listening ? stopListening : startListening}
                        disabled={voiceProcessing && !listening}
                        className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-sm ${listening
                            ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse border'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-teal-400 border border-gray-700 disabled:opacity-50'
                            }`}
                    >
                        {listening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Ask about the patient or the analysis..."
                        disabled={listening || voiceProcessing}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors shadow-inner disabled:opacity-50"
                    />

                    <button
                        type="submit"
                        disabled={!textInput.trim() || busy}
                        className="flex-shrink-0 w-11 h-11 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm disabled:shadow-none"
                    >
                        <Send size={16} className={!textInput.trim() || busy ? 'opacity-50' : ''} />
                    </button>
                </form>
            </div>
        </div>
    )
}

/* ═══ PROCEDURE TIMELINE ════════════════════════════════════ */
function ProcedureTimeline({ procedureStep, currentSurgery, advanceStep }) {
    const handleAdvanceStep = useCallback(async () => {
        if (procedureStep >= PROCEDURE_STEPS.length - 1) return
        try {
            await advanceProcedureStep({
                surgery_id: currentSurgery?.id || 'demo-surgery',
                current_step: procedureStep + 1,
            })
            advanceStep()  // dispatch to context
        } catch {
            // Silent fail — UI remains consistent
        }
    }, [procedureStep, currentSurgery, advanceStep])

    return (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-teal-400" />
                    <h3 className="text-white font-semibold text-sm">Procedure Timeline</h3>
                </div>
                <span className="text-xs text-gray-500 font-medium">OR-3 · Dr. Okafor</span>
            </div>

            <div className="relative">
                {PROCEDURE_STEPS.map((step, i) => {
                    const done = i < procedureStep
                    const current = i === procedureStep
                    const pending = i > procedureStep

                    return (
                        <div key={step.id} className="flex gap-4 items-start mb-0">
                            {/* Indicator column */}
                            <div className="flex flex-col items-center flex-shrink-0">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 transition-all
                    ${done ? 'bg-teal-600 shadow-lg shadow-teal-900/50' : ''}
                    ${current ? 'bg-amber-500 animate-pulse shadow-lg shadow-amber-900/50' : ''}
                    ${pending ? 'bg-gray-700 text-gray-500' : ''}`}
                                >
                                    {done ? (
                                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        i + 1
                                    )}
                                </div>
                                {i < PROCEDURE_STEPS.length - 1 && (
                                    <div className={`w-0.5 h-8 mt-1 mb-1 rounded-full transition-colors
                    ${done ? 'bg-teal-600/60' : 'bg-gray-700'}`}
                                    />
                                )}
                            </div>

                            {/* Label */}
                            <div className="pb-8 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className={`text-sm font-semibold leading-tight
                    ${done ? 'text-gray-400' : ''}
                    ${current ? 'text-amber-400' : ''}
                    ${pending ? 'text-gray-600' : ''}`}>
                                        {step.label}
                                    </p>
                                    {current && (
                                        <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-900/30 border border-amber-800/30">
                                            IN PROGRESS
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs mt-0.5 font-mono
                  ${done ? 'text-teal-500' : current ? 'text-amber-500/70' : 'text-gray-600'}`}>
                                    {done || current ? step.time : '—'}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Advance step button */}
            <button
                onClick={handleAdvanceStep}
                disabled={procedureStep >= PROCEDURE_STEPS.length - 1}
                className="mt-1 w-full py-2 rounded-xl border border-teal-800/50 text-teal-400 text-xs font-semibold
          hover:bg-teal-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                Advance Step →
            </button>
        </div>
    )
}

/* ═══ MAIN PAGE ══════════════════════════════════════════════ */
const VITALS_INIT = {
    heart_rate: 0, spo2: 0, systolic_bp: 0,
    diastolic_bp: 0, temperature: 0, etco2: 0, resp_rate: 0,
}

export default function IntraOpPage() {
    const {
        currentPatient, currentSurgery,
        alerts, procedureStep,
        addAlert, acknowledgeAlert, advanceStep, setConnected,
    } = useAetheris()

    const [vitals, setVitals] = useState(VITALS_INIT)
    const [prevVitals, setPrevVitals] = useState(null)
    const [vitalsHistory, setVitalsHistory] = useState([])
    const [wsConnected, setWsConnected] = useState(false)
    const [wsError, setWsError] = useState(null)
    const wsRef = useRef(null)

    /* ── Request Notification Permission ──────────────────── */
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission()
        }
    }, [])

    /* ── WebSocket vitals stream ──────────────────────────── */
    useEffect(() => {
        const patientId = currentPatient?.id || 'p001'

        wsRef.current = new VitalsWebSocket(
            patientId,
            // onVitals
            (newVitals) => {
                setPrevVitals(prev => prev)
                setVitals(curr => { setPrevVitals(curr); return newVitals })
                setVitalsHistory(prev => {
                    const point = {
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        hr: Math.round(newVitals.heart_rate ?? 0),
                        spo2: parseFloat((newVitals.spo2 ?? 0).toFixed(1)),
                        bp: Math.round(newVitals.systolic_bp ?? 0),
                        etco2: Math.round(newVitals.etco2 ?? 0),
                    }
                    return [...prev, point].slice(-20)
                })
                setWsConnected(true)
                setWsError(null)
            },
            // onAlert
            (incomingAlerts) => {
                incomingAlerts.forEach(async (alert) => {
                    const normalised = {
                        id: alert.id || `ws-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                        type: alert.severity?.toLowerCase() === 'critical' ? 'critical'
                            : alert.severity?.toLowerCase() === 'warning' ? 'warning' : 'info',
                        title: alert.title || 'Anomaly Detected',
                        message: alert.message || '',
                        time: 'just now',
                    }
                    // Persist to backend (best-effort)
                    try {
                        await createAlert({
                            patient_id: alert.patient_id || currentPatient?.id || 'p001',
                            severity: alert.severity || 'warning',
                            title: alert.title || 'Anomaly Detected',
                            message: alert.message || '',
                            vital_type: alert.vital_type || null,
                            vital_value: alert.vital_value || null,
                        })
                    } catch {
                        // Backend unavailable — still surface in UI
                    }
                    addAlert(normalised)

                    // Trigger Native OS Notification
                    if ("Notification" in window && Notification.permission === "granted") {
                        new Notification(`🚨 ${normalised.title}`, { body: normalised.message })
                    }

                    // Trigger Audio Alarm (Harsh Square Wave)
                    try {
                        const ctx = new (window.AudioContext || window.webkitAudioContext)()
                        const osc = ctx.createOscillator()
                        const gain = ctx.createGain()
                        osc.connect(gain)
                        gain.connect(ctx.destination)
                        osc.type = 'square'
                        osc.frequency.setValueAtTime(1000, ctx.currentTime)
                        gain.gain.setValueAtTime(1.0, ctx.currentTime)
                        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5)
                        osc.start()
                        osc.stop(ctx.currentTime + 1.5)
                    } catch (e) {
                        console.warn("Audio error", e)
                    }
                })
            },
            // onError
            () => {
                setWsConnected(false)
                setWsError('WebSocket disconnected — vitals stream unavailable. Check that the backend is running.')
            }
        )

        wsRef.current.connect()
        setConnected(true)
        setWsError(null)

        return () => {
            wsRef.current?.disconnect()
            setConnected(false)
        }
    }, [currentPatient?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    /* SpO₂ color logic */
    const spo2Style = val =>
        val > 95
            ? { value: 'text-green-400' }
            : val >= 90
                ? { value: 'text-amber-400', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40', badgeLabel: 'Caution' }
                : { value: 'text-red-400', badge: 'bg-red-900/40 text-red-400 border border-red-800/40', badgeLabel: 'Critical' }

    /* BP status badge */
    const bpStyle = val => {
        if (val > 140) return { value: 'text-red-400', badge: 'bg-red-900/40 text-red-400 border border-red-800/40', badgeLabel: 'Hypertensive' }
        if (val < 90) return { value: 'text-amber-400', badge: 'bg-amber-900/40 text-amber-400 border border-amber-800/40', badgeLabel: 'Hypotensive' }
        return { value: 'text-white', badge: 'bg-green-900/40 text-green-400 border border-green-800/40', badgeLabel: 'Normal' }
    }

    /* Local-only unacknowledged alerts for the panel */
    const localAlerts = alerts.filter(a => !a.acknowledged)

    return (
        <div className="animate-fadeIn space-y-4">
            <SectionHeader
                title="Intra-Op Monitor"
                subtitle="Real-time operative vitals and anaesthesia tracking"
                icon={Activity}
            />

            {/* WebSocket error banner */}
            {wsError && (
                <ApiErrorBanner
                    error={wsError}
                    onRetry={() => {
                        setWsError(null)
                        wsRef.current?.disconnect()
                        wsRef.current?.connect()
                    }}
                    onDismiss={() => setWsError(null)}
                />
            )}

            {/* ── TOP ROW: 5 vital cards ───────────────── */}
            <div className="grid grid-cols-5 gap-3">
                <VitalCard
                    label="Heart Rate" unit="bpm" icon={Heart}
                    value={vitals.heart_rate} prev={prevVitals?.heart_rate}
                    iconColor="text-red-400" iconBg="bg-red-900/20"
                />
                <VitalCard
                    label="SpO₂" unit="%" icon={Wind}
                    value={vitals.spo2} prev={prevVitals?.spo2}
                    iconColor="text-blue-400" iconBg="bg-blue-900/20"
                    getStyle={spo2Style}
                />
                <VitalCard
                    label="Blood Pressure" unit="mmHg" icon={Activity}
                    value={vitals.systolic_bp && vitals.diastolic_bp
                        ? `${Math.round(vitals.systolic_bp)}/${Math.round(vitals.diastolic_bp)}`
                        : '—'}
                    prev={null}
                    iconColor="text-yellow-400" iconBg="bg-yellow-900/20"
                    getStyle={() => bpStyle(vitals.systolic_bp)}
                />
                <VitalCard
                    label="Temperature" unit="°C" icon={Thermometer}
                    value={vitals.temperature} prev={prevVitals?.temperature}
                    iconColor="text-green-400" iconBg="bg-green-900/20"
                />
                <VitalCard
                    label="EtCO₂" unit="mmHg" icon={Zap}
                    value={vitals.etco2} prev={prevVitals?.etco2}
                    iconColor="text-violet-400" iconBg="bg-violet-900/20"
                />
            </div>

            {/* ── MAIN ROW: Chart + Alerts ─────────────── */}
            <div className="grid grid-cols-3 gap-4">

                {/* Live AreaChart */}
                <div className="col-span-2 bg-gray-900 rounded-2xl border border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-semibold text-sm">Live Vitals Chart</h3>
                        <div className="flex items-center gap-3">
                            {[
                                { color: '#ef4444', label: 'HR' },
                                { color: '#3b82f6', label: 'SpO₂' },
                                { color: '#eab308', label: 'BP' },
                                { color: '#a78bfa', label: 'EtCO₂' },
                            ].map(({ color, label }) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                                    <span className="text-xs text-gray-400">{label}</span>
                                </div>
                            ))}

                            {/* Connection status badge */}
                            {wsConnected ? (
                                <span className="bg-green-600 text-white text-[10px] font-bold animate-pulse rounded px-2 py-0.5 ml-1">
                                    LIVE
                                </span>
                            ) : (
                                <span className="bg-amber-600 text-white text-[10px] font-bold rounded px-2 py-0.5 ml-1">
                                    RECONNECTING…
                                </span>
                            )}
                        </div>
                    </div>

                    <VitalsChart data={vitalsHistory} height={220} />
                </div>

                {/* Anomaly Alerts — driven by global context */}
                <AlertPanel alerts={localAlerts} onAcknowledge={acknowledgeAlert} />
            </div>

            {/* ── BOTTOM ROW: Voice + Timeline ─────────── */}
            <div className="grid grid-cols-2 gap-4">
                <ChatbotPanel currentPatient={currentPatient} addAlert={addAlert} />
                <ProcedureTimeline
                    procedureStep={procedureStep}
                    currentSurgery={currentSurgery}
                    advanceStep={advanceStep}
                />
            </div>
        </div>
    )
}
