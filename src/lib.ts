import { ArrayElement, FormSchemaElement, NumberElement, ObjectElement, StringElement } from "./FormSchemaElement";

export class FormSchema<T extends Record<string, FormSchemaElement>> {
    elements: T

    constructor(elements: T) {
        this.elements = elements
    }

    withString<K extends string>(key: K, elem: StringElement): FormSchema<T & Record<K, StringElement>> {
        if (this.elements[key]) {
            throw new Error("Trying to re-specify schema element with name " + key);
        }
        return new FormSchema({ ...this.elements, [key]: elem });
    }

    withNumber<K extends string>(key: K, elem: NumberElement): FormSchema<T & Record<K, NumberElement>> {
        if (this.elements[key]) {
            throw new Error("Trying to re-specify schema element with name " + key);
        }
        return new FormSchema({ ...this.elements, [key]: elem });
    }

    withArray<K extends string, E extends FormSchemaElement>(key: K, elem: ArrayElement<E>): FormSchema<T & Record<K, ArrayElement<E>>> {
        if (this.elements[key]) {
            throw new Error("Trying to re-specify schema element with name " + key);
        }
        return new FormSchema({ ...this.elements, [key]: elem });
    }

    withObject<K extends string, O extends Record<string, FormSchemaElement>>(key: K, elem: ObjectElement<O>): FormSchema<T & Record<K, ObjectElement<O>>> {
        if (this.elements[key]) {
            throw new Error("Trying to re-specify schema element with name " + key);
        }
        return new FormSchema({ ...this.elements, [key]: elem });
    }

    get<K extends keyof T>(a: K): T[K] {
        return this.elements[a];
    }
}

function main() {
    const strType: StringElement = { type: "string" };
    const arrayOfStr: ArrayElement<StringElement> = {
        type: "array", item: strType,
    }
    const arrayOfArrayOfStr: ArrayElement<typeof arrayOfStr> = {
        type: "array", item: arrayOfStr
    }

    const obj: ObjectElement<{ "a": typeof strType, "b": typeof arrayOfArrayOfStr} > = {
        type: "object", properties: {
            "a": strType,
            "b": arrayOfArrayOfStr
        }
    }

    const schema = new FormSchema({})
        .withString("a", { type: "string" })
        .withNumber("b", { type: "number" })
        .withArray("c", arrayOfArrayOfStr)
        .withObject("d", obj);

    const a = schema.get("a");
    const b = schema.get("b");
    const c = schema.get("c");
    const d = schema.get("d");
}

main();
