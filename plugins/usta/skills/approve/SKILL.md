---
name: approve
description: Human approval of the current usta plan. Only the user can run it.
disable-model-invocation: true
model: opus
---
The human approved the plan of the active task (a hook recorded the approval before this message;
if there were no active task, this command would have been blocked).

Continue the `usta:task` workflow (or `usta:resume`, if that is what is running) from the
implement phase, following the phases of the task's level. If the human wrote anything after the
command, treat it as extra instructions for this run: $ARGUMENTS
