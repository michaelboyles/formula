import { describe, expect, it } from "vitest";
import { useFieldValue } from "../useFieldValue.ts";
import { renderHook } from "@testing-library/react";

describe("useFieldValue", () => {
    it("throws when given non-field", () => {
        expect(() => renderHook(() => {
            useFieldValue(null as any);
        })).toThrow("Field is null");
    })
})
