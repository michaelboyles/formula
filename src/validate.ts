import { FieldPath } from "./FieldPath";

export type Issue = {
    path: FieldPath
    message: string
}

export type ForEachElement<Element, FormValues> = (validator: FieldVisitor<Element, FormValues>) => void;
export type ArrayValidator<Element, FormValues> = (value: Element[], forEachElement: ForEachElement<Element, FormValues>) => ValidatorReturn;

export type VisitObjectKeys<Object> = (visitor: Visitor<Object>) => void;
export type ObjValidator<Object> = (object: Object, visit: VisitObjectKeys<Object>) => ValidatorReturn;

export type FieldVisitor<T, D> =
    [T] extends [string | number | boolean] ? Validator<T, D> :
        [T] extends [Array<infer A>] ? ArrayValidator<A, D> :
            [T] extends [object] ? ObjValidator<T> : never;

export type Visitor<T> = {
    [K in keyof T]?: FieldVisitor<T[K], T>
}

export type ValidatorReturn = string | string[] | undefined | null | void | Promise<string | string[] | undefined | null | void>;
export type Validator<Value, FormValues> = (value: Value, values: FormValues) => ValidatorReturn;