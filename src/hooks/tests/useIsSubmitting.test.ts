import { describe, expect, it } from "vitest";
import { useIsSubmitting } from "../useIsSubmitting.ts";
import { useForm } from "../../hooks/useForm.ts";
import { renderHook } from "@testing-library/react";

describe("useIsSubmitting", () => {
    it("throws when given a form not created by useForm", () => {
        expect(() => useIsSubmitting({} as any)).toThrow();
    })

    it("changes after submission", async () => {
        const { result } = renderHook(() => {
            const form = useForm({
                initialValues: { name: "" },
                submit: () => new Promise(_ => {}) // never resolve
            });
            const isSubmitting = useIsSubmitting(form);
            return { isSubmitting, submit: form.submit }
        });
        expect(result.current.isSubmitting).toBe(false);
        result.current.submit();
        await expect.poll(() => result.current.isSubmitting).toBe(true);
    })
})
