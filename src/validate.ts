import { FieldPath } from "./FieldPath";

export type Issue = {
    path: FieldPath
    message: string
}

export type ArrayValidator<Element, FormValues> = (value: Element[], a: { forEachElement: (validator: FieldVisitor<Element, FormValues>) => void }) => ValidatorReturn;
export type ObjValidator<Value, FormValues> = (value: Value, a: { visit: (visitor: Visitor<Value>) => void }) => ValidatorReturn;

export type FieldVisitor<T, D> =
    T extends string | number | boolean ? Validator<T, D> :
        T extends Array<infer A> ? ArrayValidator<A, D> :
            T extends object ? ObjValidator<T, D> : never;

export type Visitor<T> = {
    [K in keyof T]?: FieldVisitor<T[K], T>
}

export type ValidatorReturn = string | string[] | undefined | null | void | Promise<string | string[] | undefined | null | void>;
export type Validator<Value, FormValues> = (value: Value, values: FormValues) => ValidatorReturn;