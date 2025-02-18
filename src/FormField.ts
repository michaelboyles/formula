import { FormAccess } from "./useForm";
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
import { Subscriber, Unsubscribe } from "./SubscriberSet";

export class FormField<Value = any> {
    protected readonly path: FieldPath
    protected form: FormAccess | undefined

    constructor(path: FieldPath) {
        this.path = path;
    }

    getValue(): Value {
        return this.getFormAccess().getValue(this.path);
    }

    setValue(value: Value) {
        return this.getFormAccess().setValue(this.path, value);
    }

    setFormAccess(form: FormAccess) {
        this.form = form;
    }

    subscribe(subscriber: Subscriber): Unsubscribe {
        return this.getFormAccess().subscribe(this.path, subscriber);
    }

    protected getFormAccess(): FormAccess {
        const form = this.form;
        if (!form) {
            throw new Error("Form is not set for field " + this.path.toString());
        }
        return form;
    }
}

export class StringField extends FormField<string> {
    constructor(path: FieldPath) {
        super(path);
    }
}
export class NumberField extends FormField<number> {
    constructor(path: FieldPath) {
        super(path);
    }
}
export class BooleanField extends FormField<boolean> {
    constructor(path: FieldPath) {
        super(path);
    }
}

type ObjectPropertyFactories<T extends ObjectSchema> = { [K in keyof T]: () => FieldFromElement<T[K]> };
export class ObjectField<T extends ObjectSchema> extends FormField<SchemaValueForObject<T>>{
    private readonly keyToFactory: ObjectPropertyFactories<T>

    constructor(path: FieldPath, keyToFactory: ObjectPropertyFactories<T>) {
        super(path);
        this.keyToFactory = keyToFactory;
    }

    property<K extends keyof T>(key: K): FieldFromElement<T[K]> {
        const factory = this.keyToFactory[key];
        if (!factory) {
            const attemptedPath = this.path.withProperty(key as string);
            throw new Error("No such key " + attemptedPath.toString());
        }
        const element = factory();
        element.setFormAccess(this.getFormAccess());
        return element;
    }
}

type ArrayElemFactory<E> = (idx: number) => E;
export class ArrayField<E extends FormSchemaElement> extends FormField<SchemaValue<E>[]> {
    private readonly elementFactory: ArrayElemFactory<FieldFromElement<E>>

    constructor(path: FieldPath, elementFactory: ArrayElemFactory<FieldFromElement<E>>) {
        super(path);
        this.elementFactory = elementFactory;
    }

    element(idx: number): FieldFromElement<E> {
        const field = this.elementFactory(idx);
        field.setFormAccess(this.getFormAccess());
        return field;
    }
}

export type FieldSet = Record<string, FormField>;

export type FieldSetFromElementSet<T extends SchemaElementSet> = {
    [K in keyof T]: FieldFromElement<T[K]>
}

export type FieldFromElement<T extends FormSchemaElement> =
    T extends () => infer Lazy ? (Lazy extends FormSchemaElement ? FieldFromElement<Lazy> : never) :
        T extends StringElement ? StringField :
            T extends NumberElement ? NumberField :
                T extends ObjectElement<infer Obj> ? ObjectField<Obj> :
                    T extends ArrayElement<infer Arr> ? ArrayField<Arr> : never;