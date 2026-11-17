---
name: budget
description: Human permission for the current usta task to spend more than its level budget. Only the user can run it.
disable-model-invocation: true
model: opus
---
The human allowed the active task to spend one more level budget (a hook recorded the new limit before
this message; if there were no active task, this command would have been blocked).

Continue the `usta:task` workflow (or `usta:resume`) from the step that hit the budget. If the human
wrote anything after the command, treat it as extra instructions for this run: $ARGUMENTS
