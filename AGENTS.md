# Build delivery

Deliver completed builds through `https://github.com/mefforts/idleordungeoneer` on `main`. Routine build commits and pushes are authorized; do not ask for confirmation again. Preserve remote changes and never force-push over other work.

1. Build the standalone game and run the checks appropriate to the changes. Keep the existing game and progression intact unless the task changes them.
2. Update `downloads/Idle_or_Dungeoneer_Latest.zip` when the game changes. Package only the built `index.html` and brief launch instructions. Verify ZIP integrity and that its HTML matches the build exactly. Keep the README download link current.
3. Review the exact staged paths and diff before every push. Stage intended project files explicitly. Publish game source, required assets, tests, public documentation and safe previews only.
4. Exclude credentials, tokens, private keys, real environment configuration, personal save exports, personal information, local diagnostics, chat exports and private notes. Environment examples must contain placeholders only. Check tracked files as well: `.gitignore` cannot protect files already tracked. Never print suspected secret values in reports.
5. If private data or credentials are found, remove them from the proposed push and report the issue without exposing values. A credential already in public history requires remediation; deleting its current file alone is insufficient. Stop a push that would expose unresolved private data.
6. Commit the reviewed changes, push to GitHub and verify the remote commit. For changed builds, verify the GitHub ZIP download matches the local archive. Return the GitHub repository and direct ZIP links as the primary delivery; do not rely on chat attachment or preview links.

Public GitHub Pages hosting for this game at `https://mefforts.github.io/idleordungeoneer/` is authorized, including publishing the current build and automatically updating the website from future builds on `main`. Serve the standalone root `index.html` as a static site. Routine build pushes may trigger this deployment; do not ask for confirmation again.

This authorization does not include publishing cloud environment drafts, deploying other websites, or changing repository visibility. Keep machine-specific setup and private runtime details out of this public repository.
