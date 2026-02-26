import { describe, expect, it } from "vitest";
import { useFieldErrors } from "../useFieldErrors.ts";
import { renderHook } from "@testing-library/react";

describe("useFieldErrors", () => {
    it("returns empty array when given null", () => {
        const { result } = renderHook(() => useFieldErrors(null));
        expect(result.current).toEqual([]);
    })
})
