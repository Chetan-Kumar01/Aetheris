import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard, ClipboardList, Activity, FileText,
    BarChart2, Settings, Layers, Shield, LogOut, X,
    ChevronDown, ChevronUp, User,
} from 'lucide-react'
import { useAetheris } from '../../context/AetherisContext'
import PatientFormModal from '../PatientFormModal'

const NAV = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: true },
    { to: '/preop', label: 'Pre-Op', icon: ClipboardList },
    { to: '/intraop', label: 'Intra-Op', icon: Activity },
    { to: '/postop', label: 'Post-Op', icon: FileText },
    { to: '/reports', label: 'Reports', icon: BarChart2 },
    { to: '/components', label: 'Components', icon: Layers },
    { to: '/settings', label: 'Settings', icon: Settings },
]

const ASA_STYLE = {
    I: 'bg-green-900/40 text-green-400 border border-green-800/40',
    II: 'bg-teal-900/40 text-teal-400 border border-teal-800/40',
    III: 'bg-amber-900/40 text-amber-400 border border-amber-800/40',
    IV: 'bg-red-900/40 text-red-400 border border-red-800/40',
    V: 'bg-red-900/60 text-red-300 border border-red-800/60',
}

const AVATAR_COLORS = [
    'from-teal-500 to-teal-700',
    'from-blue-500 to-blue-700',
    'from-violet-500 to-violet-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-700',
]

function getInitials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

/* ── Patient Selector ────────────────────────────────────────── */
function PatientSelector() {
    const { patients, currentPatient, selectPatient, loading, addNewPatient } = useAetheris()
    const [open, setOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const ref = useRef(null)

    // Close on outside click
    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const isLoading = loading?.patients

    const handlePatientSubmit = async (patientData) => {
        await addNewPatient(patientData)
        setIsModalOpen(false)
        setOpen(true) // Keep dropdown open to see new patient
    }

    return (
        <div ref={ref} className="px-3 pb-3 border-t border-gray-800 pt-3">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium px-1 mb-2">
                Active Patient
            </p>

            {/* Trigger */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700/80 rounded-xl p-3
          border border-gray-700/50 hover:border-gray-600/60 transition-all text-left"
            >
                {currentPatient ? (
                    <>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700
              flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(currentPatient.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-xs truncate">{currentPatient.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {currentPatient.asa_class && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ASA_STYLE[currentPatient.asa_class] || ASA_STYLE.II}`}>
                                        ASA {currentPatient.asa_class}
                                    </span>
                                )}
                                {currentPatient.surgery_type && (
                                    <span className="text-[9px] text-gray-400 truncate">{currentPatient.surgery_type}</span>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-gray-500" />
                        </div>
                        <span className="text-gray-500 text-xs flex-1">
                            {isLoading ? 'Loading patients…' : 'Select a patient'}
                        </span>
                    </>
                )}
                {open
                    ? <ChevronUp size={13} className="text-gray-500 flex-shrink-0" />
                    : <ChevronDown size={13} className="text-gray-500 flex-shrink-0" />}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="mt-1 bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                    {patients.length === 0 ? (
                        <p className="text-center text-gray-500 text-xs py-4 px-3">
                            {isLoading ? 'Loading…' : 'No patients loaded'}
                        </p>
                    ) : (
                        patients.map((patient, idx) => {
                            const isSelected = currentPatient?.id === patient.id
                            return (
                                <button
                                    key={patient.id}
                                    onClick={() => { selectPatient(patient); setOpen(false) }}
                                    className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors
                    hover:bg-gray-700/60 border-b border-gray-700/30 last:border-0
                    ${isSelected ? 'bg-teal-900/20' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br
                      ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}
                      flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                        {getInitials(patient.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-xs truncate">{patient.name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                            {patient.asa_class && (
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ASA_STYLE[patient.asa_class] || ASA_STYLE.II}`}>
                                                    ASA {patient.asa_class}
                                                </span>
                                            )}
                                            {patient.surgery_type && (
                                                <span className="text-[9px] text-gray-400 truncate">{patient.surgery_type}</span>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                                    )}
                                </button>
                            )
                        })
                    )}

                    {/* Add Patient Button */}
                    <div className="p-2 border-t border-gray-700/60 bg-gray-800/50">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold
                                     text-teal-400 bg-teal-900/20 hover:bg-teal-900/40 border border-teal-800/40
                                     rounded-lg transition-colors shadow-sm"
                        >
                            + Add New Patient
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Portal */}
            <PatientFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handlePatientSubmit}
            />
        </div>
    )
}

/* ── Shared nav content ──────────────────────────────────── */
function SidebarContent({ unreadCount, onNavClick }) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <Shield size={16} className="text-white" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">Aetheris</span>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV.map(({ to, label, icon: Icon, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onNavClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group
               ${isActive
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`
                        }
                    >
                        <Icon size={18} className="flex-shrink-0" />
                        <span className="flex-1">{label}</span>
                        {badge && unreadCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500
                text-white min-w-[18px] text-center">
                                {unreadCount}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Patient selector */}
            <PatientSelector />

            {/* User footer */}
            <div className="px-3 pb-4 border-t border-gray-800 pt-3">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-800
          transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700
            flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">Dr. Jane Doe</p>
                        <p className="text-[10px] text-teal-400 font-medium mt-0.5">Surgeon / Anesthesiologist</p>
                    </div>
                    <LogOut size={14} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                </div>
            </div>
        </div>
    )
}

/* ── Sidebar wrapper (desktop always-on + mobile slide-in) ── */
export default function Sidebar({ open, onClose, unreadCount }) {
    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 bg-gray-900 border-r border-gray-800
        flex-col flex-shrink-0 z-30">
                <SidebarContent unreadCount={unreadCount} onNavClick={() => { }} />
            </aside>

            {/* Mobile backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile slide-in sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800
        flex flex-col z-50 lg:hidden transform transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-end p-3 border-b border-gray-800">
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <SidebarContent unreadCount={unreadCount} onNavClick={onClose} />
                </div>
            </aside>
        </>
    )
}
