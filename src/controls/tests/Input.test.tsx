import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { Input } from "../Input.tsx";
import { useIsBlurred } from "../../hooks/useIsBlurred.ts";
import { type ComponentRef, useEffect, useRef } from "react";

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
                initialValues: { title: "" },
            })
            const titleField = form("title");
            const wasBlurred = useIsBlurred(titleField);
            return (
                <form>
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

    it("supports a ref", () => {
        function Test() {
            const inputRef = useRef<ComponentRef<"input">>(null);
            const form = useForm({
                initialValues: { title: "" },
            });
            useEffect(() => {
                if (inputRef.current) {
                    inputRef.current.value = "my title";
                }
            }, [])

            return (
                <Input field={form("title")} ref={inputRef} data-testid="input" />
            )
        }
        const { getByTestId } = render(<Test />);
        expect(getByTestId("input")).toHaveValue("my title");
    })
});
