import { FormSchema } from "./lib";
import { useField } from "./useField";
import { useForm } from "./useForm";
import { useState } from "react";
import { useElements } from "./useElements";
import { ArrayField, StringField } from "./FormField";
import { StringElement } from "./FormSchemaElement";
import { useInput } from "./useInput";

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

    const TitleInput = useInput(form.get("title"));
    return (
        <div>
            <h1>Test 1</h1>
            Title { title }
            Num Likes { numLikes }

            <TitleInput />
            <button onClick={() => setTitle("New title")}>Set Title</button>
            <button onClick={() => setA(prev => prev + 1)}>Update { a }</button>
            <button onClick={() => setTags(["test"])}>Set tags</button>
            {
                tags.map(tag => <div>{ tag } { tag.length }</div>)
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
            { elemns.map(((e, idx) => <Tag key={idx} a={e} />) )}
        </>
    );
}

function Tag(props: { a: StringField }) {
    const TagInput = useInput(props.a);
    return (
        <div>Tag: <TagInput /></div>
    )
}