import { describe, expect, it } from "vitest";
import { useFieldValue } from "../useFieldValue.ts";
import { renderHook } from "@testing-library/react";
import { useForm } from "../useForm.ts";

describe("useFieldValue", () => {
    it("throws when given non-field", () => {
        expect(() => renderHook(() => {
            useFieldValue(null as any);
        })).toThrow("Field is null");
    })

    it("supports the base form", () => {
        const { result } = renderHook(() => {
            const form = useForm({
                initialValues: { name: "" }
            });
            return useFieldValue(form);
        });
        expect(result.current).toEqual({ name: "" })
    })
})
