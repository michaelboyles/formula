import { Form } from "./useForm";

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

export type Test<T> = {
    [K in keyof T]:
    T[K] extends StringElement ? StringField :
        T[K] extends NumberElement ? NumberField :
            T[K] extends ObjectElement<infer O> ? ObjectField<O> :
                T[K] extends ArrayElement<infer A> ? ArrayField<A> : never
}

export class FormSchema<T extends Record<string, FormSchemaElement>> {
    elements: T

    constructor(elements: T) {
        this.elements = elements
    }

    withString<K extends string>(key: K, elem: StringElement): FormSchema<T & Record<K, StringElement>> {
        // @ts-ignore
        return new FormSchema({ ...this.elements, [key]: elem });
    }

    withNumber<K extends string>(key: K, elem: NumberElement): FormSchema<T & Record<K, NumberElement>> {
        // @ts-ignore
        return new FormSchema({ ...this.elements, [key]: elem });
    }

    withArray<K extends string, E extends FormSchemaElement>(key: K, elem: ArrayElement<E>): FormSchema<T & Record<K, ArrayElement<E>>> {
        // @ts-ignore
        return new FormSchema({ ...this.elements, [key]: elem });
    }

    withObject<K extends string, O extends Record<string, FormSchemaElement>>(key: K, elem: ObjectElement<O>): FormSchema<T & Record<K, ObjectElement<O>>> {
        // @ts-ignore
        return new FormSchema({ ...this.elements, [key]: elem });
    }

    get<K extends keyof T>(a: K): T[K] {
        return this.elements[a];
    }
}

export class StringField {
    path: string
    form: Form<any>

    constructor(path: string) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): string {
        return this.form.getValue(this.path);
    }
}
export class NumberField {
    setForm(form: Form<any>) {
    }
}
export class ObjectField<T> {
    setForm(form: Form<any>) {
    }
}
export class ArrayField<E> {
    setForm(form: Form<any>) {
    }
}
export type Field = StringField | NumberField | ObjectField<any> | ArrayField<any>;


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
