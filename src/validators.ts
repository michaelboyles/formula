export type ValidatorReturn = string | string[] | undefined | null | void | Promise<string | string[] | undefined | null | void>;
export type Validator<Value, FormValues> = (value: Value, values: FormValues) => ValidatorReturn;

export const required: Validator<string, any> = value => {
    if (!value.length) return "Required";
}

export function minLength(minLength: number): Validator<string, any> {
    return value => {
        if (value.length < minLength) return "Min length is " + 12;
    }
}

export function maxLength(max: number): Validator<string, any> {
    return value => {
        if (value.length > max) return "Max length is " + max;
    }
}

export function allOf<T, D>(...validators: Validator<T, D>[]): Validator<T, D> {
    return (value, values) => {
        const errors = [];
        for (const validator of validators) {
            const errorOrErrors = validator(value, values);
            if (errorOrErrors) {
                if (Array.isArray(errorOrErrors)) {
                    for (const error of errorOrErrors) {
                        errors.push(error);
                    }
                }
                else if (typeof errorOrErrors === "string") {
                    errors.push(errorOrErrors);
                }
            }
        }
        return errors;
    }
}