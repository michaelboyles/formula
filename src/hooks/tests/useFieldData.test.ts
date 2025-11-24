import { describe, expect, it } from "vitest";
import { useFieldData } from "../../hooks/useFieldData.ts";
import { renderHook } from "@testing-library/react";
import { useForm } from "../useForm.ts";

describe("useFieldData", () => {
    it("throws when given non-field", () => {
        expect(() => renderHook(() => {
            useFieldData(null as any);
        })).toThrow("Field is null");
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
