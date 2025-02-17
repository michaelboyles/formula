import { FormSchema } from "./lib";
import { useField } from "./useField";
import { useForm } from "./useForm";
import { useState } from "react";
import { useElements } from "./useElements";
import { ArrayField, StringField } from "./FormField";
import { StringElement } from "./FormSchemaElement";
import { Input } from "./Input";

const schema = new FormSchema({})
    .withString("title")
    .withNumber("numLikes")
    .withArray("tags", { type: "array", item: { type: "string" } })
    .withObject("meta", { type: "object", properties: {
        createdAt: { type: "string" },
    }})

export function Test1() {
    const form = useForm({
        schema,
        getInitialValues: () => ({
            title: "My Blog Post",
            numLikes: 10,
            tags: ["news", "something"],
            meta: {
                createdAt: ""
            }
        })
    });
    const [a, setA] = useState(1)

    const { value: title, setValue: setTitle } = useField(form.get("title"));
    const { value: numLikes } = useField(form.get("numLikes"));
    const { value: tags, setValue: setTags } = useField(form.get("tags"));
    const { value: meta, setValue: setMeta } = useField(form.get("meta"));

    return (
        <div>
            <h1>Test 1</h1>
            Title { title }
            Num Likes { numLikes }
            <pre>{ JSON.stringify(meta) }</pre>

            <Input field={form.get("title")} />
            <button onClick={() => setTitle("New title")}>Set Title</button>
            <button onClick={() => setMeta({ createdAt: "boo" })}>Update meta</button>
            <button onClick={() => setTags(["test"])}>Set tags</button>
            {
                tags.map((tag, idx) => <div key={idx}>{ tag } { tag.length }</div>)
            }

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