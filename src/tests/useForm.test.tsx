import '@testing-library/jest-dom/vitest';
import { afterEach, test, expect, describe } from 'vitest';
import { cleanup, render } from "@testing-library/react";
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
import { useFormValue } from "../useFormValue";
import * as z from "zod";
import { FormField } from "../FormField";
import { Fragment } from "react";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

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
                            submissionError ? <div data-testid="error">{ submissionError.message }</div> : null
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
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const select = getByTestId("animal");
        await user.selectOptions(select, "dog");
        expect(select).toHaveValue("dog");
    })

    test("Mapped select", async () => {
        function Test() {
            type Vehicle = { type: "bike" } | { type: "car" }

            const form = useForm({
                getInitialValues: () => ({
                    vehicle: { type: "bike" } as Vehicle
                }),
                submit: () => Promise.resolve("Ok")
            })
            return (
                <>
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
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const select = getByTestId("vehicle");
        await user.selectOptions(select, "car");
        expect(select).toHaveValue("car");
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
                        <button type="submit" disabled={isSubmitting} data-testid="submit">Submit</button>
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const tag = getByTestId("tag-1");
        await user.type(tag, "abc");
        expect(tag).toHaveValue("tag1abc");

        const submit = getByTestId("submit");
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
                        <Input field={titleField} data-testid="input" />
                        { touched ? <div data-testid="touched">touched</div> : null }
                    </form>
                </>
            )
        }

        const { getByTestId } = render(<Test />);
        const input = getByTestId("input");
        await user.click(input);
        await user.tab();
        expect(getByTestId("touched")).toBeInTheDocument();
    })

    test("Standard Schema validation", async () => {
        const validator = z.object({
            title: z.string().max(5),
            tags: z.string().max(5).array()
        })

        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    title: "",
                    tags: ["tag too long"]
                }),
                submit: async () => "done",
                validators: [validator]
            });
            const titleErrors = useFormErrors(form.get("title"));
            const firstTagErrors = useFormErrors(form.get("tags").element(0));
            return (
                <>
                    <form onSubmit={form.submit}>
                        <Input field={form.get("title")} data-testid="input" />
                        <input type="submit" value="Submit" />
                        { titleErrors ? titleErrors.map((err, idx) => <div key={idx} data-testid="title-error">{ err }</div>) : null }
                        { firstTagErrors ? firstTagErrors.map((err, idx) => <div key={idx} data-testid="tag-error">{ err }</div>) : null }
                    </form>
                </>
            )
        }

        const { getByTestId, getAllByTestId } = render(<Test />);
        const input = getByTestId("input");
        await user.type(input, "abcdef");
        await user.type(input, "{enter}");

        expect(getAllByTestId("title-error").length).toBe(1);
        expect(getAllByTestId("tag-error").length).toBe(1);
    })

    test("Native validation for string", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    title: "",
                }),
                submit: async () => "done",
                validate: {
                    title(title) {
                        if (title.length < 5) return "Title too short";
                        if (title.length > 10) return "Title too long";
                    }
                }
            });
            const titleErrors = useFormErrors(form.get("title"));
            return (
                <>
                    <form onSubmit={form.submit}>
                        <Input field={form.get("title")} data-testid="input" />
                        <input type="submit" value="Submit" data-testid="submit" />
                        { titleErrors ? titleErrors.map((err, idx) => <div key={idx}>{ err }</div>) : null }
                    </form>
                </>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        const input = getByTestId("input");
        await user.type(input, "123");
        await user.type(input, "{enter}");
        expect(queryByText("Title too short")).toBeInTheDocument();

        await user.type(input, "now too much");
        await user.type(input, "{enter}");
        expect(queryByText("Title too long")).toBeInTheDocument();
    })

    test("getData, setData, resetData", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    title: "Initial"
                }),
                submit: async () => "done"
            });

            // This is just here to force the re-render. This isn't the recommended way to use it
            useFormValue(form.get("title"));
            return (
                <form onReset={() => form.resetData()}>
                    <div>{ form.getData().title }</div>
                    <button
                        type="button"
                        onClick={() => form.setData({ title: "My Title" })}
                        data-testid="setDataBtn"
                    >Set data</button>
                    <input type="reset" data-testid="reset" />
                </form>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        await user.click(getByTestId("setDataBtn"));
        expect(queryByText("My Title")).toBeInTheDocument();

        await user.click(getByTestId("reset"));
        expect(queryByText("Initial")).toBeInTheDocument();
    })

    test("Push and remove elements", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    tags: [] as string[]
                }),
                submit: async () => "done"
            });

            const tags = useFormValue(form.get("tags"));
            return (
                <form onReset={() => form.resetData()}>
                    {
                        tags.map((tag, idx) => <div key={idx} data-testid="tag">{tag}</div>)
                    }
                    <button
                        type="button"
                        onClick={() => form.get("tags").push("tag " + (tags.length + 1))}
                        data-testid="pushTagBtn"
                    >Push tag
                    </button>
                    <button
                        type="button"
                        onClick={() => form.get("tags").remove(1)}
                        data-testid="removeSecondTagBtn"
                    >Remove 2nd tag
                    </button>
                </form>
            )
        }

        const {queryAllByTestId, getByTestId, queryAllByText} = render(<Test/>);

        const pushTagBtn = getByTestId("pushTagBtn");
        expect(queryAllByTestId("tag")).toHaveLength(0);

        await user.click(pushTagBtn);
        expect(queryAllByTestId("tag")).toHaveLength(1);

        await user.click(pushTagBtn);
        expect(queryAllByTestId("tag")).toHaveLength(2);

        await user.click(getByTestId("removeSecondTagBtn"));
        expect(queryAllByText("tag 2")).toHaveLength(0);
    })
})

describe("Native validation", () => {
    test("for array", async () => {
        function ErrorComp(props: { field: FormField, id: number }) {
            const errors = useFormErrors(props.field);
            if (!errors) return null;
            return (
                errors.map((err, i) => <div key={i} data-testid={`tag-${props.id}-error-${i}`}>{ err }</div>)
            )
        }

        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    tags: [] as string[]
                }),
                submit: async () => "done",
                validate: {
                    async tags(tags, forEachTag) {
                        if (!(tags.length >= 1)) return "Requires at least 1 tag"
                        forEachTag(tag => {
                            if (!tag.length) return ["Cannot be blank", "Required"];
                        });
                    }
                }
            });
            const tags = form.get("tags");
            const tagErrors = useFormErrors(tags);

            const tagFields = useElements(form.get("tags"));
            return (
                <>
                    <form onSubmit={form.submit}>
                        {
                            tagFields.map((tagField, i) => (
                                <Fragment key={i}>
                                    <Input field={tagField} data-testid={`tag-${i}`} />
                                    <ErrorComp field={tagField} id={i} />
                                </Fragment>
                            ))
                        }
                        <button type="button" onClick={() => tags.push("")} data-testid="add-tag">Add tag</button>
                        { tagErrors && tagErrors.length > 0 ? <div data-testid="tagErrors">{ tagErrors.join(", ") }</div> : null }
                        <input type="submit" value="Submit" data-testid="submit" />
                    </form>
                </>
            )
        }

        const { getByTestId, queryByTestId, queryByText } = render(<Test />);
        const submit = getByTestId("submit");
        await user.click(submit);
        expect(queryByText("Requires at least 1 tag")).toBeInTheDocument();

        const addTag = getByTestId("add-tag");
        await user.click(addTag);
        await user.click(submit);
        expect(queryByTestId("tag-0-error-0")).toHaveTextContent("Cannot be blank");

        const tag0 = getByTestId("tag-0");
        await user.type(tag0, "news");
        await user.click(submit);

        expect(queryByTestId("tag-0-error-0")).not.toBeInTheDocument()
    })

    test("For object", async () => {
        function Test() {
            const form = useForm({
                getInitialValues: () => ({
                    meta: {
                        createdAt: {
                            humanReadable: "",
                            unixTimestamp: -1
                        },
                        updatedAt: ""
                    }
                }),
                submit: async () => "done",
                validate: {
                    meta(meta, visitMeta) {
                        visitMeta({
                            createdAt(_createdAt, visitCreatedAt) {
                                visitCreatedAt({
                                    humanReadable(humanReadable) {
                                        if (!humanReadable.length) return "Human-readable creation time is required";
                                    },
                                    unixTimestamp(unixTimestamp) {
                                        if (unixTimestamp < 0) return "Must be after epoch";
                                    }
                                })
                            }
                        });
                        if (!meta.updatedAt.length) {
                            return "Update time is required";
                        }
                    }
                }
            });

            const metaErrors = useFormErrors(form.get("meta"));
            const humanReadableErrors = useFormErrors(form.get("meta").property("createdAt").property("humanReadable"));
            const unixTimestampErrors = useFormErrors(form.get("meta").property("createdAt").property("unixTimestamp"));
            return (
                <>
                    <form onSubmit={form.submit}>
                        {
                            metaErrors ? <div>{ metaErrors.join(", ")} </div> : null
                        }
                        {
                            humanReadableErrors ? <div>{ humanReadableErrors.join(", ")} </div> : null
                        }
                        {
                            unixTimestampErrors ? <div>{ unixTimestampErrors.join(", ")} </div> : null
                        }
                        <input type="submit" value="Submit" data-testid="submit" />
                    </form>
                </>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        await user.click(getByTestId("submit"));
        expect(queryByText("Update time is required")).toBeInTheDocument();
        expect(queryByText("Human-readable creation time is required")).toBeInTheDocument();
        expect(queryByText("Must be after epoch")).toBeInTheDocument();
    })

    test("For nullable", async () => {
        function Test() {
            type FormValues = {
                value: number | null
            }

            const form = useForm<FormValues, any>({
                getInitialValues: () => ({
                    value: null
                }),
                submit: async () => "done",
                validate: {
                    value(value) {
                        if (value == null) return "Required";
                    }
                }
            });

            const errors = useFormErrors(form.get("value"));
            return (
                <>
                    <form onSubmit={form.submit}>
                        {
                            errors ? <div>{ errors.join(", ")} </div> : null
                        }
                        <input type="submit" value="Submit" data-testid="submit" />
                    </form>
                </>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        await user.click(getByTestId("submit"));
        expect(queryByText("Required")).toBeInTheDocument();
    })
});