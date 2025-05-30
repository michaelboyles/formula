import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { SubmissionError } from "../SubmissionError.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("SubmissionError", () => {
    it("updates without rerendering the parent", async () => {
        let formRenderCount = 0;
        function Test() {
            formRenderCount++;
            const form = useForm({
                initialValues: { name: "michael" },
                submit: () => {
                    throw "failed";
                }
            })
            return (
                <form onSubmit={form.submit}>
                    <button type="submit" data-testid="submit">Submit</button>
                    <SubmissionError form={form}>
                        { error => error ? `Error: ${String(error.cause)}` : null }
                    </SubmissionError>
                </form>
            )
        }
        const { getByTestId, queryByText } = render(<Test />);

        const submit = getByTestId("submit");
        expect(queryByText("Error:")).not.toBeInTheDocument();

        await user.click(submit);
        expect(queryByText("Error: failed")).toBeInTheDocument();
        expect(formRenderCount).toBe(1);
    })
});
