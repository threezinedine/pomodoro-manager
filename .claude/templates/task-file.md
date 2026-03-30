# Guidance for Creating the Task List File

To make the workflow easy to follow, create a task list file at `design/tasks.md`. This file tracks all tasks and their statuses, and is updated throughout the design and implementation process.

**Note:** Each time the commands inside `commands/` are executed, the `design/tasks.md` file should be updated to reflect the current state of tasks. This ensures that the task list remains an accurate source of truth for project progress.

---

## File Location

```plaintext
design/
└── tasks.md
```

---

## Format

The task list uses a plain-text checklist format:

```markdown
- [x] ~~1. Description of task 1~~
    - [x] ~~1.1 Subtask 1.1~~
    - [x] ~~1.2 Subtask 1.2~~

- [ ] 2. Description of task 2
    - [ ] 2.1 Subtask 2.1
        - [x] ~~2.1.1 Subtask 2.1.1~~
        - [ ] 2.1.2 Subtask 2.1.2
    - [ ] 2.2 Subtask 2.2

- [ ] 3. Description of task 3
```

---

## Syntax Rules

| Symbol     | Meaning                                               |
| ---------- | ----------------------------------------------------- |
| `[ ]`      | Incomplete task                                       |
| `[x]`      | Completed task                                        |
| `~~text~~` | Strikethrough on completed items (for visual clarity) |

---

## Conventions

- **Subtasks** are indented under their parent task using spaces.
- **Completed tasks** should be marked `[x]` **and** struck through with `~~`. This makes it easy to scan the list visually.
- **Update regularly** — keep the file in sync with actual progress to serve as a reliable reference.
- **The task list is the source of truth** for what has been done and what remains. Refer to it when diving into implementation details or reporting project status.
- **Note:** All tasks which are listed inside this file must be tickable, not just `-` items.
- **Note:** Manage the task list in task and subtask, have multiple levels of subtasks if needed, but make sure the indentation is clear and consistent (add task number like 1, 1.1, 1.1.1), make sure the file contains only the tickable tasks `- [ ] <task-id>. <task-description>`.
