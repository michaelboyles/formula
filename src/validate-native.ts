import { FieldPath } from "./FieldPath.ts";
import {
    type ArrayValidator,
    isLazy,
    type Issue,
    type ObjectValidator,
    type Supplier,
    type Validator,
    type ValueValidator
} from "./validate.ts";

export async function validateRecursive<T, R>(rootData: R, value: T, validator: Validator<T, R>, path: FieldPath): Promise<Issue[]> {
    if (!validator) return [];

    const issues: Promise<Issue[]>[] = [];

    if (typeof validator === "function" && !isLazy(validator)) {
        const primitiveValidator = validator as ValueValidator<any, any>;
        issues.push(
            runValidator(path, async () => await primitiveValidator(value, rootData))
        );
    }
    else if (Array.isArray(value) && typeof validator === "object") {
        const arrValidator = resolve(validator as ArrayValidator<any, any>);

        const selfValidator = arrValidator._self;
        if (selfValidator) {
            issues.push(
                runValidator(path, async () => await selfValidator(value, rootData))
            )
        }

        const eachValidator = arrValidator._each;
        if (eachValidator) {
            for (let i = 0; i < value.length; i++) {
                const item = value[i];
                issues.push(validateRecursive(rootData, item, eachValidator, path.withArrayIndex(i)));
            }
        }
    }
    else if (typeof value === "object" && value !== null) {
        const objValidator = resolve(validator as Supplier<ObjectValidator<T, R>>);

        const selfValidator = objValidator._self;
        if (selfValidator && typeof selfValidator === "function") {
            issues.push(
                runValidator(path, async () => await selfValidator(value, rootData))
            );
        }

        for (const [key, keyValidator] of Object.entries(objValidator)) {
            if (key === "_self") continue;
            const fieldValue = (value as any)[key];
            issues.push(
                validateRecursive(rootData, fieldValue, keyValidator, path.withProperty(key))
            );
        }
    }
    return Promise.all(issues).then(res => res.flatMap(it => it));
}

type ValidatorReturn = ReturnType<ValueValidator<any, any>>
async function runValidator(path: FieldPath, func: () => ValidatorReturn): Promise<Issue[]> {
    const messages = await new Promise<Awaited<ValidatorReturn>>(async (resolve) => resolve(func()));
    return mapToIssues(path, messages);
}

function mapToIssues(path: FieldPath, msgs: string | string[] | undefined | null | void): Issue[] {
    if (!msgs) return [];
    if (typeof msgs === "string") {
        return [{ path, message: msgs }];
    }
    return msgs.map(message => ({ path, message }));
}

function resolve<T>(supplier: Supplier<T>): T {
    if (isLazy(supplier)) {
        return supplier();
    }
    return supplier;
}
