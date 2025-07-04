import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { Input } from "../../controls/Input.tsx";
import { DebugField } from "../DebugField.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("DebugField", () => {
    it("displays the state", async () => {
        function Test() {
            const form = useForm({
                initialValues: { title: "" }
            })
            return (
                <>
                    <DebugField field={form("title")} data-testid="pre" />
                    <Input field={form("title")} data-testid="input" />
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const input = getByTestId("input");
        await user.type(input, "My title{tab}");

        const expectedJson = {
            path: "title", value: "My title", blurred: true, errors: []
        }
        expect(getByTestId("pre").textContent).toBe(JSON.stringify(expectedJson, null, 2));
    })
});
