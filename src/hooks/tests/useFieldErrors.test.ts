import { describe, expect, it } from "vitest";
import { useFieldErrors } from "../useFieldErrors.ts";
import { renderHook } from "@testing-library/react";

describe("useFieldErrors", () => {
    it("throws when given non-field", () => {
        expect(() => renderHook(() => {
            // @ts-expect-error
            useFieldErrors(null);
        })).toThrow("Field is null");
    })
})
