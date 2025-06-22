import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { RadioButton } from "../RadioButton.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("RadioButton", () => {
    it("can switch options", async () => {
        function Test() {
            const form = useForm({
                initialValues: { animal: "cat" }
            })
            return (
                <>
                    <RadioButton field={form("animal")} value="cat" data-testid="cat" />
                    <RadioButton field={form("animal")} value="dog" data-testid="dog" />
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const cat = getByTestId("cat");
        const dog = getByTestId("dog");
        expect(cat).toBeChecked();
        expect(dog).not.toBeChecked();

        await user.click(dog);
        expect(dog).toBeChecked();
        expect(cat).not.toBeChecked();
    });

    it("can map object types", async () => {
        function Test() {
            const form = useForm({
                initialValues: { owner: { name: "michael", id: 1 } }
            });
            function getUserId(user: { id: number }) {
                return user.id;
            }
            return (
                <>
                    <RadioButton
                        field={form("owner")}
                        value={{ name: "michael", id: 1 }}
                        mapToValue={getUserId}
                        data-testid="michael"
                    />
                    <RadioButton
                        field={form("owner")}
                        value={{ name: "tom", id: 2 }}
                        mapToValue={getUserId}
                        data-testid="tom"
                    />
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const michael = getByTestId("michael");
        const tom = getByTestId("tom");
        expect(michael).toBeChecked();
        expect(tom).not.toBeChecked();

        await user.click(tom);
        expect(tom).toBeChecked();
        expect(michael).not.toBeChecked();
    });
});
