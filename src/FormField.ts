import { Form } from "./useForm";
import {
    ArrayElement,
    FormSchemaElement,
    NumberElement,
    ObjectElement,
    ObjectSchema,
    SchemaElementSet,
    SchemaValue,
    SchemaValueForObject,
    StringElement
} from "./FormSchemaElement";
import { FieldPath } from "./FieldPath";
import { Subscriber } from "./SubscriberSet";

export class StringField {
    path: FieldPath
    form: Form<any> | undefined

    constructor(path: FieldPath) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): string {
        return this.form!.getValue(this.path);
    }

    setValue(value: string) {
        return this.form!.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form!.subscribe(this.path, subscriber);
    }
}
export class NumberField {
    path: FieldPath
    form: Form<any> | undefined

    constructor(path: FieldPath) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): number {
        return this.form!.getValue(this.path);
    }

    setValue(value: string) {
        return this.form!.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form!.subscribe(this.path, subscriber);
    }
}
export class ObjectField<T extends ObjectSchema> {
    path: FieldPath
    form: Form<any> | undefined

    constructor(path: FieldPath) {
        this.path = path;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): SchemaValueForObject<T> {
        return this.form!.getValue(this.path);
    }

    setValue(value: SchemaValueForObject<T>) {
        return this.form!.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form!.subscribe(this.path, subscriber);
    }
}

type ArrayElemFactory<E> = (idx: number) => E;
export class ArrayField<E extends FormSchemaElement> {
    path: FieldPath
    form: Form<any> | undefined
    elementFactory: ArrayElemFactory<FieldFromElement<E>>

    constructor(path: FieldPath, elementFactory: ArrayElemFactory<FieldFromElement<E>>) {
        this.path = path;
        this.elementFactory = elementFactory;
    }

    setForm(form: Form<any>) {
        this.form = form;
    }

    getValue(): SchemaValue<E>[] {
        return this.form!.getValue(this.path);
    }

    setValue(value: SchemaValue<E>[]) {
        return this.form!.setValue(this.path, value);
    }

    subscribe(subscriber: Subscriber) {
        return this.form!.subscribe(this.path, subscriber);
    }

    element(idx: number): FieldFromElement<E> {
        const field = this.elementFactory(idx);
        field.setForm(this.form!);
        return field;
    }
}
export type FormField = StringField | NumberField | ObjectField<any> | ArrayField<any>;

export type FieldSetFromElementSet<T extends SchemaElementSet> = {
    [K in keyof T]: FieldFromElement<T[K]>
}

export type FieldFromElement<T extends FormSchemaElement> = T extends StringElement ? StringField :
    T extends NumberElement ? NumberField :
        T extends ObjectElement<infer O> ? ObjectField<O> :
            T extends ArrayElement<infer A> ? ArrayField<A> : never;