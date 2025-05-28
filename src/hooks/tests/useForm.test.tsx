import '@testing-library/jest-dom/vitest';
import { afterEach, expect, expectTypeOf, describe, it, test } from 'vitest';
import { cleanup, render, renderHook } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { useForm } from "../useForm.ts";
import { Input } from "../../controls/Input.tsx";
import { useFieldErrors } from "../useFieldErrors.ts";
import { useSubmissionError } from "../useSubmissionError.ts";
import { useIsSubmitting } from "../useIsSubmitting.ts";
import { useElements } from "../useElements.ts";
import { useFieldValue } from "../useFieldValue.ts";
import * as z from "zod";
import type { FormField } from "../../FormField.ts";
import { Fragment, useState } from "react";
import { ForEachElement } from "../../ForEachElement.tsx";
import { FieldErrors } from "../../FieldErrors.tsx";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("useForm", () => {
    test("Submission fails", async () => {
        function Test() {
            const [errorJson, setErrorJson] = useState("");

            const form = useForm({
                initialValues: {
                    tags: [] as string[]
                },
                submit: () => Promise.reject("Submission failed"),
                onError: (_e, { form }) => {
                    setErrorJson(JSON.stringify(form.getData().tags));
                }
            })
            const submissionError = useSubmissionError(form);

            return (
                <form onSubmit={form.submit}>
                    {
                        submissionError ? <div data-testid="error">{ submissionError.message }</div> : null
                    }
                    {
                        errorJson.length ? <pre data-testid="json">{ errorJson }</pre> : null
                    }
                    <button type="submit" data-testid="submit">Submit</button>
                </form>
            )
        }

        const { getByTestId } = render(<Test />);
        await user.click(getByTestId("submit"));
        expect(getByTestId("error")).toBeInTheDocument();
        expect(getByTestId("json")).toHaveTextContent("[]");
    })

    test("Nested object", async () => {
        function Test() {
            const form = useForm({
                initialValues: {
                    metadata: {
                        createdAt: "",
                    }
                },
                submit: () => Promise.resolve("Ok")
            })
            return (
                <form onSubmit={form.submit}>
                    <Input field={form.get("metadata").property("createdAt")} data-testid="createdAt" />
                </form>
            )
        }

        const { getByTestId } = render(<Test />);
        const createdAt = getByTestId("createdAt");
        await user.type(createdAt, "123");
        expect(createdAt).toHaveValue("123");
        await user.type(createdAt, "{backspace}".repeat(3))
        expect(createdAt).not.toHaveValue()
    })

    test("Array elements", async () => {
        function Test() {
            const form = useForm({
                initialValues: () => ({
                    tags: ["tag1", "tag2"]
                }),
                submit: () => new Promise(_ => {}) // never resolve
            });

            const isSubmitting = useIsSubmitting(form);
            const tags = useElements(form.get("tags"));
            return (
                <form onSubmit={form.submit}>
                    {
                        tags.map((tag, idx) => <Input key={idx} field={tag} data-testid={`tag-${idx + 1}`} />)
                    }
                    <button type="submit" disabled={isSubmitting} data-testid="submit">Submit</button>
                </form>
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

    test("Standard Schema validation", async () => {
        const validator = z.object({
            title: z.string().max(5),
            tags: z.string().max(5).array()
        })

        function Test() {
            const form = useForm({
                initialValues: () => ({
                    title: "",
                    tags: ["tag too long"]
                }),
                submit: async () => "done",
                validators: [validator]
            });
            const titleErrors = useFieldErrors(form.get("title"));
            const firstTagErrors = useFieldErrors(form.get("tags").element(0));
            return (
                <form onSubmit={form.submit}>
                    <Input field={form.get("title")} data-testid="input" />
                    <input type="submit" value="Submit" data-testid="submit" />
                    { titleErrors.map((err, idx) => <div key={idx} data-testid="title-error">{ err }</div>) }
                    { firstTagErrors.map((err, idx) => <div key={idx} data-testid="tag-error">{ err }</div>) }
                </form>
            )
        }

        const { getByTestId, getAllByTestId } = render(<Test />);
        await user.type(getByTestId("input"), "abcdef");
        await user.click(getByTestId("submit"));

        expect(getAllByTestId("title-error").length).toBe(1);
        expect(getAllByTestId("tag-error").length).toBe(1);
    })

    test("Native validation for string", async () => {
        function Test() {
            const form = useForm({
                initialValues: () => ({
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
            const titleErrors = useFieldErrors(form.get("title"));
            return (
                <form onSubmit={form.submit}>
                    <Input field={form.get("title")} data-testid="input" />
                    <input type="submit" value="Submit" data-testid="submit" />
                    { titleErrors.map((err, idx) => <div key={idx}>{ err }</div>) }
                </form>
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
                initialValues: () => ({
                    title: "Initial"
                }),
                submit: async () => "done"
            });

            // This is just here to force the re-render. This isn't the recommended way to use it
            useFieldValue(form.get("title"));
            return (
                <form onReset={() => form.reset()}>
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

    describe("array fields", () => {
        it("provides type safety for elements", () => {
            renderHook(() => {
                const form = useForm({
                    initialValues: () => ({
                        tags: [] as string[]
                    }),
                    submit: async () => "done"
                });
                const tagsField = form.get("tags");
                expectTypeOf(tagsField.getValue).toEqualTypeOf<() => Readonly<string[]>>();
                const firstTag = form.get("tags").element(1);
                expectTypeOf(firstTag.getValue).toEqualTypeOf<() => string | undefined>();
                expectTypeOf(firstTag.setValue).toEqualTypeOf<(value: string) => void>();

                const elements = useElements(tagsField);
                for (let element of elements) {
                    expectTypeOf(element.getValue).toEqualTypeOf<() => string>();
                    expectTypeOf(element.setValue).toEqualTypeOf<(value: string) => void>();
                }
            })
        })

        it("allows pushing/removing elements", async () => {
            function Test() {
                const form = useForm({
                    initialValues: () => ({
                        tags: [] as string[]
                    }),
                    submit: async () => "done"
                });

                const tags = useFieldValue(form.get("tags"));
                return (
                    <form onReset={() => form.reset()}>
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

    it("should clear errors from previous elements", async () => {
        function Test() {
            const form = useForm({
                initialValues: {
                    tags: ["typescript", "react"]
                },
                submit() {}
            });

            const tagsField = form.get("tags");
            const tagFields = useElements(tagsField);
            function addErrors() {
                tagFields.forEach(tagField => {
                    tagField.setErrors("Invalid tag");
                })
            }

            function swapTags() {
                tagsField.remove(1);
                tagsField.remove(0);
                tagsField.push("java");
            }

            return (
                <>
                    <button onClick={addErrors} data-testid="addErrors">Add errors</button>
                    <button onClick={swapTags} data-testid="swap">Swap</button>
                    <ForEachElement field={tagsField}>
                    { tagField => (
                        <FieldErrors field={tagField}>
                            { errors => errors && errors.length ? <div>Errors: { errors }</div> : null }
                        </FieldErrors>
                    )}
                    </ForEachElement>
                </>
            )
        }

        // WHEN you have an error associated with an element, then clear that element and replace it with
        // another
        // THEN that new element should have no errors
        const { queryAllByText, getByTestId } = render(<Test />);
        expect(queryAllByText("Errors: Invalid tag").length).toBe(0);
        await user.click(getByTestId("addErrors"));
        expect(queryAllByText("Errors: Invalid tag").length).toBe(2);
        await user.click(getByTestId("swap"));
        expect(queryAllByText("Errors: Invalid tag").length).toBe(0);
    })
})

describe("Native validation", () => {
    test("for array", async () => {
        function ErrorComp(props: { field: FormField<any>, id: number }) {
            const errors = useFieldErrors(props.field);
            return (
                errors.map((err, i) => <div key={i} data-testid={`tag-${props.id}-error-${i}`}>{ err }</div>)
            )
        }

        function Test() {
            const form = useForm({
                initialValues: () => ({
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
            const tagErrors = useFieldErrors(tags);

            const tagFields = useElements(form.get("tags"));
            return (
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
                    { tagErrors.length > 0 ? <div data-testid="tagErrors">{ tagErrors.join(", ") }</div> : null }
                    <input type="submit" value="Submit" data-testid="submit" />
                </form>
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
                initialValues: () => ({
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

            const metaErrors = useFieldErrors(form.get("meta"));
            const humanReadableErrors = useFieldErrors(form.get("meta").property("createdAt").property("humanReadable"));
            const unixTimestampErrors = useFieldErrors(form.get("meta").property("createdAt").property("unixTimestamp"));
            return (
                <form onSubmit={form.submit}>
                    {
                        metaErrors.length ? <div>{ metaErrors.join(", ")} </div> : null
                    }
                    {
                        humanReadableErrors.length ? <div>{ humanReadableErrors.join(", ")} </div> : null
                    }
                    {
                        unixTimestampErrors.length ? <div>{ unixTimestampErrors.join(", ")} </div> : null
                    }
                    <input type="submit" value="Submit" data-testid="submit" />
                </form>
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
                initialValues: () => ({
                    value: null
                }),
                submit: async () => "done",
                validate: {
                    value(value) {
                        if (value == null) return "Required";
                    }
                }
            });

            const errors = useFieldErrors(form.get("value"));
            return (
                <form onSubmit={form.submit}>
                    {
                        errors.length ? <div>{ errors.join(", ")} </div> : null
                    }
                    <input type="submit" value="Submit" data-testid="submit" />
                </form>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        await user.click(getByTestId("submit"));
        expect(queryByText("Required")).toBeInTheDocument();
    })

    test("For numeric field", async () => {
        function Test() {
            type FormValues = {
                1: string | null
            }

            const form = useForm<FormValues, any>({
                initialValues: {
                    1: null
                },
                submit: async () => "done",
                validate: {
                    1(one) {
                        if (one == null) return "Required";
                    }
                }
            });

            const errors = useFieldErrors(form.get(1));
            return (
                <form onSubmit={form.submit}>
                    {
                        errors.length ? <div>{ errors.join(", ")} </div> : null
                    }
                    <input type="submit" value="Submit" data-testid="submit" />
                </form>
            )
        }

        const { getByTestId, queryByText } = render(<Test />);
        await user.click(getByTestId("submit"));
        expect(queryByText("Required")).toBeInTheDocument();
    })
});
