export type StringElement = {
    readonly type: "string"
}
export type NumberElement = {
    readonly type: "number"
}
export type ArrayElement<E extends FormSchemaElement> = {
    readonly type: "array"
    readonly item: E
}
export type ObjectElement<T extends ObjectSchema> = {
    readonly type: "object",
    readonly properties: T
}
export type LazyElement<T extends FormSchemaElement> = () => T;
export type FormSchemaElement = StringElement | NumberElement | ArrayElement<any> | ObjectElement<any> | LazyElement<any>;

export type SchemaElementSet = Record<string, FormSchemaElement>;

export type SchemaValue<T extends FormSchemaElement> =
    T extends () => infer Lazy ? (Lazy extends FormSchemaElement ? SchemaValue<Lazy> : never) :
        T extends StringElement ? string :
            T extends NumberElement ? number :
                T extends ObjectElement<infer Obj> ? { [K in keyof Obj]: SchemaValue<Obj[K]> }:
                    T extends ArrayElement<infer Arr> ? SchemaValue<Arr>[] : never;

export type ObjectSchema = Record<string, FormSchemaElement>;
export type SchemaValueForObject<T extends ObjectSchema> = { [K in keyof T]: SchemaValue<T[K]> };

export function string(): StringElement {
    return { type: "string" }
}

export function number(): NumberElement {
    return { type: "number" }
}

export function array<T extends FormSchemaElement>(items: T): ArrayElement<T> {
    return { type: "array", item: items }
}

export function object<T extends Record<string, FormSchemaElement>>(properties: T): ObjectElement<T> {
    return { type: "object", properties }
}