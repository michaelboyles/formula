import { ValueValidator } from "./validate.ts";

export const required: ValueValidator<string, any> = value => {
    if (!value.length) return "Required";
}

export function minLength(minLength: number): ValueValidator<string, any> {
    return value => {
        if (value.length < minLength) return "Min length is " + 12;
    }
}

export function maxLength(max: number): ValueValidator<string, any> {
    return value => {
        if (value.length > max) return "Max length is " + max;
    }
}

export function allOf<T, D>(...validators: ValueValidator<T, D>[]): ValueValidator<T, D> {
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
