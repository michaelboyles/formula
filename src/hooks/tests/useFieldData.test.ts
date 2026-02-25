import { describe, expect, it } from "vitest";
import { useFieldData } from "../useFieldData.ts";
import { renderHook } from "@testing-library/react";
import { useForm } from "../useForm.ts";
import type { FormField } from "../../FormField.ts";

describe("useFieldData", () => {
    it("returns null when given null", () => {
        const { result } = renderHook(() => useFieldData(null));
        expect(result.current satisfies null).toBeNull();
    })

    it("returns undefined when given undefined", () => {
        const { result } = renderHook(() => useFieldData(undefined));
        expect(result.current satisfies undefined).toBeUndefined();
    })

    it("returns accepts field-or-null types", () => {
        const { result } = renderHook(() => {
            const field = null as FormField<string> | null;
            return useFieldData(field);
        });
        expect(result.current satisfies string | null).toBeNull();
    })

    it("supports the base form", () => {
        const { result } = renderHook(() => {
            const form = useForm({
                initialValues: { name: "" }
            });
            return useFieldData(form);
        });
        expect(result.current).toEqual({ name: "" })
    })
})
