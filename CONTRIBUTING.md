# Contributing

We welcome community support with both pull requests and reporting bugs. Please
don't hesitate to jump in.

## Review others' work

Check out the list of outstanding pull requests if there is something you might
be interested in. Maybe somebody is trying to fix that stupid bug that bothers
you. Review the PR. Do you have any better ideas how to fix this problem? Let us
know.

## Issues

The issue tracker is the preferred channel for bug reports, features requests
and submitting pull requests, but please respect the following restrictions:

- Please do not use the issue tracker for personal support requests, contact contributors over github for support.
- Please do not open issues or pull requests regarding the code in React (open them in their respective repositories).

There are 2 options to open an issue, Bug report - Create a report to help us improve or open a blank issue, you can see all 2 options under the Issues tab after clicking on the new issue button.

_Note: Occasionally issues are opened that are unclear, or we cannot verify them. When the issue author has not responded to our questions for verification within 7 days then we will close the issue._

## Commit

Before making new commit's please check that you have installed and set up commitlint + husky + commitizen and configured them correctly.

## Tests

All commits that fix bugs or add features need a test.

## Code Style

Please adhere to the current code styling. We have included an `.editorconfig`
at the repo's root to facilitate uniformity regardless of your editor. See the
[editor config site][editorconfig] for integration details.

We use [ESLint][eslint] for all JavaScript Linting. There should be no linting
errors and no new warnings for new work. You are welcome to configure your
editor to use ESLint or the `pnpm run test` command will run unit tests and the
linter.

## Visual Changes

When making a visual change, please provide screenshots
and/or screencasts of the proposed change. This will help us to understand the
desired change easier.

## Docs

Please update the docs with any code logic changes, the code and docs should always be
in sync.

## Implement additional components and features

When creating new components please follow the atomic design principles we have implemented.
Check the src/components/(atoms, molecules, organism) structure we follow.

If you are adding any new Library that has a config file please add the config file to the src/app/config folder.
