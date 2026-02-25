import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { FileInput } from "../FileInput.tsx";
import { useFieldData } from "../../hooks/useFieldData.ts";

afterEach(() => cleanup());

describe("FileInput", () => {
    it("can add files", async () => {
        function Test() {
            type Data = { file: FileList | null };
            const form = useForm<Data, unknown>({
                initialValues: { file: null }
            })
            const file = useFieldData(form("file"));
            return (
                <>
                    <FileInput field={form("file")} data-testid="input" required={true} />
                    Files: {
                        file ? <div>{ Array.from(file).map(f => f.name).join(", ") }</div> : null
                    }
                </>
            )
        }
        const { getByTestId, queryByText } = render(<Test />);
        expect(queryByText("hello.png")).not.toBeInTheDocument();

        const input = getByTestId("input");
        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        await userEvent.upload(input, file);
        expect(queryByText("hello.png")).toBeInTheDocument();
    })
});
