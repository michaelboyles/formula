import { type RefObject, type Ref, type RefCallback, useMemo } from "react"

export function useForkRef<Instance>(...refs: Array<Ref<Instance> | undefined>): RefCallback<Instance> | null {
    // This will create a new function if the refs passed to this hook change and are all defined.
    // This means react will call the old forkRef with `null` and the new forkRef
    // with the ref. Clean-up naturally emerges from this behaviour.
    return useMemo(() => {
        if (refs.every((ref) => ref == null)) {
            return null
        }

        return (instance) => {
            refs.forEach((ref) => {
                setRef(ref, instance)
            })
        }
    }, refs)
}

function setRef<T>(
    ref: RefObject<T | null> | ((instance: T | null) => void) | null | undefined,
    value: T | null
) {
    if (typeof ref === "function") ref(value)
    else if (ref) ref.current = value
}
