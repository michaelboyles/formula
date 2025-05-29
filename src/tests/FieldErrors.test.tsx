import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../hooks/useForm.ts";
import { FieldErrors } from "../FieldErrors.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("FieldErrors", () => {
    it("updates without rerendering the parent", async () => {
        let formRenderCount = 0;
        function Test() {
            formRenderCount++;
            const form = useForm({
                initialValues: { name: "" },
                submit: () => "ok",
                validate: {
                    name(name) {
                        if (name.length < 1) return "Required";
                    }
                }
            })
            return (
                <form onSubmit={form.submit}>
                    <button type="submit" data-testid="submit">Submit</button>
                    <FieldErrors field={form("name")}>
                        { errors => errors ? errors.join(", ") : null }
                    </FieldErrors>
                </form>
            )
        }
        const { getByTestId, queryByText } = render(<Test />);
        expect(queryByText("Required")).not.toBeInTheDocument();

        const submit = getByTestId("submit");
        await user.click(submit);

        expect(queryByText("Required")).toBeInTheDocument();
        expect(formRenderCount).toBe(1);
    })
});
