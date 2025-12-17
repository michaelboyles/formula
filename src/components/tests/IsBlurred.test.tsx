import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { Input } from "../../controls/Input.tsx";
import { IsBlurred } from "../IsBlurred.tsx";

const user = userEvent.setup();

afterEach(() => cleanup());

describe("IsBlurred", () => {
    it("updates without rerendering the parent", async () => {
        let formRenderCount = 0;
        function Test() {
            formRenderCount++;
            const form = useForm({
                initialValues: { name: "" },
            })
            return (
                <form onSubmit={form.submit}>
                    <Input field={form("name")} data-testid="input" />
                    <IsBlurred field={form("name")}>
                        { (isBlurred: boolean) => isBlurred ? <div data-testid="yes" /> : <div data-testid="no" /> }
                    </IsBlurred>
                </form>
            )
        }
        const { getByTestId, queryByTestId } = render(<Test />);
        expect(formRenderCount).toBe(1);
        expect(queryByTestId("no")).toBeInTheDocument();
        const input = getByTestId("input");
        await user.type(input, "michael");
        await user.tab();

        expect(formRenderCount).toBe(1);
        expect(queryByTestId("yes")).toBeInTheDocument();
    })
});
