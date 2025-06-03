// noinspection JSUnusedGlobalSymbols

import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input, type Props } from '../controls/Input.tsx';
import { useForm } from "../hooks/useForm.ts";
import { DebugField } from "../components/DebugField.tsx";

function InputWrapper(props: Omit<Props, "field">) {
    const form = useForm({
        initialValues: { value: "" }
    });
    return (
        <>
            <Input {...props} field={form("value")} />
            <DebugField field={form("value")} />
        </>
    )
}

const meta = {
    title: 'Controls/Input',
    component: InputWrapper,
    argTypes: {
        type: {
            control: "select",
            options: [
                "color", "date", "datetime", "email", "hidden", "month", "number", "password", "range", "search",
                "tel", "text", "time", "url", "week"
            ]
        },
    },
    args: {
        type: "text"
    }

} satisfies Meta<typeof InputWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
};
