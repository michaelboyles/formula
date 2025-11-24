import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../useForm.ts";
import { Input } from "../../controls/Input.tsx";
import { useFieldValue } from "../useFieldValue.ts";
import type { FormField } from "../../FormField.ts";

const user = userEvent.setup();
afterEach(() => cleanup());

type FavoriteFood = {
    type: "food"
    food: string
}
type FavoriteAnimal = {
    type: "animal"
    animal: string
}
type FormData = {
    favorite: FavoriteFood | FavoriteAnimal
}

function FavoriteAnimalInput(props: { field: FormField<FavoriteAnimal> }) {
    return (
        <label>
            Favorite animal: <Input field={props.field("animal")} data-testid="favAnimal" />
        </label>
    )
}
function FavoriteFoodInput(props: { field: FormField<FavoriteFood> }) {
    return (
        <label>
            Favorite food: <Input field={props.field("food")} data-testid="favFood" />
        </label>
    )
}

describe("Polymorphism", () => {
    it("supports field narrowing", async () => {
        function Test() {
            const form = useForm<FormData, unknown>({
                initialValues: { favorite: { type: "food", food: "" } },
            });
            const favorite = useFieldValue(form("favorite"));
            if (favorite.type === "food") {
                return (
                    <>
                        <FavoriteFoodInput field={form("favorite").narrow()} />
                        <div>{ favorite.food }</div>
                    </>
                )
            }
            else if (favorite.type === "animal") {
                // This version uses a witness (optional)
                return <FavoriteAnimalInput field={form("favorite").narrow(favorite)} />
            }
            throw new Error("Unsupported type");
        }
        const { getByTestId, queryByText } = render(<Test />);
        await user.type(getByTestId("favFood"), "pizza");
        expect(queryByText("pizza", { exact: false })).toBeInTheDocument();
    })
});
