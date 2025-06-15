import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { NumberInput } from "../../controls/NumberInput.tsx";
import { useFieldValue } from "../../hooks/useFieldValue.ts";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("NumberInput", () => {
    it("Accepts blank (NaN) and decimals", async () => {
        function Test() {
            const form = useForm({
                initialValues: { value: NaN }
            })
            const value = useFieldValue(form("value"));
            return (
                <>
                    <NumberInput field={form("value")} data-testid="input" />
                    <div>Value: { value } ({ typeof value })</div>
                </>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        const input = getByTestId("input");

        expect(input).toHaveValue(null);
        await user.type(input, "30.1");
        expect(input).toHaveValue(30.1);
        expect(queryByText("Value: 30.1 (number)")).toBeInTheDocument();

        await user.type(input, "{backspace}".repeat(4));
        expect(input).toHaveValue(null);
        expect(queryByText("Value: NaN (number)")).toBeInTheDocument();
    })
});
