import { useFormValue } from "./useFormValue";
import { Form, useForm } from "./useForm";
import { useElements } from "./useElements";
import { ArrayField, FormField } from "./FormField";
import { Input } from "./Input";
import { Checkbox } from "./Checkbox";
import { useIsSubmitting } from "./useIsSubmitting";
import { allOf, maxLength, required } from "./validators";
import { useFormErrors } from "./useFormErrors";
import { IntegerInput } from "./IntegerInput";
import { Select } from "./Select";
import { Visitor } from "./validate";

type Category = {
    name: string,
    subcategories: Category[]
}

type Foo = "foo" | "bar";

type FormValues = {
    title: string
    isPublic: boolean
    numLikes: number | ""
    tags: string[]
    category: Category
    arrayOfArray: Foo[][]
    foo: Foo
}

export function Test1() {
    type FormValues = {
        value: number | null
        1: string | null
    }

    const form = useForm<FormValues, any>({
        initialValues: () => ({
            value: null,
            1: null
        }),
        submit: async () => "done",
        validate: {
            value(value) {
                if (value == null) return "Required1";
            },
            1(one) {
                if (one == null) return "Required2";
            }
        }
    });

    const errors = useFormErrors(form.get("value"));
    return (
        <>
            <form onSubmit={form.submit}>
                {
                    errors ? <div>{ errors.join(", ")} </div> : null
                }
                <input type="submit" value="Submit" data-testid="submit" />
            </form>
        </>
    )
}

function validateCategory(visit: (visitor: Visitor<Category>) => void) {
    visit({
        name(name) {
            if (name === "name") {
                return "BAD";
            }
        },
        subcategories(_subcategories, forEachElement) {
            forEachElement((_subcategory, visitSubcategory) => {
                validateCategory(visitSubcategory);
            })
        }
    })
}

function Tags(props: { field: ArrayField<string> }) {
    const elemns = useElements(props.field);
    return (
        <>
            <h2>Tags</h2>
            { elemns.map(((tag, idx) => <Tag key={idx} field={tag} />) )}
        </>
    );
}

function Tag(props: { field: FormField<string> }) {
    return (
        <div>Tag: <Input field={props.field} /></div>
    )
}

function DisableSubmitButton(props: { form: Form<any> }) {
    const isSubmitting = useIsSubmitting(props.form);
    return (
        <button type="submit" disabled={isSubmitting}>Submit</button>
    )
}