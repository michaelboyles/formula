import { array, number, object, string, } from "./FormSchemaElement";
import { FormSchema } from "./FormSchema";

function main() {
    const arrayOfArrayOfStr = array(array(string()));

    const obj = object({
        "a": string(),
        "b": arrayOfArrayOfStr
    });

    const schema = FormSchema.create()
        .with("a", string())
        .with("b", number())
        .with("c", arrayOfArrayOfStr)
        .with("d", obj);

    const a = schema.get("a");
    const b = schema.get("b");
    const c = schema.get("c");
    const d = schema.get("d");
}

main();
