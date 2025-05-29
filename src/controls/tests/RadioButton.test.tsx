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
    it("can change option", async () => {
        function Test() {
            type Animal = "cat" | "dog" | "mouse";

            const form = useForm({
                initialValues: {
                    animal: "dog" as Animal
                },
                submit() {}
            })
            const animalField = form("animal");
            return (
                <form onSubmit={form.submit}>
                    <RadioButton field={animalField} value="cat" name="animal" data-testid="cat" />
                    <RadioButton field={animalField} value="dog" name="animal" data-testid="dog" />
                    <RadioButton field={animalField} value="mouse" name="animal" data-testid="mouse" />
                </form>
            )
        }

        const { getByTestId } = render(<Test />);
        const catRadio = getByTestId("cat");
        const dogRadio = getByTestId("dog");
        const mouseRadio = getByTestId("mouse");
        expect(catRadio).not.toBeChecked();
        expect(dogRadio).toBeChecked();
        expect(mouseRadio).not.toBeChecked();

        await user.click(catRadio);
        expect(catRadio).toBeChecked();
        expect(dogRadio).not.toBeChecked();
        expect(mouseRadio).not.toBeChecked();
    })

    it("can map object values", async () => {
        function Test() {
            type Vehicle = { type: "bike" } | { type: "car" }

            const form = useForm({
                initialValues: {
                    vehicle: { type: "car" } as Vehicle
                },
                submit() {}
            })
            const mapToValue = (vehicle: Vehicle) => vehicle.type;
            return (
                <form onSubmit={form.submit}>
                    <RadioButton
                        field={form("vehicle")}
                        value={{ type: "bike" }}
                        name="bike"
                        mapToValue={mapToValue}
                        data-testid="bike"
                    />
                    <RadioButton
                        field={form("vehicle")}
                        value={{ type: "car" }}
                        name="car"
                        mapToValue={mapToValue}
                        data-testid="car"
                    />
                </form>
            )
        }

        const { getByTestId } = render(<Test />);
        const bikeRadio = getByTestId("bike");
        const carRadio = getByTestId("car");
        expect(carRadio).toBeChecked();
        expect(bikeRadio).not.toBeChecked();

        await user.click(bikeRadio);
        expect(carRadio).not.toBeChecked();
        expect(bikeRadio).toBeChecked();
    })
});
