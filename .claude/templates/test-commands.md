# Guidance for Creating the Test Commands File

This `design/test-commands.md` file is the place user can place some tests command which they are always need to be run and passed in `/execute` command.

This file is cruicial for `Test-driven development`, which can help user to make sure the implementation is correct and meet the requirements, and also can help user to catch the bugs early and fix them before they become bigger problems.

At the `/brain-storm`, create an initial file with the content:
```markdown
# Test Commands
Currently, there is no test command, you can add some test commands here which you want to be always run and passed in `/execute` command.
```

Then `/execute` no need to test anything.

But if the file has the content like this:
```markdown
# Test Commands

Run `uv run test` in the `server/` directory, must pass all tests.

```

Then in `/execute` command, you need to run the command `uv run test` in the `server/` directory, and make sure all tests are passed before you can say the implementation is correct and meet the requirements. If not, you need to report the test failure and fix the implementation until all tests are passed.

**Important**: Do not touch into this file (except creating it at the beginning), only the user can update this file to add some test commands, you just need to read the test commands from this file and run them in `/execute` command. This is because only the user can decide what tests are needed to be run and passed in `/execute` command, you just need to follow the instructions in this file to run the tests. Each time run `/execute` command, this file MUST be read to get the latest updated test commands, and run the tests accordingly. Do not make any assumptions or decisions on behalf of the user, just follow the instructions in this file to run the tests.
