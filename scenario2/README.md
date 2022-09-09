# Todo app' example

## What is this ?

A very basic CRUD of todos lists to get a hang at Flask, which is ... broken.

This repo aims at providing examples of how to address an issue to peers about a code problem with:

- one bug on the frontend side (question 1)
- one bug on the backend side (question 2)

The idea here is to show how some minimal can be extracted from a codebase to reproduce an error.

### question 1: issue when deleting a list

- `docker compose up`
- go to `localhost` in your browser
- create a list of todos
- click on the todos list link
- add a todo in the list
- try to delete the list
- you should see a `Something went wrong!` feedback on the page

### question 2: issue when updating a list

- `docker compose up`
- go to `localhost` in your browser
- create a list of todos
- click on the todos list link
- add a todo in the list
- try to complete all todos the list by ticking the checkbox
- you should see a `Something went wrong!` feedback on the page
