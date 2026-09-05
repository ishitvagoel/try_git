# Deep Review — "git, decoded" (Vercel-hosted Git guide)

**Reviewed artifact:** `index.html` from `origin/cursor/fix-git-site-deploy-d520` (61,838 bytes, 10 sections, plus `vercel.json`).
**Review date:** 2026-09-05
**Reviewer goal:** assess whether the guide is comprehensive enough to teach proper Git configuration, difficult scenarios, rebasing, merge-conflict handling, and merging/pushing after rebasing — and produce a concrete expansion plan.

---

## 1. Executive summary

The current site is an **excellent beginner-to-intermediate primer**: ranked-by-usage commands, clean mental model (snapshots/pointers/objects), a tidy conflicts section, quiz, and cheat sheet. It is well-designed and progressive-disclosure friendly.

It is **not yet comprehensive**. The three areas the brief calls out are thinly covered or absent:

| Topic | Current state | Verdict |
|---|---|---|
| Proper Git configuration | 3 `git config` lines in Setup (identity, default branch, pull.rebase, one alias) | ⚠️ Starter-level only |
| Rebasing | 3 command occurrences (`rebase origin/main`, `--abort`, `--continue`); no interactive rebase | ❌ Major gap |
| Merge conflicts | Markers + 3-step resolution + abort | ⚠️ Covers the happy path only |
| Merging/pushing after rebase | Not covered anywhere | ❌ Critical gap |
| Difficult scenarios | `reflog` and `reset` appear once in the cheat sheet | ❌ Missing |

**Blocking repo-level finding:** `master` still holds the **truncated 20,005-byte copy** of `index.html`; the complete 61.8 KB guide with `vercel.json` lives only on `cursor/fix-git-site-deploy-d520`. Until that branch is merged, the default branch of this repo does not match what the guide is supposed to serve. This must be resolved first (P0 below).

---

## 2. Method

1. Inventoried all 10 sections on the fix branch (`setup`, `usage`, `internals`, `glossary`, `commands`, `workflows`, `conflicts`, `quiz`, `cheatsheet` + hero).
2. Extracted every `git …` command occurrence and frequency-ranked coverage to find blind spots (results in §3).
3. Compared coverage against the four required competencies (configuration, rebasing, conflicts, post-rebase merge/push) and against difficult-scenario material (git-scm book chapters 5, 6, 7, 9; Pro Git; Atlassian rebase guide; GitHub flow docs).

### Command coverage evidence (from extraction)

Well covered: `status` `add` `commit` `diff` `switch` `push -u` `fetch` `pull --ff-only` `restore` `stash -u` `reset --soft HEAD~1` `log --graph` `blame` `show` `reflog` (cheat sheet) `bisect start` (commands list only).

Barely present: `rebase` (3), `cherry-pick` (2), `mergetool`/`rerere`/`worktree`/`fsck` (0), `push --force-with-lease` (0), `config` beyond basics (0).

Absent entirely: interactive rebase, `--onto`, `diff3`/`zdiff3`, `checkout --ours/--theirs`, `merge -X`, `revert -m`, sign-off/signing, hooks, `LFS`/`filter-repo`, detached HEAD, `--autostash`, protected-branch etiquette.

---

## 3. Per-section assessment

### 3.1 Setup (`#setup`) — grade B−
Current: install one-liners; `user.name/email`; `init.defaultBranch main`; `pull.rebase false`; `alias.lg`; `init`/`clone`; verify with `config --list --show-origin`.

Correct and well-framed, but "proper Git configuration" needs scopes and safety knobs:

- **Config scopes**: `--system` / `--global` / `--local` precedence, `include.path`, `includeIf "gitdir:~/work/"` for per-org identity.
- **Identity hygiene**: matching `user.email` to GitHub account, `git config user.name` per repo, fixing wrong authorship after the fact.
- **Safety defaults worth making global**:
  ```
  git config --global pull.rebase true        # or 'false' + 'ff only' — teach the trade-off
  git config --global push.default current
  git config --global push.autoSetupRemote true
  git config --global fetch.prune true
  git config --global merge.conflictStyle zdiff3
  git config --global rerere.enabled true
  git config --global rerere.autoupdate true
  git config --global commit.gpgsign false    # then teach signing separately
  git config --global core.autocrlf input     # + Windows guidance
  git config --global core.editor …
  git config --global diff.algorithm histogram
  git config --global color.ui auto
  ```
- **Credential helpers**: GCM on Windows/macOS/Linux, SSH keys, `gh auth login`, PAT vs SSH trade-off.
- **Commit signing**: SSH (`gpg.format ssh`) and GPG, `verifysignature`.
- **`.gitignore` strategy**: global ignore file, `.git/info/exclude`, not ignoring tracked files.
- **Hooks**: pre-commit / commit-msg / pre-push, `core.hooksPath`, `git config --global init.templateDir` for auto-installing hooks.

### 3.2 Internals / Glossary / Commands — grade A−
Keep as-is; add glossary entries for: `upstream`, `fast-forward`, `non-fast-forward`, `force-with-lease`, `orphan`, `cherry-pick`, `rebase --onto`, `rerere`, `detached HEAD`, `reflog`, `HEAD@{n}`, `diff3`, `merge base`, `octopus merge`, `worktree`, `bisect`, `pre-image`.

### 3.3 Workflows (`#workflows`) — grade C+
Current: feature branch + PR, hotfix, "update your branch" (fetch + `rebase origin/main` **or** `merge origin/main`).

Gaps:
- No guidance on **when to pick rebase vs merge** for that step (personal branch → rebase; shared branch → merge).
- No **fork workflow** (`git remote add upstream`, `fetch upstream`, `rebase upstream/main`, `push --force-with-lease` to your fork's PR).
- No **commit-hygiene** step before PR: `git rebase -i origin/main` to squash `wip`/`fixup` commits, `git commit --fixup` + `--autosquash`.
- No **PR review round-trips**: address comments → `git commit --fixup <sha>` → `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash origin/main` → `git push --force-with-lease`.

### 3.4 Conflicts (`#conflicts`) — grade C
Current: marker anatomy (`<<<<<<< ======= >>>>>>>`), see-conflicted → edit → `add` → `merge --continue`/`rebase --continue`, abort.

Gaps to fill (see full spec in §4.2): conflict styles, `--ours/--theirs` (including the **rebase inversion** — the single most confusing fact about conflicts and the guide never mentions it), add/add, modify/delete, rename/delete, binary files, `git mergetool`, `rerere`, bulk triage, and a **conflict-inside-rebase** walkthrough (replay-per-commit loop, `--skip`, `git checkout --theirs` per iteration).

---

## 4. Expansion plan (research-backed spec)

### 4.1 New section: "Rebasing, properly" (`#rebasing`)

1. **Model first** (matches site's internals philosophy): rebase = replay commits onto a new base; every replayed commit is a **new object with a new SHA**. This single fact explains force-push necessity, reflog recovery, and the golden rule.
2. **Safe-by-default rules**:
   - Rebase only **local/personal** history (the "golden rule": never rebase anything already pulled by others).
   - `git pull --rebase --autostash` as a configured default (`pull.rebase true`, `rebase.autostash true`).
   - Always know your safety net: `git rebase --abort`, `ORIG_HEAD`, `git reflog` + `git reset --hard <pre-rebase-sha>`.
3. **Interactive rebase** `git rebase -i origin/main`: pick/reword/squash/fixup/drop/edit, `--autosquash` with `git commit --fixup`, `exec` lines for per-commit tests, `r` to reorder, `git rebase --continue` after `edit`.
4. **Surgery**: `--onto` (move a sub-range of commits; salvage branch after partial revert), splitting commits (`edit` + `reset HEAD^` + re-add), cherry-pick as alternative to range rebase.
5. **Conflicts during rebase**: per-commit replay; `status` shows `rebase in progress` + `You must edit all merge conflicts`; use `--theirs` = the commit being replayed, `--ours` = the base you're rebasing onto (**inverted** vs merge); `git rebase --skip` to drop the commit being replayed.
6. **Rebasing merges**: `--rebase-merges` (and when to just use `merge` instead).
7. **When NOT to rebase**: shared branches, PRs others have checked out, protected branches — merge or let maintainer squash-merge instead.

### 4.2 Expanded conflicts section (`#conflicts`, rewrite in place)

1. `merge.conflictStyle zdiff3` with annotated base version (teaches *why* both sides diverged).
2. Triage commands: `git diff --name-only --diff-filter=U`, `git status --short` (`UU`, `AA`, `DU`, `UD`, `AU`, `UA` table).
3. Whole-file strategies: `git checkout --ours <f>` / `--theirs <f>` (+ rebase inversion call-out), `git merge -X ours/theirs` for import flows, `git restore --merge`.
4. Structural conflicts: add/add, modify/delete, rename/rename, directory rename; binary files (`git checkout --ours`, regenerate, `.gitattributes binary`).
5. Tooling: `git mergetool` (difftastic/meld/vscode setup), `git config --global mergetool.keepBackup false`.
6. `rerere`: enable, record, review (`git rerere status/diff`), forget; the "resolve the same conflict twice, get it for free" story.
7. Completion matrix:

   | In progress after | Resolve | Continue | Bail out |
   |---|---|---|---|
   | merge | `git add` all | `git commit` (or `merge --continue`) | `git merge --abort` |
   | rebase | `git add` all | `git rebase --continue` | `git rebase --abort` |
   | cherry-pick | `git add` all | `git cherry-pick --continue` | `git cherry-pick --abort` |
   | stash pop | resolve manually | changes already applied; `git stash drop` | — |

### 4.3 New section: "After the rebase: merging & pushing safely" (`#pushing-after-rebase`)

1. Why plain `git push` fails after a rebase: rewritten SHAs → remote branch has commits you no longer have → **non-fast-forward rejection** (show the exact error text).
2. `git push --force-with-lease` (alias `--force-if-includes` discussion): refuses to clobber upstream work you haven't seen. **Never** bare `git push -f` on a shared branch.
3. Force-push etiquette for personal PR branches: warn reviewers, push, comment on the PR ("rebased onto `<sha>`, history rewritten — refetch with `git fetch && git checkout pr && git reset --hard origin/pr`").
4. Protected branches: GitHub blocks force-push to `main`; if a protected branch is broken by someone else's force-push, recovery is coordinated via reflog, not more force-pushes.
5. Updating a teammate's local copy after your rewrite:
   ```
   git fetch origin
   git checkout feature/x
   git reset --hard origin/feature/x
   ```
   (or `git pull --rebase` only if you still have unique local commits).
6. Landing the PR — the three GitHub buttons, and what history each produces:
   - **Create a merge commit** — preserves branch topology; use when review history matters.
   - **Squash and merge** — linear `main`; recommended default for most teams; rebase-your-branch first so the squash message is clean.
   - **Rebase and merge** — replays each commit on `main` without a merge commit; requires fast, conflict-free rebase; loses PR grouping metadata.
7. Post-merge cleanup: delete branch, `git fetch --prune`, back-porting hotfixes (`git cherry-pick` + PR), syncing your stale fork.
8. Failure drill: you force-pushed the wrong thing → `git reflog` → `git branch rescue <sha>`; the old commits are unreachable but alive until `gc` (≈30–90 days).

### 4.4 New section: "Difficult scenarios" (`#rescue`) — scenario cards

Each card: symptom → diagnosis → fix → prevention.

1. **Detached HEAD** — what it is (`git checkout <sha>`/PR checkout), keep the work (`git switch -c keep/…`), get out (`git switch main`).
2. **Lost commit / bad reset / broken rebase** — `git reflog`, `git reset --hard HEAD@{n}`, `git stash list` + `git fsck --lost-found`.
3. **Amend after push** — `git commit --amend` + `--force-with-lease`, PR branch only.
4. **Undo a pushed merge** — `git revert -m 1 <merge-sha>`; why the reverted branch can't just be re-merged (revert-of-revert dance).
5. **Wrong author email on history** — `git rebase -i --exec 'git commit --amend --reset-author --no-edit'`, or `git filter-repo` for big sweeps (+ coordination cost).
6. **Committed a secret** — revoke first (rotation beats removal), then `filter-repo`/BFG before any push; GitHub Secret Scanning.
7. **Oversized binary** — `git lfs track`, removing late large files from history, `filter-repo --strip-blobs-bigger-than`.
8. **Corrupted repo** — `git fsck`, re-clone from a healthy remote as the sane default.
9. **Submodule conflicts** — `git submodule update --init`, resolve the pointer by entering the submodule and checking out the right SHA.
10. **Cherry-pick a merge commit** — `-m 1`.
11. **Bisect a regression** — `git bisect start <bad> <good>`, `run` script, `reset`.
12. **Parallel work without clones** — `git worktree add ../feature-x feature/x` (also the safe way to try risky rebases while keeping your main checkout).

### 4.5 Cheat sheet & quiz updates

- Cheat sheet: add a **Rebase** group (`-i`, `--continue/--skip/--abort`, `--autosquash`, `--onto`) and a **Publish after rebase** group (`--force-with-lease`, reflog rescue); conflicts group gains `zdiff3`, `--ours/--theirs`, `mergetool`, `rerere`.
- Quiz: add questions on the rebase ours/theirs inversion, what `--force-with-lease` protects against, when a rebase-conflict `--theirs` points to the replayed commit, and choosing merge-vs-squash-vs-rebase for landing a PR.

---

## 5. Prioritized roadmap

| Priority | Work | Why first |
|---|---|---|
| **P0** | Merge `cursor/fix-git-site-deploy-d520` into `master` (or re-apply) so the complete guide + `vercel.json` ship on default branch; confirm Vercel deploys from `master` | The canonical content target must exist on the default branch |
| **P0** | Add §4.3 "After the rebase: merging & pushing safely" | Named in brief, zero current coverage, highest real-world damage potential |
| **P1** | Rewrite §4.2 conflicts (zdiff3, ours/theirs + inversion, completion matrix, rerere) | Named in brief; current version teaches happy path only |
| **P1** | Add §4.1 rebasing section | Named in brief; rebase is the #3 "power" command |
| **P1** | Expand Setup into §3.1 full configuration | "Proper git configurations" named in brief |
| **P2** | §4.4 scenario cards (prioritize: detached HEAD, reflog rescue, revert merge, secret removal) | High value, bigger surface |
| **P2** | Cheat sheet / quiz / glossary updates (§4.5) | Reinforcement layer |
| **P3** | Per-scenario interactive terminal demos (already stubbed `${s.name}` templating) | Nice-to-have, needs JS work |

**Content rules while expanding:** match the existing voice (short, mechanism-first, no man-page walls); every new command must be copyable via the existing copy-button pattern; keep the "ranked by usage" ordering story intact; no section may introduce a command it doesn't at least gloss.

---

## 6. Acceptance criteria

1. Reader finishing the guide can: configure Git safely from a fresh machine; rebase a feature branch onto updated `main` through conflicts using `zdiff3` and `rerere`; rewrite history on a PR branch and publish it with `--force-with-lease` without endangering a shared branch; land the PR choosing correctly between merge/squash/rebase; recover a lost commit via `reflog`.
2. Every command shown appears in the cheat sheet or is explicitly marked "power".
3. The quiz contains at least 4 questions from {rebase inversion, force-with-lease semantics, revert -m, merge-button choice}.
4. `master` is the deployed source of truth; Vercel preview + prod match.
