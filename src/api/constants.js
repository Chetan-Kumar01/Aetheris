/**
 * Shared application constants — keep in sync with backend enums.
 */

export const SURGERY_TYPES = [
    'Cardiac',
    'Orthopedic',
    'Neurological',
    'General',
    'Vascular',
    'Thoracic',
    'Abdominal',
    'Ophthalmic',
]

export const ASA_CLASSES = ['I', 'II', 'III', 'IV', 'V']

export const PROCEDURE_STEPS = [
    'Pre-Procedure Setup',
    'Anesthesia Induction',
    'Incision & Access',
    'Main Procedure Phase',
    'Hemostasis & Verification',
    'Closure',
    'Recovery Handoff',
]

export const ALERT_SEVERITY = {
    CRITICAL: 'critical',
    WARNING: 'warning',
    INFO: 'info',
}

/** Demo patient used for live demonstrations */
export const DEMO_PATIENT = {
    id: 'p001',
    name: 'Rajesh Kumar',
    age: 58,
    gender: 'Male',
    blood_type: 'O+',
    asa_class: 'III',
    surgery_type: 'Cardiac',
    status: 'in_progress',
    room: 'OR-3',
    medical_history: ['Diabetes', 'Hypertension'],
    medications: ['Metformin', 'Amlodipine', 'Warfarin'],
    allergies: ['Penicillin'],
}
