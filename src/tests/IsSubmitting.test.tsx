import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../hooks/useForm.ts";
import { Input } from "../controls/Input.tsx";
import { IsSubmitting } from "../IsSubmitting.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("IsSubmitting", () => {
    it("updates without rerendering the parent", async () => {
        let formRenderCount = 0;
        function Test() {
            formRenderCount++;
            const form = useForm({
                initialValues: { name: "" },
                submit: () => new Promise(_ => {}) // never resolve
            })
            return (
                <form onSubmit={form.submit}>
                    <Input field={form("name")} data-testid="input" />
                    <IsSubmitting form={form}>
                        { (isSubmitting: boolean) => <button type="submit" disabled={isSubmitting} data-testid="submit">Submit</button> }
                    </IsSubmitting>
                </form>
            )
        }
        const { getByTestId } = render(<Test />);
        expect(formRenderCount).toBe(1);
        const input = getByTestId("input");
        await user.type(input, "michael");

        const submit = getByTestId("submit");
        expect(submit).not.toBeDisabled();

        await user.click(submit);
        expect(submit).toBeDisabled();
        expect(formRenderCount).toBe(1);
    })
});
