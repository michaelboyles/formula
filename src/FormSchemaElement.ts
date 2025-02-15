export type StringElement = {
    type: "string"
}
export type NumberElement = {
    type: "number"
}
export type ArrayElement<E extends FormSchemaElement> = {
    type: "array"
    item: E
}
export type ObjectElement<T extends Record<string, FormSchemaElement>> = {
    type: "object",
    properties: T
}
export type FormSchemaElement = StringElement | NumberElement | ArrayElement<any> | ObjectElement<any>;

export type SchemaElementSet = Record<string, FormSchemaElement>;

export type SchemaValue<T extends FormSchemaElement> =
    T extends StringElement ? string :
        T extends NumberElement ? number :
            T extends ObjectElement<infer O> ? { [K in keyof O]: SchemaValue<O[K]> }:
                T extends ArrayElement<infer A> ? SchemaValue<A>[] : never;