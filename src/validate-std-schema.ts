import type { StandardSchemaV1 } from "@standard-schema/spec";

export async function validateStandardSchema<T>(data: T, validators: ReadonlyArray<StandardSchemaV1<T>>): Promise<StandardSchemaV1.Issue[]> {
    async function validate(validator: StandardSchemaV1<T>) {
        const result = await validator["~standard"].validate(data);
        if (!result.issues) return [];
        return result.issues.filter(issue => issue.path);
    }

    const results = await Promise.all(validators.map(async validator => await validate(validator)));
    return results.flatMap(issues => issues);
}
