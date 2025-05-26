import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../useForm.ts";
import { ForEachElement } from "../ForEachElement.tsx";
import { Input } from "../controls/Input.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("ForEachElement", () => {
    it("safely iterates the elements", async () => {
        function Test() {
            const form = useForm({
                initialValues: {
                    tags: [{ label: "typescript" }]
                },
                submit: () => "done",
            })

            return (
                <ForEachElement field={form.get("tags")}>
                {tagField => <Input field={tagField.property("label")} data-testid="input" />}
                </ForEachElement>
            )
        }

        const { getByTestId } = render(<Test />);
        const input = getByTestId("input");
        expect(input).toHaveValue("typescript");
        await user.type(input, "2");
        expect(input).toHaveValue("typescript2");
    })
});
