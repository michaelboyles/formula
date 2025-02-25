import { FieldPath } from "./FieldPath";
import { ArrayValidator, FieldVisitor, Issue, ObjValidator, Validator, Visitor } from "./validate";

export async function validateObject<R, T extends Record<string, unknown>>(rootData: R, data: T, visitor: Visitor<T>, path: FieldPath) {
    if (!data) return [];
    const promises: Promise<Issue[]>[] = [];
    for (const key in visitor) {
        const keyVisitor = visitor[key];
        if (!keyVisitor) continue;
        promises.push(validateValue(rootData as any, data[key], keyVisitor, path.withProperty(key)));
    }
    return (await Promise.all(promises)).flatMap(issues => issues);
}

async function validateValue<V, R>(rootData: R, value: V, keyVisitor: FieldVisitor<V, R>, path: FieldPath): Promise<Issue[]> {
    const issues: Issue[] = [];
    function pushIssues(_issues: string | string[]) {
        if (typeof _issues === "string") {
            issues.push({ path, message: _issues });
        }
        else {
            for (const message of _issues) {
                issues.push({ path, message });
            }
        }
    }

    if (Array.isArray(value)) {
        const arrVisitor = keyVisitor as ArrayValidator<unknown, R>;
        const promises: Promise<Issue[]>[] = [];
        const arrayIssues = await arrVisitor(
            value,
            validator => {
                for (let i = 0; i < value.length; ++i) {
                    promises.push(validateValue(rootData, value[i], validator, path.withArrayIndex(i)));
                }
            }
        );
        if (arrayIssues) {
            pushIssues(arrayIssues);
        }

        const elementIssues = (await Promise.all(promises)).flatMap(a => a);
        if (elementIssues) {
            issues.push(...elementIssues);
        }
    }
    else if (typeof value === "object" && value !== null) {
        const objVisitor = keyVisitor as ObjValidator<{}>;
        const promises: Promise<Issue[]>[] = [];
        const objectIssues = await objVisitor(
            value,
            visitor => {
                promises.push(validateObject(rootData, value, visitor, path));
            }
        );
        if (objectIssues) {
            pushIssues(objectIssues);
        }

        const keyIssues = (await Promise.all(promises)).flatMap(a => a);
        if (keyIssues.length) {
            issues.push(...keyIssues);
        }
    }
    else {
        const primitiveVisitor = keyVisitor as Validator<V, R>;
        const issues = await primitiveVisitor(value, rootData);
        if (issues) {
            pushIssues(issues);
        }
    }
    return issues;
}