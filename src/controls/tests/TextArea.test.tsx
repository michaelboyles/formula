import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { TextArea } from "../../controls/TextArea.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("TextArea", () => {
    it("can be typed in without rerendering the parent", async () => {
        let formRenderCount = 0;
        function Test() {
            formRenderCount++;
            const form = useForm({
                initialValues: { title: "" }
            })
            return (
                <TextArea field={form("title")} data-testid="textarea" />
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        const input = getByTestId("textarea");

        expect(queryByText("some text")).not.toBeInTheDocument();
        await user.type(input, "some text");
        expect(input).toHaveValue("some text");
        expect(formRenderCount).toBe(1);
    })
});
