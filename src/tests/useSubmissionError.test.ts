import { describe, expect, it } from "vitest";
import { useSubmissionError } from "../useSubmissionError.ts";

describe("useSubmissionError", () => {
    it("throws when given a form not created by useForm", () => {
        expect(() => useSubmissionError({} as any)).toThrow();
    })
})
