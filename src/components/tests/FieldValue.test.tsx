import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { Input } from "../../controls/Input.tsx";
import { FieldValue } from "../FieldValue.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("FieldValue", () => {
    it("updates without rerendering the parent", async () => {
        let formRenderCount = 0;
        function Test() {
            formRenderCount++;
            const form = useForm({
                initialValues: { name: "" },
                submit: () => "ok"
            })
            return (
                <form onSubmit={form.submit}>
                    <Input field={form("name")} data-testid="input" />
                    <FieldValue field={form("name")}>
                        { name => <div>Your name is { name satisfies string }</div>}
                    </FieldValue>
                </form>
            )
        }
        const { getByTestId, queryByText } = render(<Test />);
        expect(formRenderCount).toBe(1);
        const input = getByTestId("input");
        await user.type(input, "michael");

        expect(queryByText("Your name is michael")).toBeInTheDocument();
        expect(formRenderCount).toBe(1);
    })
});
