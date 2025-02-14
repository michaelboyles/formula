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