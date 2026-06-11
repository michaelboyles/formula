import { FieldPath } from "./FieldPath.ts";
import {
    type ArrayValidator,
    isLazy,
    type ObjectValidator,
    type Supplier,
    type Validator,
    type ValueValidator
} from "./validate.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";

type Issue = StandardSchemaV1.Issue;

export async function validateRecursive<T, R>(rootData: R, data: T, validator: Validator<T, R>, path: FieldPath): Promise<Issue[]> {
    if (!validator) return [];

    const issues: Promise<Issue[]>[] = [];

    if (typeof validator === "function" && !isLazy(validator)) {
        const primitiveValidator = validator as ValueValidator<any, any>;
        issues.push(
            runValidator(path, async () => await primitiveValidator(data, rootData))
        );
    }
    else if (Array.isArray(data) && typeof validator === "object") {
        const arrValidator = resolve(validator as ArrayValidator<any, any>);

        const selfValidator = arrValidator._self;
        if (selfValidator) {
            issues.push(
                runValidator(path, async () => await selfValidator(data, rootData))
            )
        }

        const eachValidator = arrValidator._each;
        if (eachValidator) {
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                issues.push(validateRecursive(rootData, item, eachValidator, path.withProperty(i)));
            }
        }
    }
    else if (typeof data === "object" && data !== null) {
        const objValidator = resolve(validator as Supplier<ObjectValidator<T, R>>);

        const selfValidator = objValidator._self;
        if (selfValidator && typeof selfValidator === "function") {
            issues.push(
                runValidator(path, async () => await selfValidator(data, rootData))
            );
        }

        for (const [key, keyValidator] of Object.entries(objValidator)) {
            if (key === "_self") continue;
            const fieldData = (data as any)[key];
            issues.push(
                validateRecursive(rootData, fieldData, keyValidator, path.withProperty(key))
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
        return [{ path: path.toStdSchema(), message: msgs }];
    }
    return msgs.map(message => ({ path: path.toStdSchema(), message }));
}

function resolve<T>(supplier: Supplier<T>): T {
    if (isLazy(supplier)) {
        return supplier();
    }
    return supplier;
}
