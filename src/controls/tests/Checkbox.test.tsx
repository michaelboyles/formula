import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../useForm";
import { useFieldErrors } from "../../useFieldErrors";
import { Checkbox } from "../Checkbox";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("Checkbox", () => {
    it("can be checked and unchecked", async () => {
        function Test() {
            const form = useForm({
                initialValues: {
                    isPublic: false
                },
                submit: () => "done"
            })
            const errors = useFieldErrors(form.get("isPublic"));

            return (
                <>
                    <form onSubmit={form.submit}>
                        <Checkbox field={form.get("isPublic")} data-testid="checkbox"/>
                        {
                            errors ? JSON.stringify(errors) : null
                        }
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const checkbox = getByTestId("checkbox");

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
        await user.click(checkbox);
        expect(checkbox).not.toBeChecked();
    })
});
