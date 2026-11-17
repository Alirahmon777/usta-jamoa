---
name: dashboard
description: Open the live usta dashboard in the browser to watch /usta:task agents, phases, models, tokens and cost as they run.
argument-hint: "[--port N]"
allowed-tools: Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/dashboard.mjs*)
---
Start the dashboard server from the project root, in the background (Bash with `run_in_background: true`),
so this session stays free for `/usta:task`:

`node ${CLAUDE_PLUGIN_ROOT}/scripts/dashboard.mjs --open $ARGUMENTS`

Read its first output line and give the human the URL it prints (normally http://localhost:4517/dashboard),
in one or two lines in their language. Say that the page updates by itself every 2 seconds while a
`/usta:task` runs in this project, and shows the last task when nothing is running.
If it prints "already running", just give that URL. Do nothing else.
