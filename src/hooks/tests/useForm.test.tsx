import '@testing-library/jest-dom/vitest';
import { afterEach, expect, expectTypeOf, describe, it, test } from 'vitest';
import { cleanup, render, renderHook } from "@testing-library/react";
import { userEvent } from '@testing-library/user-event'
import { type Form, useForm } from "../useForm.ts";
import { Input } from "../../controls/Input.tsx";
import { useFieldErrors } from "../useFieldErrors.ts";
import { useSubmissionError } from "../useSubmissionError.ts";
import { useElements } from "../useElements.ts";
import { useFieldValue } from "../useFieldValue.ts";
import * as z from "zod";
import type { FormField } from "../../FormField.ts";
import { Fragment } from "react";
import { ForEachElement } from "../../components/ForEachElement.tsx";
import { FieldErrors } from "../../components/FieldErrors.tsx";
import { lazy, type ObjectValidator } from "../../validate.ts";

const user = userEvent.setup();

// https://testing-library.com/docs/react-testing-library/api/#cleanup
afterEach(() => cleanup());

describe("useForm", () => {
    it("supports an onSuccess callback", async () => {
        let called = false;
        function Test() {
            const form = useForm({
                initialValues: { name: "" },
                submit: () => ({ result: "done" }),
                onSuccess: ({ result, data, form }) => {
                    sink(result satisfies { result: string });
                    sink(data satisfies { name: string });
                    sink(form satisfies Form<{ name: string }>);
                    called = true;
                }
            })
            return (
                <form onSubmit={form.submit}>
                    <button type="submit" data-testid="submit">Submit</button>
                </form>
            )
        }

        const { getByTestId } = render(<Test />);
        await user.click(getByTestId("submit"));
        expect(called).toBe(true);
    })

    it("supports an onError callback", async () => {
        let called = false;
        function Test() {
            const form = useForm({
                initialValues: {
                    name: ""
                },
                submit: () => {
                    throw new Error("Submission failed");
                },
                onError: ({ error, data, form }) => {
                    sink(error satisfies Error);
                    sink(data satisfies { name: string });
                    sink(form satisfies Form<{ name: string }>);
                    called = true;
                }
            })
            const submissionError = useSubmissionError(form);
            return (
                <form onSubmit={form.submit}>
                    {
                        submissionError ? <div data-testid="error">{ submissionError.message }</div> : null
                    }
                    <button type="submit" data-testid="submit">Submit</button>
                </form>
            )
        }

        const { getByTestId, queryByTestId } = render(<Test />);
        await user.click(getByTestId("submit"));
        expect(queryByTestId("error")).toBeInTheDocument();
        expect(called).toBe(true);
    })

    it("supports nested objects", async () => {
        function Test() {
            const form = useForm({
                initialValues: {
                    metadata: {
                        createdAt: "",
                    }
                }
            })
            return (
                <Input field={form("metadata")("createdAt")} data-testid="createdAt" />
            )
        }

        const { getByTestId } = render(<Test />);
        const createdAt = getByTestId("createdAt");
        await user.type(createdAt, "123");
        expect(createdAt).toHaveValue("123");
        await user.type(createdAt, "{backspace}".repeat(3))
        expect(createdAt).not.toHaveValue()
    })

    it("supports Standard Schema validation", async () => {
        const validator = z.object({
            title: z.string().max(5),
            tags: z.string().max(5).array()
        })

        function Test() {
            const form = useForm({
                initialValues: {
                    title: "",
                    tags: ["tag too long"]
                },
                validators: [validator]
            });
            const titleErrors = useFieldErrors(form("title"));
            const firstTagErrors = useFieldErrors(form("tags")(0));
            return (
                <form onSubmit={form.submit}>
                    <Input field={form("title")} data-testid="input" />
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

    test("getData, setData, reset", async () => {
        function Test() {
            const form = useForm({
                initialValues: {
                    title: "Initial"
                }
            });

            // This is just here to force the re-render. This isn't the recommended way to use it
            useFieldValue(form("title"));
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
        it("supports arrays", async () => {
            function Test() {
                const form = useForm({
                    initialValues: {
                        tags: ["tag1", "tag2"]
                    }
                });
                return (
                    <ForEachElement field={form("tags")}>
                    {
                        (tag, idx) => <Input key={idx} field={tag} data-testid={`tag-${idx + 1}`} />
                    }
                    </ForEachElement>
                )
            }

            const { getByTestId } = render(<Test />);
            const tag = getByTestId("tag-1");
            await user.type(tag, "abc");
            expect(tag).toHaveValue("tag1abc");
        })

        it("provides type safety for elements", () => {
            renderHook(() => {
                const form = useForm({
                    initialValues: {
                        tags: [] as string[]
                    }
                });
                const tagsField = form("tags");
                expectTypeOf(tagsField.getValue).toEqualTypeOf<() => Readonly<string[]>>();
                const firstTag = form("tags")(1);
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
                    initialValues: {
                        tags: [] as string[]
                    },
                });

                const tags = useFieldValue(form("tags"));
                return (
                    <form onReset={() => form.reset()}>
                        {
                            tags.map((tag, idx) => <div key={idx} data-testid="tag">{tag}</div>)
                        }
                        <button
                            type="button"
                            onClick={() => form("tags").push("tag " + (tags.length + 1))}
                            data-testid="pushTagBtn"
                        >Push tag
                        </button>
                        <button
                            type="button"
                            onClick={() => form("tags").remove(1)}
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
                }
            });

            const tagsField = form("tags");
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

    it("calls initialValues once", () => {
        let initialValuesCalled = 0;
        const { rerender } = renderHook(() => {
            useForm({
                initialValues: () => {
                    initialValuesCalled++;
                    return { name: "michael" }
                }
            })
        });
        expect(initialValuesCalled).toBe(1);
        rerender();
        expect(initialValuesCalled).toBe(1);
    })

    describe("Native validation", () => {
        it("validates a string", async () => {
            function Test() {
                const form = useForm({
                    initialValues: {
                        title: "",
                    },
                    validate: {
                        title(title) {
                            if (title.length < 5) return "Title too short";
                            if (title.length > 10) return "Title too long";
                        }
                    }
                });
                const titleErrors = useFieldErrors(form("title"));
                return (
                    <form onSubmit={form.submit}>
                        <Input field={form("title")} data-testid="input" />
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

        it("validates an entire array", async () => {
            function Test() {
                const form = useForm({
                    initialValues: {
                        tags: [] as string[]
                    },
                    validate: {
                        tags(tags) {
                            if (!tags.length) return "Must have at least 1 tag";
                        }
                    }
                });
                const tagErrors = useFieldErrors(form("tags"));
                return (
                    <form onSubmit={form.submit}>
                        <div>{ tagErrors.join(", ") }</div>
                        <input type="submit" value="Submit" data-testid="submit" />
                    </form>
                )
            }

            const { getByTestId, queryByText } = render(<Test />);
            await user.click(getByTestId("submit"));
            expect(queryByText("Must have at least 1 tag")).toBeInTheDocument();
        })

        it("validates an array by elements", async () => {
            function ErrorComp(props: { field: FormField<any>, id: number }) {
                const errors = useFieldErrors(props.field);
                return (
                    errors.map((err, i) => <div key={i} data-testid={`tag-${props.id}-error-${i}`}>{ err }</div>)
                )
            }

            function Test() {
                const form = useForm({
                    initialValues: {
                        tags: [] as string[]
                    },
                    submit() {
                    },
                    validate: {
                        tags: {
                            _self(tags) {
                                if (!(tags.length >= 1)) return "Requires at least 1 tag"
                            },
                            _each(tag) {
                                if (!tag.length) return ["Cannot be blank", "Required"];
                            }
                        }
                    }
                });
                const tags = form("tags");
                const tagErrors = useFieldErrors(tags);

                const tagFields = useElements(form("tags"));
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

        it("validates an entire object", async () => {
            function Test() {
                const form = useForm({
                    initialValues: {
                        address: { number: "", street: "", city: "" }
                    },
                    validate: {
                        address({ number, street, city }) {
                            if (!number.length || !street.length || !city.length) return "Incomplete";
                        }
                    }
                });

                const addressErrors = useFieldErrors(form("address"));
                return (
                    <form onSubmit={form.submit}>
                        {
                            addressErrors.length ? <div>{ addressErrors.join(", ")} </div> : null
                        }
                        <input type="submit" value="Submit" data-testid="submit" />
                    </form>
                )
            }
            const { getByTestId, queryByText } = render(<Test />);
            await user.click(getByTestId("submit"));
            expect(queryByText("Incomplete")).toBeInTheDocument();
        })

        it("validates an object by properties", async () => {
            function Test() {
                const form = useForm({
                    initialValues: {
                        meta: {
                            createdAt: {
                                humanReadable: "",
                                unixTimestamp: -1
                            },
                            updatedAt: ""
                        }
                    },
                    validate: {
                        meta: {
                            _self(meta) {
                                if (!meta.updatedAt.length) return "Update time is required";
                            },
                            createdAt: {
                                humanReadable(humanReadable) {
                                    if (!humanReadable.length) return "Human-readable creation time is required";
                                },
                                unixTimestamp(unixTimestamp) {
                                    if (unixTimestamp < 0) return "Must be after epoch";
                                }
                            }
                        }
                    }
                });

                const metaErrors = useFieldErrors(form("meta"));
                const humanReadableErrors = useFieldErrors(form("meta")("createdAt")("humanReadable"));
                const unixTimestampErrors = useFieldErrors(form("meta")("createdAt")("unixTimestamp"));
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

        it("validates an array of objects", async () => {
            function Test() {
                const form = useForm({
                    initialValues: {
                        tags: [{ name: "react" }, { name: "" }]
                    },
                    validate: {
                        tags: {
                            _self(tags) {
                                if (!tags.length) return "Requires at least 1 tag"
                            },
                            _each: {
                                name(name) {
                                    if (!name.length) return "Cannot be blank";
                                }
                            }
                        }
                    }
                });
                return (
                    <form onSubmit={form.submit}>
                        <ForEachElement field={form("tags")}>
                        {tagField =>
                            <FieldErrors field={tagField("name")}>{errors => <div>{ errors.join(",") }</div>}</FieldErrors>
                        }
                        </ForEachElement>
                        <input type="submit" value="Submit" data-testid="submit" />
                    </form>
                )
            }

            const { getByTestId, queryByText } = render(<Test />);
            expect(queryByText("Cannot be blank")).not.toBeInTheDocument();
            await user.click(getByTestId("submit"));
            expect(queryByText("Cannot be blank")).toBeInTheDocument();
        })

        it("validates nullables", async () => {
            function Test() {
                type FormValues = {
                    value: number | null
                }

                const form = useForm<FormValues, any>({
                    initialValues: {
                        value: null
                    },
                    validate: {
                        value(value) {
                            if (value == null) return "Required";
                        }
                    }
                });

                const errors = useFieldErrors(form("value"));
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

        // TODO 3 revisit this, because for nested it might be weird
        it("validates numeric object key", async () => {
            function Test() {
                type FormValues = {
                    1: string | null
                }

                const form = useForm<FormValues, any>({
                    initialValues: {
                        1: null
                    },
                    validate: {
                        1(one) {
                            if (one == null) return "Required";
                        }
                    }
                });

                const errors = useFieldErrors(form(1));
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

        it("validates recursively", async () => {
            type TreeNode = {
                id: string
                children: TreeNode[]
            }
            type FormData = {
                tree: TreeNode
            }

            function TreeNodeDisplay({ nodeField }: { nodeField: FormField<TreeNode> }) {
                const nodeId = useFieldValue(nodeField("id"));
                const nodeIdErrors = useFieldErrors(nodeField("id"));
                return (
                    <div>
                        <h2>Node { nodeId }</h2>
                        Errors: <div>{ nodeIdErrors.join(", ") }</div>
                        Children:
                        <ForEachElement field={nodeField("children")}>
                        {childNodeField => <TreeNodeDisplay nodeField={childNodeField} />}
                        </ForEachElement>
                    </div>
                )
            }

            function getValidator(): ObjectValidator<TreeNode> {
                return {
                    id(id) {
                        if (!id.length) return "required";
                    },
                    children: {
                        _each: lazy(getValidator)
                    }
                }
            }

            function Test() {
                const form = useForm<FormData, any>({
                    initialValues: {
                        tree: {
                            id: "1",
                            children: [{
                                id: "2",
                                children: [{
                                    id: "",
                                    children: []
                                }]
                            }]
                        }
                    },
                    validate: {
                        tree: getValidator()
                    }
                });

                return (
                    <form onSubmit={form.submit}>
                        <TreeNodeDisplay nodeField={form("tree")} />
                        <input type="submit" value="Submit" data-testid="submit" />
                    </form>
                )
            }

            const { getByTestId, queryByText } = render(<Test />);
            await user.click(getByTestId("submit"));
            expect(queryByText("required")).toBeInTheDocument();
        })

        it("supports void-returning validators", async () => {
            // There's no practical reason for a user to write this, but they may be in this state while they're
            // in the middle of writing a validator. It's annoying for TypeScript to say "that isn't valid" when the only
            // problem is that it doesn't do anything useful yet. We should just accept it.
            let submitCalled = false;
            renderHook(() => {
                const form = useForm({
                    initialValues: { name: "" },
                    submit() {
                        submitCalled = true;
                    },
                    validate: {
                        name() {
                        }
                    }
                });
                form.submit();
            })
            await expect.poll(() => submitCalled, { timeout: 1000 }).toBe(true);
        })

        it("supports validateOnBlur", async () => {
            function Test() {
                const form = useForm({
                    initialValues: {
                        address: { number: "", street: "", city: "" }
                    },
                    validate: {
                        address({ number, street, city }) {
                            if (!number.length || !street.length || !city.length) return "Incomplete";
                        }
                    },
                    validateOnBlur: true
                });

                const addressErrors = useFieldErrors(form("address"));
                return (
                    <form>
                        <Input field={form("address")("number")} data-testid="input" />
                        {
                            addressErrors.length ? <div>{ addressErrors.join(", ")} </div> : null
                        }
                    </form>
                )
            }
            const { getByTestId, queryByText } = render(<Test />);
            await user.type(getByTestId("input"), "123");
            expect(queryByText("Incomplete")).not.toBeInTheDocument();
            await user.type(getByTestId("input"), "{tab}");
            expect(queryByText("Incomplete")).toBeInTheDocument();
        })

        it("supports validateOnChange", async () => {
            function Test() {
                const form = useForm({
                    initialValues: { name: "" },
                    validate: {
                        name(name) {
                            if (name === "tom") return "nope";
                        }
                    },
                    validateOnChange: true
                });
                return (
                    <form>
                        <Input field={form("name")} data-testid="input" />
                        <FieldErrors field={form("name")}>{ err => err.join(",") }</FieldErrors>
                    </form>
                )
            }
            const { getByTestId, queryByText } = render(<Test />);
            const input = getByTestId("input");
            await user.type(input, "to");
            expect(queryByText("nope")).not.toBeInTheDocument();
            await user.type(input, "m");
            expect(queryByText("nope")).toBeInTheDocument();
            await user.type(input, "{backspace}".repeat(3));
            expect(queryByText("nope")).not.toBeInTheDocument();
        })
    });
})

// do nothing, just a target for "satisfies" expression without warnings at the call site
// @ts-ignore
function sink<T>(_value: T) {
}
