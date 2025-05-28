import { useForm } from "./hooks/useForm.ts";
import { useFieldErrors } from "./hooks/useFieldErrors.ts";

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

    const errors = useFieldErrors(form.get("value"));
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
