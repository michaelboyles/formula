import type { StandardSchemaV1 } from "@standard-schema/spec";

export async function getValidationIssues<T>(data: T, validators: ReadonlyArray<StandardSchemaV1<T>>): Promise<StandardSchemaV1.Issue[]> {
    const results = await Promise.all(validators.map(async validator => await _getValidationIssues(data, validator)));
    return results.flatMap(issues => issues);
}

async function _getValidationIssues<T>(data: T, validator: StandardSchemaV1<T>): Promise<StandardSchemaV1.Issue[]> {
    const result = await validator["~standard"].validate(data);
    if (!result.issues) return [];
    return result.issues.filter(issue => issue.path);
}
