import '@testing-library/jest-dom/vitest';
import { afterEach, expect, describe, it } from 'vitest';
import { cleanup, render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../useForm.ts";
import { useRadioButton } from "../useRadioButton.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("RadioButton", () => {
    it("can change option", async () => {
        function Test() {
            const form = useForm({
                initialValues: { animal: "dog" }
            })
            const RadioButton = useRadioButton(form("animal"));
            return (
                <form>
                    <RadioButton value="cat" name="animal" data-testid="cat" />
                    <RadioButton value="dog" name="animal" data-testid="dog" />
                    <RadioButton value="mouse" name="animal" data-testid="mouse" />
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
                }
            });
            const RadioButton = useRadioButton(form("vehicle"), {
                mapToValue: vehicle => vehicle.type
            });
            return (
                <form>
                    <RadioButton value={{ type: "bike" }} data-testid="bike" />
                    <RadioButton value={{ type: "car" }} data-testid="car" />
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

    it("supports HTML 'name' in options, which may be overridden", async () => {
        function Test() {
            const form = useForm({
                initialValues: {
                    animal: "dog"
                }
            })
            const RadioButton = useRadioButton(form("animal"), {
                name: "animal"
            });
            return (
                <form>
                    <RadioButton value="cat" data-testid="cat" />
                    <RadioButton value="dog" name="override" data-testid="dog" />
                </form>
            )
        }

        const { getByTestId } = render(<Test />);
        const catRadio = getByTestId("cat");
        const dogRadio = getByTestId("dog");
        expect(catRadio.getAttribute("name")).toEqual("animal");
        expect(dogRadio.getAttribute("name")).toEqual("override");
    })
});
