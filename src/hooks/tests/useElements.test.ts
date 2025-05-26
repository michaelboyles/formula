import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useForm } from "../useForm.ts";
import { useElements } from "../../hooks/useElements.ts";
import type { FormField } from "../../FormField.ts";

describe("useElements", () => {
    const nativeErrorLog = console.error;
    let errorLogs: any[] = [];

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
            // Deliberately fudge the type
            const nameField = form.get("name") as any as FormField<string[]>;
            const elements = useElements(nameField);
            return elements.length;
        });
        expect(result.current).toBe(0);
        expect(errorLogs).toContainEqual(["Expected an array but got string", "the name"]);
    })
})
