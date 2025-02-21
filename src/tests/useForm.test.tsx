import '@testing-library/jest-dom/vitest';
import { test, expect, describe } from 'vitest';
import { render } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../useForm";
import { Input } from "../Input";
import { Checkbox } from "../Checkbox";
import { useFormErrors } from "../useFormErrors";
import { useSubmissionError } from "../useSubmissionError";
import { IntegerInput } from "../IntegerInput";
import { Select } from "../Select";
import { useIsSubmitting } from "../useIsSubmitting";
import { useElements } from "../useElements";
import { useIsTouched } from "../useIsTouched";

const user = userEvent.setup();

describe("useForm", () => {
    test("Type into text input", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    title: ""
                }),
                submit: async () => "done"
            })

            return (
                <>
                    <form onSubmit={form.submit}>
                        <Input field={form.get("title")} data-testid="input" />
                    </form>
                </>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        const input = getByTestId("input");

        expect(queryByText("My title")).not.toBeInTheDocument();
        await user.type(input, "My title");
        expect(input).toHaveValue("My title");
    })

    test("Checkbox", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    isPublic: false
                }),
                submit: async () => "done"
            })
            const errors = useFormErrors(form.get("isPublic"));

            return (
                <>
                    <form onSubmit={form.submit}>
                        <Checkbox field={form.get("isPublic")} data-testid="checkbox"/>
                        {
                            errors ? JSON.stringify(errors) : null
                        }
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const checkbox = getByTestId("checkbox");

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
    })

    test("Submission fails", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    tags: [] as string[]
                }),
                submit: () => Promise.reject("Submission failed")
            })
            const submissionError = useSubmissionError(form);

            return (
                <>
                    <form onSubmit={form.submit}>
                        {
                            submissionError ? <div data-testid="error">{ JSON.stringify(submissionError) }</div> : null
                        }
                        <button type="submit" data-testid="submit">Submit</button>
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        await user.click(getByTestId("submit"));
        expect(getByTestId("error")).toBeInTheDocument();
    })

    test("Nested object", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    metadata: {
                        createdAt: 0 as (number | ""),
                        updatedAt: 0
                    }
                }),
                submit: () => Promise.resolve("Ok")
            })
            return (
                <>
                    <form onSubmit={form.submit}>
                        <IntegerInput field={form.get("metadata").property("createdAt")} data-testid="createdAt" />
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const createdAt = getByTestId("createdAt");
        await user.type(createdAt, "123");
        expect(createdAt).toHaveValue(123);
        await user.type(createdAt, "4");
        expect(createdAt).toHaveValue(1234);
        await user.type(createdAt, ".6");
        expect(createdAt).toHaveValue(1235); //rounds up
        await user.type(createdAt, "{backspace}".repeat(4))
        expect(createdAt).not.toHaveValue()
    })

    test("Select", async () => {
        function Test() {
            type Animal = "cat" | "dog";

            const form = useForm({
                getInitialValues: () => ({
                    animal: "cat" as Animal
                }),
                submit: () => Promise.resolve("Ok")
            })
            return (
                <>
                    <form onSubmit={form.submit}>
                        <Select
                            data-testid="animal"
                            field={form.get("animal")} options={[
                                { label: "Cat!", value: "cat" },
                                { label: "Dog!", value: "dog" },
                            ]}
                        />
                        <button type="submit">Submit</button>
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const select = getByTestId("animal");
        await user.selectOptions(select, "dog");
        expect(select).toHaveValue("dog");
    })

    test("Array elements", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    tags: ["tag1", "tag2"]
                }),
                submit: () => new Promise(_ => {}) // never resolve
            });

            const isSubmitting = useIsSubmitting(form);
            const tags = useElements(form.get("tags"));
            return (
                <>
                    <form onSubmit={form.submit}>
                        {
                            tags.map((tag, idx) => <Input key={idx} field={tag} data-testid={`tag-${idx + 1}`} />)
                        }
                        <button type="submit" disabled={isSubmitting} data-testid="submit2">Submit</button>
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const tag = getByTestId("tag-1");
        await user.type(tag, "abc");
        expect(tag).toHaveValue("tag1abc");

        const submit = getByTestId("submit2");
        await user.click(submit);
        expect(submit).toBeDisabled();
    })

    test("Touched", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    title: ""
                }),
                submit: async () => "done"
            })

            const titleField = form.get("title");
            const touched = useIsTouched(titleField);
            return (
                <>
                    <form onSubmit={form.submit}>
                        <Input field={titleField} data-testid="input2" />
                        { touched ? <div data-testid="touched">touched</div> : null }
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const input = getByTestId("input2");
        await user.click(input);
        await user.tab();
        expect(getByTestId("touched")).toBeInTheDocument();
    })
})