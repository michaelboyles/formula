import { FieldPath } from "./FieldPath.ts";
import {
    Validator,
    ObjectValidator,
    Issue,
    ArrayValidator,
    ValueValidator,
    isLazy,
    Supplier
} from "./validate.ts";

export async function validateRecursive<T, R>(rootData: R, value: T, validator: Validator<T, R>, path: FieldPath): Promise<Issue[]> {
    if (!validator) return [];

    const issues: Issue[] = [];

    const pushIssues = (msgs: string | string[] | undefined | null | void) => {
        if (!msgs) return;
        if (typeof msgs === "string") {
            issues.push({ path, message: msgs });
        }
        else {
            for (const message of msgs) {
                issues.push({ path, message });
            }
        }
    }

    if (typeof validator === "function" && !isLazy(validator)) {
        const primitiveValidator = validator as ValueValidator<any, any>;
        pushIssues(await primitiveValidator(value, rootData));
    }
    else if (Array.isArray(value) && typeof validator === "object") {
        const arrValidator = resolve(validator as ArrayValidator<any, any>);

        if (arrValidator._self) {
            pushIssues(await arrValidator._self(value, rootData));
        }

        if (arrValidator._each) {
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                const itemIssues = await validateRecursive(rootData, item, arrValidator._each, path.withArrayIndex(i));
                issues.push(...itemIssues);
            }
        }
    }
    else if (typeof value === "object" && value !== null) {
        const objValidator = resolve(validator as Supplier<ObjectValidator<T, R>>);
        const promises: Promise<Issue[]>[] = [];
        if (objValidator._self && typeof objValidator._self === "function") {
            const issues = await objValidator._self(value, rootData);
            pushIssues(issues);
        }

        for (const [key, keyValidator] of Object.entries(objValidator)) {
            if (key === "_self") continue;
            const fieldValue = (value as any)[key];
            promises.push(validateRecursive(rootData, fieldValue, keyValidator, path.withProperty(key)));
        }
        const keyIssues = (await Promise.all(promises)).flatMap(a => a);
        if (keyIssues.length) {
            issues.push(...keyIssues);
        }
    }
    return issues;
}

function resolve<T>(supplier: Supplier<T>): T {
    if (isLazy(supplier)) {
        return supplier();
    }
    return supplier;
}
