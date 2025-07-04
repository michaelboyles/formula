import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { Input } from "../Input.tsx";
import { useBlurred } from "../../hooks/useBlurred.ts";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("Input", () => {
    it("can be typed in without rerendering the parent", async () => {
        let formRenderCount = 0;
        function Test() {
            formRenderCount++;
            const form = useForm({
                initialValues: { title: "" }
            })
            return (
                <Input field={form("title")} data-testid="input" />
            )
        }

        const { getByTestId } = render(<Test />);
        const input = getByTestId("input");

        expect(input).toHaveValue("");
        await user.type(input, "My title");
        expect(input).toHaveValue("My title");
        expect(formRenderCount).toBe(1);
    })

    it("tracks blur status", async () => {
        function Test() {
            const form = useForm({
                initialValues: () => ({
                    title: ""
                }),
                submit: async () => "done"
            })

            const titleField = form("title");
            const wasBlurred = useBlurred(titleField);
            return (
                <form onSubmit={form.submit}>
                    <Input field={titleField} data-testid="input" />
                    { wasBlurred ? <div data-testid="blurred">blurred</div> : null }
                </form>
            )
        }

        const { getByTestId, queryByTestId } = render(<Test />);
        const input = getByTestId("input");
        await user.click(input);
        await user.tab();
        expect(queryByTestId("blurred")).toBeInTheDocument();
    })
});
