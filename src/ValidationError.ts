import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Thrown when form submission fails due to validation issues.
 */
export class ValidationError extends Error {
    readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;

    constructor(issues: ReadonlyArray<StandardSchemaV1.Issue>) {
        super("Form has validation errors");
        this.issues = issues;
    }
}
