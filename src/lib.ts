import { array, FormSchemaElement, number, object, string, } from "./FormSchemaElement";

export class FormSchema<T extends Record<string, FormSchemaElement>> {
    elements: T

    constructor(elements: T) {
        this.elements = elements
    }

    with<K extends string, F extends FormSchemaElement>(key: K, field: F): FormSchema<T & Record<K, F>> {
        if (this.elements[key]) {
            throw new Error("Trying to re-specify schema element with name " + key);
        }
        return new FormSchema({ ...this.elements, [key]: field });
    }

    get<K extends keyof T>(a: K): T[K] {
        return this.elements[a];
    }
}

function main() {
    const arrayOfArrayOfStr = array(array(string()));

    const obj = object({
        "a": string(),
        "b": arrayOfArrayOfStr
    });

    const schema = new FormSchema({})
        .with("a", string())
        .with("b", number())
        .with("c", arrayOfArrayOfStr)
        .with("d", obj);

    const a = schema.get("a");
    const b = schema.get("b");
    const c = schema.get("c");
    const d = schema.get("d");
}

main();
