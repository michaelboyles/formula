import { describe, expect, it } from "vitest";
import { useIsSubmitting } from "../useIsSubmitting.ts";

describe("useIsSubmitting", () => {
    it("throws when given a form not created by useForm", () => {
        expect(() => useIsSubmitting({} as any)).toThrow();
    })
})
