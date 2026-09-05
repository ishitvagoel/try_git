# Git Guide — Mastery Checklist

Working checklist matching the expansion plan in `git-guide-review.md`. Tick when you can do the item *and explain why*.

## 1 · Configure Git properly

### Identity & scopes
- [x] Set global `user.name` / `user.email`; override per repo with `git config --local`
- [x] Use `includeIf "gitdir:~/work/"` to swap identity per directory tree
- [x] Know precedence: `--local` > `--global` > `--system`; verify with `git config --list --show-origin`
- [x] Match `user.email` to GitHub verified emails so commits link to your account

### Safety & sanity defaults
- [x] `pull.rebase` decided deliberately (`true` for linear history, `false`+`--ff-only` for conservative), not left at warning default
- [x] `push.default current` + `push.autoSetupRemote true` (no more `-u` every time)
- [x] `fetch.prune true` so deleted remote branches disappear locally
- [x] `merge.conflictStyle zdiff3` so conflicts show the base version
- [x] `rerere.enabled true` so repeated conflicts auto-resolve
- [ ] `core.autocrlf` set per OS with understanding of what it does
- [ ] `diff.algorithm histogram` for better rename-heavy diffs

### Credentials & signing
- [x] Credential helper working (GCM / `gh auth setup-git` / SSH agent) — no tokens in remote URLs
- [x] SSH signing keys configured, commits verifiable (`commit.gpgsign`, `gpg.format ssh`)
- [ ] `git log --show-signature` and GitHub's "Verified" badge understood

### Ignore files & hooks
- [ ] `.gitignore` vs `.git/info/exclude` vs global core.excludesfile — when each applies
- [ ] Un-track a file that was committed then ignored (`git rm --cached`)
- [x] Install hooks via `init.templateDir` or `core.hooksPath` (pre-commit, pre-push)

## 2 · Rebase with confidence

### Mechanics
- [x] Explain: rebase replays commits as **new objects** with new SHAs on a new base
- [x] `git fetch origin && git rebase origin/main` to update a personal feature branch
- [x] `git pull --rebase --autostash` daily habit configured as defaults
- [x] State the golden rule: never rebase history that others have built on
- [x] Know all three exits: `--continue`, `--skip` (drop current commit), `--abort` (full restore)

### Interactive rebase
- [x] `git rebase -i origin/main`: pick / reword / squash / fixup / drop / edit
- [x] Clean PRs with `git commit --fixup <sha>` + `git rebase -i --autosquash`
- [x] Split one bloated commit via `edit` + `git reset HEAD^` + re-stage in pieces
- [x] Run tests per commit with `exec npm test` lines
- [x] Move a commit range with `--onto`

### Conflicts inside rebase
- [ ] Recognize rebase state: `git status` shows interactive rebase in progress; conflicts recur **per replayed commit**
- [x] Inversion mastered: during rebase, `--ours` = the base branch, `--theirs` = the commit being replayed
- [x] `git checkout --theirs <f>` when the incoming commit should win
- [x] After resolving: `git add <f> && git rebase --continue` (never `git commit` mid-rebase unless using `edit`)
- [x] `rerere` reviewed: same conflict on later replay auto-resolves

## 3 · Handle merge conflicts like a pro

### Triage
- [x] Read status codes: `UU` both modified, `AA` both added, `DU`/`UD` delete-vs-modify, `AU`/`UA` unmerged add
- [x] `git diff --name-only --diff-filter=U` to list conflicted files
- [ ] `git log --merge -p <file>` to see both sides' intent + merge base

### Resolve
- [x] Edit with `zdiff3` markers: base between `|||||||` and `=======`
- [x] Whole-file wins: `git checkout --ours <f>` / `--theirs <f>` (merge context: ours = your branch)
- [ ] Strategy options for bulk: `git merge -X ours` / `-X theirs`
- [x] Binary files: pick a side, regenerate, mark `.gitattributes` as `binary`
- [x] Modify/delete: decide keep (`git add`) or remove (`git rm`)
- [x] Rename/rename and directory rename conflicts understood
- [x] `git mergetool` set up with a real tool (meld / difftastic / vscode)
- [x] `git rerere` records the resolution; `git rerere forget <f>` discards a wrong one

### Finish
- [x] Merge: `git add -A && git commit` (or `git merge --continue`)
- [x] Cherry-pick conflicts: `--continue` / `--skip` / `--abort`
- [x] `git merge --abort` / `git rebase --abort` return exactly to pre-operation state
- [x] Never resolve with `git checkout --conflict=merge` forgotten — inspect `<<<<<<<` remnants with `git diff --check`

## 4 · Merge & push after rebasing

### Understand the rejection
- [x] Reproduce and explain `non-fast-forward was rejected` after rewriting pushed commits
- [x] Explain why remote has "commits you don't have" (old SHAs still there)

### Publish safely
- [x] `git push --force-with-lease` on **personal/PR branches** — and why bare `git push -f` is forbidden (clobbers unseen teammate work)
- [x] Know `--force-if-includes` / that lease compares your `origin/…` ref to the remote tip
- [x] Protected branches (`main`): force-push blocked by design; landing rewrites requires PR merge, never direct push
- [ ] Announce rewritten PR branches; reviewers re-fetch with
      `git fetch && git checkout pr-branch && git reset --hard origin/pr-branch`

### Land the PR
- [x] Choose consciously: **Merge commit** (preserve topology) / **Squash** (linear `main`, default for teams) / **Rebase & merge** (clean per-commit history, no merge commit)
- [x] Rebase onto latest `main` **before** hitting merge so CI tests the merged result
- [x] After merge: delete branch, `git fetch --prune`, switch to `main`, `git pull`
- [x] Hotfix back-port: `git switch -c backport/x release-1.2 && git cherry-pick <sha> && git push -u`

### If force-push went wrong
- [x] `git reflog` at origin isn't local — but your own reflog + GitHub's branch/PR event history locate the pre-rewrite tip
- [x] `git branch rescue <sha>` immediately; ask collaborators not to push until rebased
- [x] Admin recovery via GitHub push logs / support for non-local cases

## 5 · Difficult scenarios

### Detached HEAD
- [x] Recognize: `git status` warns detached; `git log` shows no branch
- [x] Save work: `git switch -c save/<name>` then rebase onto target
- [x] Leave: `git switch main` (uncommitted edits may need `git stash` first)

### Rescue
- [x] `git reflog` → `git reset --hard HEAD@{n}` for lost commits, bad `reset`, failed rebase
- [x] `ORIG_HEAD` (`git reset --hard ORIG_HEAD`) right after a scary operation
- [x] `git stash list`, `git fsck --lost-found` as second resorts
- [x] Dropped stash: `git fsck --unreachable | grep commit` then `git stash apply <sha>`

### Undo pushed history
- [x] Amend last pushed commit: `--amend` + `--force-with-lease` (personal branch only)
- [x] Revert a normal commit: `git revert <sha>` (safe, adds new commit)
- [x] Revert a merge: `git revert -m 1 <merge-sha>`; know the gotcha that re-merging the old branch won't re-apply changes without reverting the revert
- [x] Wrong author across commits: `git rebase -i … --exec 'git commit --amend --reset-author --no-edit'`

### Repo hygiene
- [x] Secret committed: revoke credential first, then `git filter-repo` / BFG before sharing history
- [x] Big files: `git lfs track "pattern"`, strip with `filter-repo --strip-blobs-bigger-than 10M`
- [x] `git fsck` on suspected corruption; healthy remote + re-clone as fastest fix
- [x] `git worktree add` for risky experiments and urgent branch switches without stash

## 6 · Guide authoring (for the site itself)

- [x] P0: complete `index.html` + `vercel.json` live on `master` (merge fix branch)
- [x] P0: new section "After the rebase: merging & pushing safely" with non-fast-forward error shown verbatim
- [x] P1: conflicts section rebuilt around zdiff3 + ours/theirs + inversion callout + completion matrix
- [x] P1: standalone rebasing section (model → interactive → autosquash → conflicts → golden rule)
- [x] P1: setup expanded to full configuration (scopes, safety defaults, signing, hooks)
- [x] P2: 12 difficult-scenario cards (symptom / diagnosis / fix / prevention)
- [x] P2: cheat-sheet Rebase & Publish groups; 4+ new quiz items
- [x] Every command rendered with existing copy-button; tone stays mechanism-first, no man-page walls
