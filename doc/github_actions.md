# Github actions

## Goal
*Automate* tasks on Github (tests, auto-format, etc..)

## Description
Actions are components of *Workflows* which are collection of
*responses to events*.
They are composed to *triggers* and *jobs* in response to them.

## Events
There are events for
[*many interactions*](https://docs.github.com/en/actions/reference/events-that-trigger-workflows)
with Github.

## Job
Sequence of steps(action or script) that require the success of the previous.
Jobs are by default independant of each other and run in parallel.

## Reusing actions
Actions from others can be referenced workflows (as a library).
They can be searched for in
[Github Marketplace](https://github.com/marketplace?type=actions)

## Runners
Actions run in machines provided by Github or ourselves.
They can be running either Linux(Ubuntu), Windows or MacOS

## Workflow Structure
Workflow are written in [YAML](https://en.wikipedia.org/wiki/YAML)

Example:
```yaml
name: learn-github-actions # Workflow name
on: [push] # Triggers
jobs:
  check-bats-version: # Action/job name
    runs-on: ubuntu-latest # Runner type
    steps:
     # Reused action from github
      - uses: actions/checkout@v3   # Fetch project
      - uses: actions/setup-node@v3 # owner/repo@ref
        with:
          node-version: '14'
      # Run commands
      - run: npm install -g bats
      - run: bats -v
```

## UI
Actions of a project can be inspected in the *Action* tab in a repository

## Expressions
Expressions can be used in `if` conditions and `env` descriptions
They are written as `${{ expression }}` in env

Expressions can be of type `boolean`, `null`, `number`, `string`, `array` or `object`

Various powerful functions are also available
- `contains`
- `startsWith`
- `endsWith`
- `format`
- `join`
- `toJSON`
- `fromJSON`

The control flow of the jobs can also be edited by `if` conditions using of the functions:
- `success()`
- `always()`
- `cancelled()`
- `failure()`

Objects and arrays can be filtered with the `.*` syntax

## Context

There are various *context*s that can be used to change way jobs execute.
A list of contexts can be found [here](https://docs.github.com/en/actions/learn-github-actions/contexts)
