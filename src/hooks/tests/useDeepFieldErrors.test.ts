import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useForm } from "../../hooks/useForm.ts";
import { useDeepFieldErrors } from "../../hooks/useDeepFieldErrors.ts";

describe("useDeepFieldErrors", () => {
    it("includes errors for nested fields", () => {
        const { result, rerender } = renderHook(() => {
            const form = useForm({
                initialValues: {
                    animal: {
                        species: "dog"
                    }
                }
            });
            const animalErrors = useDeepFieldErrors(form("animal"));
            return { form, animalErrors };
        });
        result.current.form("animal")("species").setErrors("error");
        rerender();
        expect(result.current.animalErrors).toStrictEqual(["error"])
    });
})
