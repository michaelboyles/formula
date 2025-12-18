---
title: IsBlurred
description: A component for monitoring the blur status of a Formula field
slug: components/IsBlurred
---

`<IsBlurred>` subscribes to the blur status of the given field and exposes it to a render prop. You can
use it to watch the blur status without introducing unnecessary rerenders.

The counterpart hook is [`useIsBlurred`](/formula/hooks/useIsBlurred).

## Sample usage

```tsx
const form = useForm({
    initialValues: { name: "" },
});
return (
    <form onSubmit={form.submit}>
        Name: <Input field={form("name")} />
        Blurred? <IsBlurred>{ isBlurred => isBlurred ? "yes" : "no" }</IsBlurred>
    </form>
)
```

## Type

```typescript
function IsBlurred(props: {
    // The field to watch the blur status for
    field: FormField<any>
    // A render function which will be passed the blur status
    children: (isBlurred: boolean) => ReactNode
}): ReactNode
```
