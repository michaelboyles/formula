import { FieldPath } from "./FieldPath.ts";

export type Issue = {
    path: FieldPath
    message: string
}

export type Validator<T, AllValues = unknown> =
    [T] extends [Array<infer U>] ? Supplier<ArrayValidator<U, AllValues>> :
        [T] extends [object] ? Supplier<ObjectValidator<T, AllValues>> :
            ValueValidator<T, AllValues>;

// Validates a single value. Usually a primitive, but can be used for objects and arrays via _self
export type ValueValidator<T, AllValues> = (value: T, values: AllValues) => ValidatorReturn;

export type ObjectValidator<T, AllValues = unknown> = ({
    _self?: ValueValidator<T, AllValues>;
} & {
    [K in keyof T]?: Validator<T[K], AllValues>;
});

export type ArrayValidator<T, AllValues = unknown> = {
    _self?: ValueValidator<T[], AllValues>;
    _each?: Validator<T, AllValues>;
};

type ValidatorReturn = string | string[] | undefined | null | Promise<string | string[] | undefined | null>;

const LAZY_SYMBOL = Symbol("lazyValidator");

export type Supplier<T> = T | Lazy<T>;

export type Lazy<T> = (() => T) & { [LAZY_SYMBOL]: true };

export function lazy<T>(fn: () => T): Lazy<T> {
    const newFn = fn as Lazy<T>;
    newFn[LAZY_SYMBOL] = true;
    return newFn;
}

export function isLazy<T>(value: unknown): value is Supplier<T> {
    return typeof value === "function" && (value as any)[LAZY_SYMBOL] === true;
}

