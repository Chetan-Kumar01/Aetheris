import { useState, useCallback } from 'react'

/**
 * useApiCall — thin wrapper around any async API function.
 *
 * Usage:
 *   const { data, loading, error, execute, setData, clearError } =
 *     useApiCall(someApiFunction, { onSuccess, onError })
 *
 * - execute(...args) calls apiFunction(...args), managing loading/error/data.
 * - onSuccess(result) is called with the resolved value.
 * - onError(message) is called with the stringified error message.
 * - clearError() lets the caller manually dismiss the error state.
 */
function useApiCall(apiFunction, options = {}) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const execute = useCallback(async (...args) => {
        setLoading(true)
        setError(null)
        try {
            const result = await apiFunction(...args)
            setData(result)
            options.onSuccess?.(result)
            return result
        } catch (err) {
            const message = err?.message || 'API request failed'
            setError(message)
            options.onError?.(message)
            return null
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiFunction])

    const clearError = useCallback(() => setError(null), [])

    return { data, loading, error, execute, setData, clearError }
}

export default useApiCall
