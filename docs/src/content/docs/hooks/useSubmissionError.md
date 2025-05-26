---
title: useSubmissionError
description: A Formula hook to monitor submission errors
slug: hooks/useSubmissionError
---

```typescript
function useSubmissionError(form: Form<any>): Error | undefined
```

`useSubmissionError` accepts a form and returns the
[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) that was thrown when the
form was last submitted, or `undefined`.

If a non-Error was thrown, then the value which was thrown will be wrapped in an Error and
[Error#cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) will be set.

## Sample usage

```typescript jsx
const form = useForm({
   //... 
});
const submissionError = useSubmissionError(form);
//^? Error | undefined
if (submissionError) {
    return <div>There was an error</div>
}
```
