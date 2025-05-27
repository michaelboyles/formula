import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { IntegerInput } from "../../controls/IntegerInput.tsx";
import { useFieldValue } from "../../hooks/useFieldValue.ts";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("IntegerInput", () => {
    it("NaN represents blank", async () => {
        function Test() {
            const form = useForm({
                initialValues: { age: NaN },
                submit: () => "done"
            })
            const age = useFieldValue(form.get("age"));
            return (
                <>
                    <IntegerInput field={form.get("age")} data-testid="input" />
                    <div>Age: { age } ({ typeof age })</div>
                </>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        const input = getByTestId("input");

        expect(input).toHaveValue(null);
        await user.type(input, "25");
        expect(input).toHaveValue(25);
        expect(queryByText("Age: 25 (number)")).toBeInTheDocument();

        await user.type(input, "{backspace}{backspace}");
        expect(input).toHaveValue(null);
        expect(queryByText("Age: NaN (number)")).toBeInTheDocument();
    })

    it("accepts intermediate values", async () => {
        function Test() {
            const form = useForm({
                initialValues: { age: NaN },
                submit: () => "done"
            })
            const age = useFieldValue(form.get("age"));
            return (
                <>
                    <IntegerInput field={form.get("age")} data-testid="input" />
                    <div>Age: { age } ({ typeof age })</div>
                </>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        const input = getByTestId("input");

        expect(input).toHaveValue(null);
        await user.type(input, "-.");
        expect(input).toHaveValue(null);
        expect(queryByText("Age: NaN (number)")).toBeInTheDocument();

        await user.type(input, "{backspace}1");
        expect(input).toHaveValue(-1);
        expect(queryByText("Age: -1 (number)")).toBeInTheDocument();

        await user.type(input, "{backspace}{backspace}+");
        expect(input).toHaveValue(null);
        await user.type(input, "2");
        expect(input).toHaveValue(2);
    })

    it("rounds decimals", async () => {
        function Test() {
            const form = useForm({
                initialValues: { age: NaN },
                submit: () => "done"
            })
            return (
                <IntegerInput field={form.get("age")} data-testid="input" />
            )
        }

        const { getByTestId } = render(<Test />);
        const input = getByTestId("input");

        expect(input).toHaveValue(null);
        await user.type(input, "0.6");
        expect(input).toHaveValue(1);
    })
});
