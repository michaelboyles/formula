import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, renderHook } from "@testing-library/react";
import { useForm } from "../useForm.ts";
import { useDeepFieldErrors } from "../useDeepFieldErrors.ts";
import { Input } from "../../controls/Input.tsx";
import { userEvent } from '@testing-library/user-event'

const user = userEvent.setup();
afterEach(() => cleanup());

describe("useDeepFieldErrors", () => {
    it("includes errors for nested fields", () => {
        const { result, rerender } = renderHook(() => {
            const form = useForm({
                initialValues: {
                    animal: {
                        species: "dog"
                    }
                }
            });
            const animalErrors = useDeepFieldErrors(form("animal"));
            return { form, animalErrors };
        });
        result.current.form("animal")("species").setErrors("error");
        rerender();
        expect(result.current.animalErrors).toStrictEqual(["error"])
    });

    it("responds to dynamic validation", async () => {
        function Test() {
            const form = useForm({
                initialValues: {
                    animal: {
                        species: ""
                    }
                },
                validate: {
                    animal: {
                        species(species) {
                            if (!["cat", "dog", "mouse"].includes(species)) return "Unknown species";
                        }
                    }
                },
                validateOnChange: true
            });
            const deepErrors = useDeepFieldErrors(form("animal"));
            return (
                <form>
                    <Input field={form("animal")("species")} data-testid="input" />
                    Errors: <div>{ deepErrors.join(", ") }</div>
                </form>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        await user.type(getByTestId("input"), "ca");
        expect(queryByText("Unknown species")).toBeInTheDocument();
        await user.type(getByTestId("input"), "t");
        expect(queryByText("Unknown species")).not.toBeInTheDocument();
    });
})
