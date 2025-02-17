import { FormSchemaElement } from "./FormSchemaElement";

export class FormSchema<T extends Record<string, FormSchemaElement>> {
    readonly elements: T

    constructor(elements: T) {
        this.elements = elements
    }

    static create(): FormSchema<{}> {
        return new FormSchema({});
    }

    with<K extends string, F extends FormSchemaElement>(key: K, field: F): FormSchema<T & Record<K, F>> {
        if (this.elements[key]) {
            throw new Error("Trying to re-specify schema element with name " + key);
        }
        return Object.freeze(
            new FormSchema(Object.freeze({ ...this.elements, [key]: field }))
        );
    }

    get<K extends keyof T>(a: K): T[K] {
        return this.elements[a];
    }
}