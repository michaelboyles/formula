import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useForm } from "../useForm.ts";
import { useElements } from "../../hooks/useElements.ts";

describe("useElements", () => {
    const nativeErrorLog = console.error;
    let errorLogs: unknown[] = [];

    beforeEach(() => {
        console.error = (...args) => {
            errorLogs.push(args);
        }
    });

    afterEach(() => {
        errorLogs = [];
        console.error = nativeErrorLog;
    });

    it("safely handles non-arrays", () => {
        const { result } = renderHook(() => {
            const form = useForm({
                initialValues: { name: "the name" },
                submit: () => {}
            });
            // @ts-expect-error - name is not an array
            const elements = useElements(form("name"));
            return elements.length;
        });
        expect(result.current).toBe(0);
        expect(errorLogs).toContainEqual(["Expected 'name' to be an array. Found: string"]);
    })

    it("throws when given non-field", () => {
        expect(() => renderHook(() => {
            // @ts-expect-error - null is not a valid argument
            useElements(null);
        })).toThrow("Field is null");
    })
})
