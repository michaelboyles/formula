import { FormSchema } from "./lib";
import { useField } from "./useField";
import { useForm } from "./useForm";
import { useState } from "react";

const schema = new FormSchema({})
    .withString("title", { type: "string" })
    .withNumber("numLikes", { type: "number" })
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

    const { value: title, setValue: setTitle, Input: TitleInput } = useField(form.get("title"));
    const { value: numLikes } = useField(form.get("numLikes"));

    return (
        <div>
            <h1>Test 1</h1>
            Title { title }
            Num Likes { numLikes }

            <TitleInput />
            <button onClick={() => setTitle("New title")}>Set Title</button>
            <button onClick={() => setA(prev => prev + 1)}>Update { a }</button>
        </div>
    )
}