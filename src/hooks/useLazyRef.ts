import { type RefObject, useRef } from "react";

const none = {};

// useRef, but supports function initializers while keeping correct TS types
export function useLazyRef<T>(init: T | (() => T)): RefObject<T> {
    const ref = useRef<T | {}>(typeof init === "function" ? none : init);
    if (ref.current === none && typeof init === "function") {
        ref.current = (init as Function)();
    }
    return ref as RefObject<T>;
}
