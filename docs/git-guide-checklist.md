# Git Guide — Mastery Checklist

Working checklist matching the expansion plan in `git-guide-review.md`. Tick when you can do the item *and explain why*.

## 1 · Configure Git properly

### Identity & scopes
- [ ] Set global `user.name` / `user.email`; override per repo with `git config --local`
- [ ] Use `includeIf "gitdir:~/work/"` to swap identity per directory tree
- [ ] Know precedence: `--local` > `--global` > `--system`; verify with `git config --list --show-origin`
- [ ] Match `user.email` to GitHub verified emails so commits link to your account

### Safety & sanity defaults
- [ ] `pull.rebase` decided deliberately (`true` for linear history, `false`+`--ff-only` for conservative), not left at warning default
- [ ] `push.default current` + `push.autoSetupRemote true` (no more `-u` every time)
- [ ] `fetch.prune true` so deleted remote branches disappear locally
- [ ] `merge.conflictStyle zdiff3` so conflicts show the base version
- [ ] `rerere.enabled true` so repeated conflicts auto-resolve
- [ ] `core.autocrlf` set per OS with understanding of what it does
- [ ] `diff.algorithm histogram` for better rename-heavy diffs

### Credentials & signing
- [ ] Credential helper working (GCM / `gh auth setup-git` / SSH agent) — no tokens in remote URLs
- [ ] SSH signing keys configured, commits verifiable (`commit.gpgsign`, `gpg.format ssh`)
- [ ] `git log --show-signature` and GitHub's "Verified" badge understood

### Ignore files & hooks
- [ ] `.gitignore` vs `.git/info/exclude` vs global core.excludesfile — when each applies
- [ ] Un-track a file that was committed then ignored (`git rm --cached`)
- [ ] Install hooks via `init.templateDir` or `core.hooksPath` (pre-commit, pre-push)

## 2 · Rebase with confidence

### Mechanics
- [ ] Explain: rebase replays commits as **new objects** with new SHAs on a new base
- [ ] `git fetch origin && git rebase origin/main` to update a personal feature branch
- [ ] `git pull --rebase --autostash` daily habit configured as defaults
- [ ] State the golden rule: never rebase history that others have built on
- [ ] Know all three exits: `--continue`, `--skip` (drop current commit), `--abort` (full restore)

### Interactive rebase
- [ ] `git rebase -i origin/main`: pick / reword / squash / fixup / drop / edit
- [ ] Clean PRs with `git commit --fixup <sha>` + `git rebase -i --autosquash`
- [ ] Split one bloated commit via `edit` + `git reset HEAD^` + re-stage in pieces
- [ ] Run tests per commit with `exec npm test` lines
- [ ] Move a commit range with `--onto`

### Conflicts inside rebase
- [ ] Recognize rebase state: `git status` shows interactive rebase in progress; conflicts recur **per replayed commit**
- [ ] Inversion mastered: during rebase, `--ours` = the base branch, `--theirs` = the commit being replayed
- [ ] `git checkout --theirs <f>` when the incoming commit should win
- [ ] After resolving: `git add <f> && git rebase --continue` (never `git commit` mid-rebase unless using `edit`)
- [ ] `rerere` reviewed: same conflict on later replay auto-resolves

## 3 · Handle merge conflicts like a pro

### Triage
- [ ] Read status codes: `UU` both modified, `AA` both added, `DU`/`UD` delete-vs-modify, `AU`/`UA` unmerged add
- [ ] `git diff --name-only --diff-filter=U` to list conflicted files
- [ ] `git log --merge -p <file>` to see both sides' intent + merge base

### Resolve
- [ ] Edit with `zdiff3` markers: base between `|||||||` and `=======`
- [ ] Whole-file wins: `git checkout --ours <f>` / `--theirs <f>` (merge context: ours = your branch)
- [ ] Strategy options for bulk: `git merge -X ours` / `-X theirs`
- [ ] Binary files: pick a side, regenerate, mark `.gitattributes` as `binary`
- [ ] Modify/delete: decide keep (`git add`) or remove (`git rm`)
- [ ] Rename/rename and directory rename conflicts understood
- [ ] `git mergetool` set up with a real tool (meld / difftastic / vscode)
- [ ] `git rerere` records the resolution; `git rerere forget <f>` discards a wrong one

### Finish
- [ ] Merge: `git add -A && git commit` (or `git merge --continue`)
- [ ] Cherry-pick conflicts: `--continue` / `--skip` / `--abort`
- [ ] `git merge --abort` / `git rebase --abort` return exactly to pre-operation state
- [ ] Never resolve with `git checkout --conflict=merge` forgotten — inspect `<<<<<<<` remnants with `git diff --check`

## 4 · Merge & push after rebasing

### Understand the rejection
- [ ] Reproduce and explain `non-fast-forward was rejected` after rewriting pushed commits
- [ ] Explain why remote has "commits you don't have" (old SHAs still there)

### Publish safely
- [ ] `git push --force-with-lease` on **personal/PR branches** — and why bare `git push -f` is forbidden (clobbers unseen teammate work)
- [ ] Know `--force-if-includes` / that lease compares your `origin/…` ref to the remote tip
- [ ] Protected branches (`main`): force-push blocked by design; landing rewrites requires PR merge, never direct push
- [ ] Announce rewritten PR branches; reviewers re-fetch with
      `git fetch && git checkout pr-branch && git reset --hard origin/pr-branch`

### Land the PR
- [ ] Choose consciously: **Merge commit** (preserve topology) / **Squash** (linear `main`, default for teams) / **Rebase & merge** (clean per-commit history, no merge commit)
- [ ] Rebase onto latest `main` **before** hitting merge so CI tests the merged result
- [ ] After merge: delete branch, `git fetch --prune`, switch to `main`, `git pull`
- [ ] Hotfix back-port: `git switch -c backport/x release-1.2 && git cherry-pick <sha> && git push -u`

### If force-push went wrong
- [ ] `git reflog` at origin isn't local — but your own reflog + GitHub's branch/PR event history locate the pre-rewrite tip
- [ ] `git branch rescue <sha>` immediately; ask collaborators not to push until rebased
- [ ] Admin recovery via GitHub push logs / support for non-local cases

## 5 · Difficult scenarios

### Detached HEAD
- [ ] Recognize: `git status` warns detached; `git log` shows no branch
- [ ] Save work: `git switch -c save/<name>` then rebase onto target
- [ ] Leave: `git switch main` (uncommitted edits may need `git stash` first)

### Rescue
- [ ] `git reflog` → `git reset --hard HEAD@{n}` for lost commits, bad `reset`, failed rebase
- [ ] `ORIG_HEAD` (`git reset --hard ORIG_HEAD`) right after a scary operation
- [ ] `git stash list`, `git fsck --lost-found` as second resorts
- [ ] Dropped stash: `git fsck --unreachable | grep commit` then `git stash apply <sha>`

### Undo pushed history
- [ ] Amend last pushed commit: `--amend` + `--force-with-lease` (personal branch only)
- [ ] Revert a normal commit: `git revert <sha>` (safe, adds new commit)
- [ ] Revert a merge: `git revert -m 1 <merge-sha>`; know the gotcha that re-merging the old branch won't re-apply changes without reverting the revert
- [ ] Wrong author across commits: `git rebase -i … --exec 'git commit --amend --reset-author --no-edit'`

### Repo hygiene
- [ ] Secret committed: revoke credential first, then `git filter-repo` / BFG before sharing history
- [ ] Big files: `git lfs track "pattern"`, strip with `filter-repo --strip-blobs-bigger-than 10M`
- [ ] `git fsck` on suspected corruption; healthy remote + re-clone as fastest fix
- [ ] `git worktree add` for risky experiments and urgent branch switches without stash

## 6 · Guide authoring (for the site itself)

- [ ] P0: complete `index.html` + `vercel.json` live on `master` (merge fix branch)
- [ ] P0: new section "After the rebase: merging & pushing safely" with non-fast-forward error shown verbatim
- [ ] P1: conflicts section rebuilt around zdiff3 + ours/theirs + inversion callout + completion matrix
- [ ] P1: standalone rebasing section (model → interactive → autosquash → conflicts → golden rule)
- [ ] P1: setup expanded to full configuration (scopes, safety defaults, signing, hooks)
- [ ] P2: 12 difficult-scenario cards (symptom / diagnosis / fix / prevention)
- [ ] P2: cheat-sheet Rebase & Publish groups; 4+ new quiz items
- [ ] Every command rendered with existing copy-button; tone stays mechanism-first, no man-page walls
