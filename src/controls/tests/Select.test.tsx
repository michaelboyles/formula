import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../../hooks/useForm.ts";
import { Select } from "../Select.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("Select", () => {
    it("can change option", async () => {
        function Test() {
            type Animal = "cat" | "dog" | "mouse";

            const form = useForm({
                initialValues: () => ({
                    animal: "cat" as Animal
                }),
                submit: () => Promise.resolve("Ok")
            })
            return (
                <form onSubmit={form.submit}>
                    <Select
                        data-testid="animal"
                        field={form.get("animal")}
                        options={[
                            { label: "Cat!", value: "cat" },
                            { label: "Dog!", value: "dog" },
                            { label: "Mouse!", value: "mouse", disabled: true }
                        ]}
                    />
                </form>
            )
        }

        const { getByTestId } = render(<Test />);
        const select = getByTestId("animal");
        await user.selectOptions(select, "dog");
        expect(select).toHaveValue("dog");
    })

    it("can map object values", async () => {
        function Test() {
            type Vehicle = { type: "bike" } | { type: "car" }

            const form = useForm({
                initialValues: () => ({
                    vehicle: { type: "bike" } as Vehicle
                }),
                submit: () => Promise.resolve("Ok")
            })
            return (
                <form onSubmit={form.submit}>
                    <Select
                        data-testid="vehicle"
                        field={form.get("vehicle")}
                        options={[
                            { label: "** Car", value: { type: "car" } },
                            { label: "-- Bike", value: { type: "bike" } },
                        ]}
                        mapToValue={vehicle => vehicle.type}
                    />
                </form>
            )
        }

        const { getByTestId } = render(<Test />);
        const select = getByTestId("vehicle");
        await user.selectOptions(select, "car");
        expect(select).toHaveValue("car");
    })
});
