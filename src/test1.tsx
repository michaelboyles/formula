import { FormSchema } from "./lib";
import { useField } from "./useField";
import { useForm } from "./useForm";

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
    const { value: title } = useField(form.get("title"));
    const { value: numLikes } = useField(form.get("numLikes"));

    return (
        <div>
            <h1>Test 1</h1>
            Title { title }
            Num Likes { numLikes }
        </div>
    )
}