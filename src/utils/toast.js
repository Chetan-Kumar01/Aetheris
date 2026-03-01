/* ─── Toast event bus ────────────────────────────────────────
   Usage (from any component or util):
     import { toast } from '../utils/toast'
     toast.success('Patient discharged successfully')
     toast.error('Connection lost')
──────────────────────────────────────────────────────────── */
let _id = 0
const _subs = new Set()

function _push(t) {
    const entry = { id: ++_id, duration: 4000, ...t }
    _subs.forEach(fn => fn(entry))
}

export const toast = {
    success: (msg, opts = {}) => _push({ type: 'success', msg, ...opts }),
    error: (msg, opts = {}) => _push({ type: 'error', msg, ...opts }),
    warning: (msg, opts = {}) => _push({ type: 'warning', msg, ...opts }),
    info: (msg, opts = {}) => _push({ type: 'info', msg, ...opts }),
}

/** Subscribe to new toasts. Returns unsubscribe function. */
export function subscribeToast(fn) {
    _subs.add(fn)
    return () => _subs.delete(fn)
}
