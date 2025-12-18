---
title: IsChanged
description: A component for monitoring the change status of a Formula field
slug: components/IsChanged
---

`<IsChanged>` subscribes to the changed status of the given field and exposes it to a render prop. You can
use it to watch the change status without introducing unnecessary rerenders.

The counterpart hook is [`useIsChanged`](/formula/hooks/useIsChanged).

## Sample usage

```tsx
const form = useForm({
    initialValues: { name: "" },
});
return (
    <form onSubmit={form.submit}>
        Name: <Input field={form("name")} />
        Changed? <IsChanged>{ isChanged => isChanged ? "yes" : "no" }</IsChanged>
    </form>
)
```

## Type

```typescript
function IsChanged(props: {
    // The field to watch the change status for
    field: FormField<any>
    // A render function which will be passed the change status
    children: (isChanged: boolean) => ReactNode
}): ReactNode
```
