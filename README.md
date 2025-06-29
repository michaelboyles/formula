[![Build status](https://github.com/michaelboyles/formula/actions/workflows/build.yml/badge.svg)](https://github.com/michaelboyles/formula/actions/workflows/build.yml)
[![Release version](https://img.shields.io/github/v/release/michaelboyles/formula?sort=semver)](https://github.com/michaelboyles/formula/releases)
[![MIT license](https://img.shields.io/github/license/michaelboyles/formula)](https://github.com/michaelboyles/formula/blob/develop/LICENSE)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/michaelboyles/formula/raw/develop/docs/src/assets/logo-dark.svg">
  <img height="100" alt="Formula" src="https://github.com/michaelboyles/formula/raw/develop/docs/src/assets/logo-light.svg">
</picture>

Type-safe React forms

[**📖 Read the docs**](https://michaelboyles.github.io/formula/)

## Usage

```text
npm install @michaelboyles/formula
```

```tsx
function NewBlogPostPage() {
    const form = useForm({
        initialValues: {
            title: "",
            content: "",
            isDraft: false
        },
        submit: post => createNewPost(post)
    });
    return (
        <form onSubmit={form.submit}>
            <Input field={form("title")} />
            <TextArea field={form("content")} />
            <label>
                Draft?
                <Checkbox field={form("isDraft")} />
            </label>
            <button type="submit">Create post</button>
        </form>
    )
}
```
