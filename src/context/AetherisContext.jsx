import {
    createContext,
    useContext,
    useEffect,
    useReducer,
    useCallback,
} from 'react';
import {
    getPatients,
    getAlerts,
    acknowledgeAlert as apiAcknowledgeAlert,
    checkHealth,
    createPatient,
    dischargePatient,
} from '../api/client.js';

// ── Initial state ─────────────────────────────────────────────────────────────

const FORM_DEFAULTS = {
    name: '', age: '', gender: '',
    surgery_type: 'Cardiac', asa_class: 'II',
    medications: '', allergies: '',
    diabetes: false, hypertension: false, cardiac_hx: false, smoking: false,
    weight_kg: '', height_cm: '', systolic_bp: '', diastolic_bp: '',
};

const initialState = {
    currentPatient: null,
    patients: [],
    alerts: [],
    unreadAlertCount: 0,
    currentSurgery: null,
    procedureStep: 0,
    isConnected: false,
    preOpForm: FORM_DEFAULTS,
    preOpAssessment: null,
    loading: {
        patients: false,
        preop: false,
        intraop: false,
        postop: false,
        reports: false,
    },
    error: null,
};

// ── Action types ──────────────────────────────────────────────────────────────

export const Actions = {
    SET_CURRENT_PATIENT: 'SET_CURRENT_PATIENT',
    SET_PATIENTS: 'SET_PATIENTS',
    ADD_ALERT: 'ADD_ALERT',
    ACKNOWLEDGE_ALERT: 'ACKNOWLEDGE_ALERT',
    ACKNOWLEDGE_ALL: 'ACKNOWLEDGE_ALL',
    SET_PROCEDURE_STEP: 'SET_PROCEDURE_STEP',
    SET_CONNECTED: 'SET_CONNECTED',
    SET_PREOP_FORM: 'SET_PREOP_FORM',
    SET_PREOP_ASSESSMENT: 'SET_PREOP_ASSESSMENT',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// ── Reducer ───────────────────────────────────────────────────────────────────

function aetherisReducer(state, action) {
    switch (action.type) {
        case Actions.SET_CURRENT_PATIENT:
            return { ...state, currentPatient: action.payload };

        case Actions.SET_PATIENTS:
            return { ...state, patients: action.payload };

        case Actions.ADD_ALERT:
            return {
                ...state,
                alerts: [action.payload, ...state.alerts],
                unreadAlertCount: state.unreadAlertCount + 1,
            };

        case Actions.ACKNOWLEDGE_ALERT: {
            const updated = state.alerts.map((a) =>
                a.id === action.payload ? { ...a, acknowledged: true } : a
            );
            const unread = updated.filter((a) => !a.acknowledged).length;
            return { ...state, alerts: updated, unreadAlertCount: unread };
        }

        case Actions.ACKNOWLEDGE_ALL: {
            const allRead = state.alerts.map((a) => ({ ...a, acknowledged: true }));
            return { ...state, alerts: allRead, unreadAlertCount: 0 };
        }

        case Actions.SET_PROCEDURE_STEP:
            return { ...state, procedureStep: action.payload };

        case Actions.SET_CONNECTED:
            return { ...state, isConnected: action.payload };

        case Actions.SET_PREOP_FORM:
            return { ...state, preOpForm: { ...state.preOpForm, ...action.payload } };

        case Actions.SET_PREOP_ASSESSMENT:
            return { ...state, preOpAssessment: action.payload };

        case Actions.SET_LOADING:
            return {
                ...state,
                loading: { ...state.loading, [action.payload.key]: action.payload.value },
            };

        case Actions.SET_ERROR:
            return { ...state, error: action.payload };

        case Actions.CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
}

// ── Context ───────────────────────────────────────────────────────────────────

const AetherisContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AetherisProvider({ children }) {
    const [state, dispatch] = useReducer(aetherisReducer, initialState);

    const refreshPatients = useCallback(async () => {
        dispatch({ type: Actions.SET_LOADING, payload: { key: 'patients', value: true } });
        try {
            const data = await getPatients();
            dispatch({ type: Actions.SET_PATIENTS, payload: Array.isArray(data) ? data : data.patients ?? [] });
        } catch (err) {
            dispatch({ type: Actions.SET_ERROR, payload: err.message });
        } finally {
            dispatch({ type: Actions.SET_LOADING, payload: { key: 'patients', value: false } });
        }
    }, []);

    // Fetch patients on mount and poll every 5 seconds for real-time dashboard
    useEffect(() => {
        refreshPatients();
        const intervalId = setInterval(refreshPatients, 5000);
        return () => clearInterval(intervalId);
    }, [refreshPatients]);

    // Load existing alerts from backend on mount
    useEffect(() => {
        async function loadAlerts() {
            try {
                const data = await getAlerts({ unread_only: false });
                const list = Array.isArray(data) ? data : data.alerts ?? [];
                list.forEach(alert =>
                    dispatch({ type: Actions.ADD_ALERT, payload: alert })
                );
            } catch {
                console.warn('Could not load alerts from backend');
            }
        }
        loadAlerts();
    }, []);

    // Backend health check — on mount + every 30s
    useEffect(() => {
        let interval;
        const ping = () => {
            checkHealth()
                .then(() => dispatch({ type: Actions.SET_CONNECTED, payload: true }))
                .catch(() => dispatch({ type: Actions.SET_CONNECTED, payload: false }));
        };
        ping(); // immediate check
        interval = setInterval(ping, 30_000);
        return () => clearInterval(interval);
    }, []);

    // ── Action helpers ──────────────────────────────────────────────────────────

    const selectPatient = useCallback((patient) => {
        dispatch({ type: Actions.SET_CURRENT_PATIENT, payload: patient });
    }, []);

    const addAlert = useCallback((alert) => {
        dispatch({ type: Actions.ADD_ALERT, payload: alert });
    }, []);

    const acknowledgeAlert = useCallback(async (id) => {
        try {
            await apiAcknowledgeAlert(id, { acknowledged_by: 'clinical_staff' });
        } catch {
            // Best-effort: still update local state even if API call fails
        }
        dispatch({ type: Actions.ACKNOWLEDGE_ALERT, payload: id });
    }, []);

    const acknowledgeAll = useCallback(() => {
        dispatch({ type: Actions.ACKNOWLEDGE_ALL });
    }, []);

    const setLoading = useCallback((key, bool) => {
        dispatch({ type: Actions.SET_LOADING, payload: { key, value: bool } });
    }, []);

    const advanceStep = useCallback(() => {
        dispatch({
            type: Actions.SET_PROCEDURE_STEP,
            payload: state.procedureStep + 1,
        });
    }, [state.procedureStep]);

    const setConnected = useCallback((bool) => {
        dispatch({ type: Actions.SET_CONNECTED, payload: bool });
    }, []);

    const addNewPatient = useCallback(async (data) => {
        try {
            await createPatient(data);
            await refreshPatients();
        } catch (err) {
            dispatch({ type: Actions.SET_ERROR, payload: err.message });
        }
    }, [refreshPatients]);

    const dischargeCurrentPatient = useCallback(async () => {
        if (!state.currentPatient?.id) return false;
        try {
            dispatch({ type: Actions.SET_LOADING, payload: { key: 'patients', value: true } });
            await dischargePatient(state.currentPatient.id);
            dispatch({ type: Actions.SET_CURRENT_PATIENT, payload: null });
            dispatch({ type: Actions.SET_PREOP_FORM, payload: FORM_DEFAULTS });
            dispatch({ type: Actions.SET_PREOP_ASSESSMENT, payload: null });
            await refreshPatients();
            return true;
        } catch (err) {
            dispatch({ type: Actions.SET_ERROR, payload: err.message });
            return false;
        } finally {
            dispatch({ type: Actions.SET_LOADING, payload: { key: 'patients', value: false } });
        }
    }, [state.currentPatient?.id, refreshPatients]);

    const updatePreOpForm = useCallback((updates) => {
        dispatch({ type: Actions.SET_PREOP_FORM, payload: updates });
    }, []);

    const setPreOpAssessment = useCallback((data) => {
        dispatch({ type: Actions.SET_PREOP_ASSESSMENT, payload: data });
    }, []);

    // ── Context value ───────────────────────────────────────────────────────────

    const value = {
        // state
        ...state,
        // actions
        selectPatient,
        addAlert,
        acknowledgeAlert,
        acknowledgeAll,
        setLoading,
        advanceStep,
        setConnected,
        addNewPatient,
        dischargeCurrentPatient,
        updatePreOpForm,
        setPreOpAssessment,
        // raw dispatch for advanced use
        dispatch,
    };

    return (
        <AetherisContext.Provider value={value}>
            {children}
        </AetherisContext.Provider>
    );
}

// ── Custom hook ───────────────────────────────────────────────────────────────

export const useAetheris = () => {
    const ctx = useContext(AetherisContext);
    if (!ctx) {
        throw new Error('useAetheris must be used inside <AetherisProvider>');
    }
    return ctx;
};

export default AetherisContext;
