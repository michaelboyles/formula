import { StandardSchemaV1 } from "@standard-schema/spec";
import { FieldPath } from "./FieldPath";

type Issue = {
    path: FieldPath
    message: string
}

export async function getValidationIssues<T>(values: T, validators: StandardSchemaV1<T>[]) {
    const results = await Promise.all(validators.map(async validator => await _getValidationIssues(values, validator)));
    return results.flatMap(issues => issues);
}

async function _getValidationIssues<T>(values: T, validator: StandardSchemaV1<T>) {
    const result = await validator["~standard"].validate(values);
    if (!result.issues) return [];

    const nativeIssues: Issue[] = [];
    for (const issue of result.issues) {
        if (!issue.path) {
            console.log("issue has no path", JSON.stringify(issue));
            continue;
        }
        const path = convertPath(issue.path);

        nativeIssues.push({ path, message: issue.message })
    }
    return nativeIssues;
}

function convertPath(path: StdPath) {
    let fieldPath = FieldPath.create();
    path.map(part => unwrapPathPart(part)).forEach(part => {
        if (typeof part === "string") {
            fieldPath = fieldPath.withProperty(part);
        }
        else if (typeof part === "number") {
            fieldPath = fieldPath.withArrayIndex(part);
        }
        else {
            throw new Error("Symbols not supported");
        }
    });
    return fieldPath;
}

function unwrapPathPart(part: PropertyKey | StdPath[number]): string | number | symbol {
    if (typeof part === "object" && Object.hasOwn(part, "key")) {
        return part.key;
    }
    else if (typeof part === "string" || typeof part === "number" || typeof part === "symbol") {
        return part;
    }
    throw new Error("Unsupported path part " + part);
}

type StdPath = NonNullable<StandardSchemaV1.Issue["path"]>;
