Formula uses [semantic versioning](https://semver.org/).

Formula is currently pre-v1. It's relatively stable, but I expect there will be some breaking changes before v1.

# Unreleased 

- feat: hooks which accept fields now accept null-ish fields
- fix: useFieldData overload type issue

# 0.0.9

- feat: useFieldData accepts null-ish

# 0.0.8

- BREAKING CHANGE: useBlurred renamed to useIsBlurred
- feat: useIsChanged, `<IsChanged>`
- feat: `<IsBlurred>`
- feat: options for field#setData
- fix: form::reset not clearing field states (changed, blurred, errors)

# 0.0.7

- feat: export NumberInput

# 0.0.6

- BREAKING CHANGE: rename "value" to "data"
- feat: FormField::narrow

# 0.0.5

- feat: don't restrict form data to being an Object
- feat: improve console logs
- fix: form cannot be passed to useFieldValue
- fix: inconsistent behaviour with numeric object keys
- fix: false positive console error log
