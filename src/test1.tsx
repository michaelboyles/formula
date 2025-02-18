import { useFormValue } from "./useFormValue";
import { Form, useForm } from "./useForm";
import { useElements } from "./useElements";
import { ArrayField, StringField } from "./FormField";
import { array, boolean, number, object, string, StringElement } from "./FormSchemaElement";
import { Input } from "./Input";
import { FormSchema } from "./FormSchema";
import { Checkbox } from "./Checkbox";
import { useIsSubmitting } from "./useIsSubmitting";

const category = object({
    name: string(),
    subcategories: () => array(category)
});

const schema = FormSchema.create()
    .with("title", string())
    .with("isPublic", boolean())
    .with("numLikes", number())
    .with("tags", array(string()))
    .with("category", category);

export function Test1() {
    const form = useForm({
        schema,
        getInitialValues: () => ({
            title: "My Blog Post",
            isPublic: true,
            numLikes: 10,
            tags: ["news", "something"],
            category: {
                name: "news",
                subcategories: [
                    { name: "latest", subcategories: [] }
                ]
            }
        }),
        async submit(data) {
            return new Promise((resolve, reject) => {
                setTimeout(() => reject("done" + JSON.stringify(data)), 1_000)
            })
        },
        onSuccess(result) {
            console.log("Submitted", result);
        }
    });

    const titleField = form.get("title");
    const title = useFormValue(titleField);
    const numLikes = useFormValue(form.get("numLikes"));
    const tagsField = form.get("tags");
    const tags = useFormValue(tagsField);
    const createdAt = form.get("category").property("subcategories").element(0).property("name");

    const value = useFormValue(createdAt);

    return (
        <form onSubmit={form.submit}>
            <h1>Test 1</h1>
            Title { title }
            Num Likes { numLikes }
            Value { value }

            <Input field={form.get("title")} placeholder="Title" />
            <button onClick={() => titleField.setValue("New title")}>Set Title</button>
            <button type="button" onClick={() => form.setData({
                title: "newT",
                tags: [],
                category: {
                    name: "a",
                    subcategories: [
                        { name: "sub 222", subcategories: [] }
                    ]
                },
                isPublic: true,
                numLikes: 1
            })}>Set DATA</button>
            {
                tags.map((tag, idx) => <div key={idx}>{ tag } { tag.length }</div>)
            }

            <label>Created at <Input field={createdAt} /></label>
            <label>Public? <Checkbox className="cb" field={form.get("isPublic")}/></label>
            <Tags field={form.get("tags")}/>

            <DisableSubmitButton form={form} />
        </form>
    )
}

function Tags(props: { field: ArrayField<StringElement> }) {
    const elemns = useElements(props.field);
    return (
        <>
            <h2>Tags</h2>
            { elemns.map(((tag, idx) => <Tag key={idx} field={tag} />) )}
        </>
    );
}

function Tag(props: { field: StringField }) {
    return (
        <div>Tag: <Input field={props.field} /></div>
    )
}

function DisableSubmitButton(props: { form: Form<any, any> }) {
    const isSubmitting = useIsSubmitting(props.form);
    return (
        <button type="submit" disabled={isSubmitting}>Submit</button>
    )
}