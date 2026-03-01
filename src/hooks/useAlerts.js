import { useState, useCallback } from 'react'
import { alerts as initialAlerts } from '../data/mockData'

let _nextId = 100  // auto-increment for new alerts

/**
 * useAlerts()
 *
 * Returns { alerts, acknowledgeAlert, addAlert, unreadCount }
 * Works with both:
 *   import useAlerts from '../hooks/useAlerts'        (default)
 *   import { useAlerts } from '../hooks/useAlerts'    (named)
 */
export function useAlerts() {
    const [alerts, setAlerts] = useState(initialAlerts)

    /** Mark an alert as acknowledged (dims it, does not remove) */
    const acknowledgeAlert = useCallback((id) => {
        setAlerts(prev =>
            prev.map(a => a.id === id ? { ...a, acknowledged: true } : a)
        )
    }, [])

    /** Programmatically inject a new alert */
    const addAlert = useCallback((alert) => {
        _nextId++
        setAlerts(prev => [
            {
                id: `A${_nextId}`,
                severity: 'medium',
                patientName: 'System',
                patientId: null,
                time: 'just now',
                acknowledged: false,
                ...alert,
            },
            ...prev,
        ])
    }, [])

    const unreadCount = alerts.filter(a => !a.acknowledged).length

    return { alerts, acknowledgeAlert, addAlert, unreadCount }
}

export default useAlerts
