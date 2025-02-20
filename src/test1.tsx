import { useFormValue } from "./useFormValue";
import { Form, useForm, Visitor } from "./useForm";
import { useElements } from "./useElements";
import { ArrayField, FormField } from "./FormField";
import { Input } from "./Input";
import { Checkbox } from "./Checkbox";
import { useIsSubmitting } from "./useIsSubmitting";
import { allOf, maxLength, required } from "./validators";
import { useFormErrors } from "./useFormErrors";

type Category = {
    name: string,
    subcategories: Category[]
}

type FormValues = {
    title: string
    isPublic: true
    numLikes: number
    tags: string[]
    category: Category
    arrayOfArray: string[][]
}

export function Test1() {
    const form = useForm<FormValues, any>({
        getInitialValues: () => ({
            title: "My Blog Post",
            isPublic: true,
            numLikes: 10,
            tags: ["news", "something"],
            category: {
                name: "news",
                subcategories: [
                    { name: "latest", subcategories: [
                            { name: "name", subcategories: [] }
                    ] }
                ]
            },
            arrayOfArray: []
        }),
        async submit(data) {
            return new Promise((resolve, reject) => {
                setTimeout(() => reject("done" + JSON.stringify(data)), 1_000)
            })
        },
        onSuccess({ values, result }) {
            console.log("Submitted", values, result);
        },
        validate: {
            title: allOf(required, maxLength(3)),
            category: (_category, { visit }) => validateCategory(visit),
        }
    });

    const titleField = form.get("title");
    const title = useFormValue(titleField);
    const numLikes = useFormValue(form.get("numLikes"));
    const tagsField = form.get("tags");
    const tags = useFormValue(tagsField);
    const name = form.get("category").property("subcategories").element(0).property("name") as FormField<string>;
    const subcats = useElements(form.get("category").property("subcategories"));

    const value = useFormValue(name);
    const createdAtError = useFormErrors(name);

    return (
        <form onSubmit={form.submit}>
            <h1>Test 1</h1>

            <h1>{createdAtError}</h1>

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
                        { name: "sub 111", subcategories: [] },
                        { name: "sub 222", subcategories: [] }
                    ]
                },
                isPublic: true,
                numLikes: 1,
                arrayOfArray: [["a"]]
            })}>Set DATA</button>
            {
                tags.map((tag, idx) => <div key={idx}>{ tag } { tag.length }</div>)
            }

            { subcats.map((subcat, idx) =>
                <label key={idx}>Sub category name: <Input field={subcat.property("name")}/> </label>
            )}
            <label>Public? <Checkbox className="cb" field={form.get("isPublic")}/></label>
            <Tags field={form.get("tags")}/>

            <DisableSubmitButton form={form} />
        </form>
    )
}

function validateCategory(visit: (visitor: Visitor<Category>) => void) {
    visit({
        name(name) {
            if (name === "name") {
                return "BAD";
            }
        },
        subcategories(_subcategories, { forEachElement }) {
            forEachElement((_subcategory, { visit }) => {
                validateCategory(visit);
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