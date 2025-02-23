import { FieldPath } from "./FieldPath";
import { ArrayValidator, FieldVisitor, Issue, ObjValidator, Validator, Visitor } from "./validate";

export async function validateObject<R, T extends Record<string, any>>(rootData: R, data: T, visitor: Visitor<T>, path: FieldPath) {
    const promises: Promise<Issue[]>[] = [];
    for (const [key, value] of Object.entries(data)) {
        const keyVisitor = visitor[key];
        if (keyVisitor) {
            promises.push(validateValue(rootData as any, value, keyVisitor, path.withProperty(key)));
        }
    }
    const issues = await Promise.all(promises);
    return issues.flatMap(a => a);
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
        const arrVisitor = keyVisitor as ArrayValidator<typeof value, R>;
        const arrayIssues = await arrVisitor(
            value,
            {
                async forEachElement(validator) {
                    const promises: Promise<Issue[]>[] = [];
                    for (let i = 0; i < value.length; ++i) {
                        promises.push(validateValue(rootData, value[i], validator, path.withArrayIndex(i)));
                    }
                    const arrayIssues = await Promise.all(promises);
                    issues.push(...arrayIssues.flatMap(a => a));
                }
            }
        );
        if (arrayIssues) {
            pushIssues(arrayIssues);
        }
    }
    else if (typeof value === "object" && value !== null) {
        const objVisitor = keyVisitor as ObjValidator<typeof value, R>;
        objVisitor(value, {
            async visit(visitor) {
                const objIssues = await validateObject(rootData, value, visitor, path);
                issues.push(...objIssues);
            }
        });
    }
    else {
        const primitiveVisitor = keyVisitor as Validator<typeof value, R>;
        const issues = await primitiveVisitor(value, rootData);
        if (issues) {
            pushIssues(issues);
        }
    }
    return issues;
}