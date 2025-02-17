import { useField } from "./useField";
import { useForm } from "./useForm";
import { useElements } from "./useElements";
import { ArrayField, StringField } from "./FormField";
import { array, boolean, number, object, string, StringElement } from "./FormSchemaElement";
import { Input } from "./Input";
import { FormSchema } from "./FormSchema";
import { Checkbox } from "./Checkbox";

const category = object({
    name: string(),
    subcategories: () => array(category)
});

const schema = new FormSchema({})
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
        })
    });

    const { value: title, setValue: setTitle } = useField(form.get("title"));
    const { value: numLikes } = useField(form.get("numLikes"));
    const { value: tags, setValue: setTags } = useField(form.get("tags"));
    const createdAt = form.get("category").property("subcategories").element(0).property("name");

    const { value } = useField(createdAt);

    return (
        <form onSubmit={e => {
            e.preventDefault();
            console.log(form.getData())
        }}>
            <h1>Test 1</h1>
            Title { title }
            Num Likes { numLikes }
            Value { value }

            <Input field={form.get("title")} />
            <button onClick={() => setTitle("New title")}>Set Title</button>
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
            <label>Public? <Checkbox field={form.get("isPublic")}/></label>
            <Tags field={form.get("tags")}/>

            <button type="submit">Submit</button>
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