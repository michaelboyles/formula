import { FormSchema } from "./lib";
import { useField } from "./useField";
import { useForm } from "./useForm";
import { useState } from "react";
import { useElements } from "./useElements";
import { ArrayField, StringField } from "./FormField";
import { array, object, string, StringElement } from "./FormSchemaElement";
import { Input } from "./Input";

const category = object({
    name: string(),
    subcategories: () => array(category)
});

const schema = new FormSchema({})
    .withString("title")
    .withNumber("numLikes")
    .withArray("tags", array(string()))
    .withObject("category", category);

export function Test1() {
    const form = useForm({
        schema,
        getInitialValues: () => ({
            title: "My Blog Post",
            numLikes: 10,
            tags: ["news", "something"],
            category: {
                name: "news",
                subcategories: [
                    { name: "latest", subcategories: [] }
                ]
            }
        })
    });
    const [a, setA] = useState(1)

    const { value: title, setValue: setTitle } = useField(form.get("title"));
    const { value: numLikes } = useField(form.get("numLikes"));
    const { value: tags, setValue: setTags } = useField(form.get("tags"));
    const createdAt = form.get("category").property("subcategories").element(0).property("name");

    const { value } = useField(createdAt);

    return (
        <div>
            <h1>Test 1</h1>
            Title { title }
            Num Likes { numLikes }
            Value { value }

            <Input field={form.get("title")} />
            <button onClick={() => setTitle("New title")}>Set Title</button>
            <button onClick={() => setTags(["test"])}>Set tags</button>
            {
                tags.map((tag, idx) => <div key={idx}>{ tag } { tag.length }</div>)
            }

            <label>Created at <Input field={createdAt} /></label>
            <Tags field={form.get("tags")} />
        </div>
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