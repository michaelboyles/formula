// Thrown when form submission fails due to validation issues.
import type { Issue } from "./validate.ts";

export class ValidationError extends Error {
    readonly issues: ReadonlyArray<Issue>;

    constructor(issues: ReadonlyArray<Issue>) {
        super("Form has validation errors");
        this.issues = issues;
    }
}
