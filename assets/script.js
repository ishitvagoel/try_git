
document.documentElement.classList.add('js');

const USAGE = [
  {cmd:'git status', pct:98, tier:'daily', w:'98%'},
  {cmd:'git add', pct:96, tier:'daily', w:'96%'},
  {cmd:'git commit', pct:95, tier:'daily', w:'95%'},
  {cmd:'git push', pct:90, tier:'daily', w:'90%'},
  {cmd:'git pull', pct:88, tier:'daily', w:'88%'},
  {cmd:'git checkout / switch', pct:82, tier:'daily', w:'82%'},
  {cmd:'git branch', pct:74, tier:'weekly', w:'74%'},
  {cmd:'git log', pct:70, tier:'weekly', w:'70%'},
  {cmd:'git diff', pct:68, tier:'daily', w:'68%'},
  {cmd:'git merge', pct:55, tier:'weekly', w:'55%'},
  {cmd:'git stash', pct:48, tier:'weekly', w:'48%'},
  {cmd:'git rebase', pct:36, tier:'power', w:'36%'},
  {cmd:'git reset', pct:32, tier:'power', w:'32%'},
  {cmd:'git cherry-pick', pct:22, tier:'power', w:'22%'},
  {cmd:'git reflog', pct:18, tier:'power', w:'18%'},
];

const STAGES = [
  {name:'Working tree', sub:'your files', detail:'Edits live here as normal files. Git has not recorded them yet.', code:'git status · git diff'},
  {name:'Staging (index)', sub:'next snapshot', detail:'You choose what belongs in the next commit. Partial staging keeps history clean.', code:'git add · git add -p · git restore --staged'},
  {name:'Repository', sub:'object database', detail:'Commits, trees, and blobs under .git. Branches are labels pointing at commits.', code:'git commit · git log · git cat-file'},
];

const GLOSSARY = [
  {t:'HEAD', tag:'core', d:'Pointer to where you are — usually the current branch tip.'},
  {t:'branch', tag:'core', d:'A movable name for a commit. Creating one is cheap.'},
  {t:'commit', tag:'object', d:'A snapshot: metadata + root tree + parent(s).'},
  {t:'tree', tag:'object', d:'Directory map from names to blob/tree hashes.'},
  {t:'blob', tag:'object', d:'File contents only — no path, no mode metadata beyond the tree entry.'},
  {t:'index / staging', tag:'workflow', d:'Proposed next commit. Built with git add.'},
  {t:'remote', tag:'workflow', d:'A named URL to another repository, often origin.'},
  {t:'upstream', tag:'workflow', d:'The remote branch your local branch tracks for pull/push.'},
  {t:'fast-forward', tag:'workflow', d:'Merge that only moves a pointer — no divergent commits.'},
  {t:'rebase', tag:'workflow', d:'Replay commits onto a new base, rewriting their hashes.'},
  {t:'detached HEAD', tag:'safety', d:'HEAD points at a commit, not a branch. New commits can look “lost”.'},
  {t:'reflog', tag:'safety', d:'Local diary of where HEAD and branches have been — undo safety net.'},
  {t:'force-with-lease', tag:'safety', d:'Force-push that fails if the remote moved since you last fetched.'},
  {t:'merge commit', tag:'object', d:'Commit with two parents, joining histories.'},
  {t:'tag', tag:'object', d:'A (usually immutable) name for a commit — often releases.'},
  {t:'stash', tag:'workflow', d:'Temporary shelf for dirty working-tree changes.'},
  {t:'merge base', tag:'workflow', d:'Latest common ancestor of two refs — the “why” behind every conflict.'},
  {t:'non-fast-forward', tag:'safety', d:'Push rejected because the remote holds commits your history lacks — typical after rebasing.'},
  {t:'zdiff3', tag:'workflow', d:'Conflict style that also shows the shared base between ||||||| and =======.'},
  {t:'rerere', tag:'safety', d:'Reused Record Resolution — remembers how you solved a conflict and replays it.'},
  {t:'autosquash', tag:'workflow', d:'Rebase mode that slots fixup!/squash! commits under their targets.'},
  {t:'ORIG_HEAD', tag:'safety', d:'Pointer to where HEAD was before the last big move — a one-step undo.'},
  {t:'mainline parent', tag:'safety', d:'The -m side of a merge commit: the branch it was merged into. Revert and cherry-pick need it.'},
  {t:'worktree', tag:'workflow', d:'A second checkout sharing one object database — try risky things elsewhere.'},
  {t:'credential helper', tag:'setup', d:'Storefront between Git and your secrets — manager, gh, or SSH agent. Keeps tokens out of URLs.'}
];

const COMMANDS = [
  {name:'git status', tier:'daily', desc:'Show staged, unstaged, and untracked paths.', ex:'git status -sb'},
  {name:'git add', tier:'daily', desc:'Copy working-tree changes into the index.', ex:'git add -p'},
  {name:'git commit', tier:'daily', desc:'Create a new commit from the index.', ex:'git commit -m "explain why"'},
  {name:'git push', tier:'daily', desc:'Send commits to a remote and update its refs.', ex:'git push -u origin HEAD'},
  {name:'git pull', tier:'daily', desc:'Fetch then integrate remote changes into your branch.', ex:'git pull --ff-only'},
  {name:'git switch', tier:'daily', desc:'Move HEAD to another branch (or create with -c).', ex:'git switch -c feature/x'},
  {name:'git diff', tier:'daily', desc:'Show patches between trees, index, and worktree.', ex:'git diff --staged'},
  {name:'git log', tier:'weekly', desc:'Walk commit history with optional graph decoration.', ex:'git log --oneline --graph -20'},
  {name:'git branch', tier:'weekly', desc:'List, create, or delete branch refs.', ex:'git branch -vv'},
  {name:'git merge', tier:'weekly', desc:'Join another branch into the current one.', ex:'git merge origin/main'},
  {name:'git fetch', tier:'weekly', desc:'Download remote objects/refs without merging.', ex:'git fetch --prune'},
  {name:'git stash', tier:'weekly', desc:'Shelve dirty state to work on something else.', ex:'git stash -u'},
  {name:'git restore', tier:'weekly', desc:'Restore files in worktree or index from a known tree.', ex:'git restore --staged app.js'},
  {name:'git rebase', tier:'power', desc:'Reapply commits onto an updated base for linear history.', ex:'git rebase -i origin/main'},
  {name:'git reset', tier:'power', desc:'Move a branch pointer and optionally the index/worktree.', ex:'git reset --soft HEAD~1'},
  {name:'git cherry-pick', tier:'power', desc:'Copy a commit onto the current branch.', ex:'git cherry-pick abc1234'},
  {name:'git reflog', tier:'power', desc:'Recover commits after resets or bad checkouts.', ex:'git reflog'},
  {name:'git bisect', tier:'power', desc:'Binary-search history to find the commit that introduced a bug.', ex:'git bisect start'},
  {name:'git revert', tier:'weekly', desc:'Undo commits by applying their inverse — safe on shared history.', ex:'git revert -m 1 8f3a21c'},
  {name:'git config', tier:'weekly', desc:'Scoped settings that decide how every other command behaves.', ex:'git config --global pull.rebase true'},
  {name:'git mergetool', tier:'power', desc:'Walk conflicted files in a 3-way editor.', ex:'git mergetool'},
  {name:'git worktree', tier:'power', desc:'Another branch in another folder, same repository.', ex:'git worktree add ../try feature/x'},
  {name:'git fsck', tier:'power', desc:'Check object integrity; find unreachable commits.', ex:'git fsck --lost-found'},
  {name:'git lfs', tier:'power', desc:'Store large binaries outside history.', ex:'git lfs track "*.psd"'}
];

const QUIZ = [
  {q:'What does a Git commit store primarily?', opts:['A diff against the previous commit','A snapshot pointer to a tree of the project','Only changed filenames','The entire .git folder duplicated'], a:1, why:'Commits point at trees (snapshots). Unchanged content is reused via identical hashes.'},
  {q:'Creating a new branch typically…', opts:['Copies every file into a new folder','Creates a tiny ref pointing at a commit','Runs a full backup of the remote','Locks the repository'], a:1, why:'A branch is a pointer (about 41 bytes of hash text).'},
  {q:'git add prepares changes for…', opts:['The remote origin','The next commit via the index/staging area','Immediate push','Deleting the working tree'], a:1, why:'The index is the proposed next snapshot.'},
  {q:'Detached HEAD means…', opts:['Your remote is down','HEAD points directly at a commit, not a branch','Git deleted your branch','You must force-push'], a:1, why:'Fine for inspection; create a branch before making commits you want to keep.'},
  {q:'The safest common force-push option is…', opts:['--force','--force-with-lease','--hard','--no-verify'], a:1, why:'--force-with-lease refuses to overwrite unexpected remote commits.'},
  {q:'You hit a conflict mid-rebase. What does --theirs refer to?', opts:['The version from the commit being replayed','Your branch’s current version','The version on origin/main','The merge base'], a:0, why:'Rebase flips ours/theirs — you are building on the base (ours) and replaying your old commits (theirs).'},
  {q:'After rebasing an already-pushed branch, a plain git push fails because…', opts:['The remote still has the pre-rebase commits — non-fast-forward','You forgot -u','GitHub blocks rebased pushes','CI locks the branch'], a:0, why:'Rewritten SHAs mean the remote tip is no longer an ancestor of yours. Publish with --force-with-lease.'},
  {q:'What does --force-with-lease actually check?', opts:['That the remote tip equals what you last fetched','That tests passed','That your message is clean','Nothing — it is just a quieter -f'], a:0, why:'If someone pushed since your last fetch, the lease fails and their work is safe.'},
  {q:'A bad merge is already pushed to main. The safe undo is…', opts:['git revert -m 1 &lt;merge-commit&gt;','git reset --hard then push -f','delete and recreate main','git rebase --onto main'], a:0, why:'Revert adds history instead of rewriting shared history. -m 1 keeps the mainline parent.'},
  {q:'A long branch re-triggers the same conflict on every rebase. Enable…', opts:['rerere','LFS','bisect','worktree'], a:0, why:'Reused Record Resolution replays your earlier resolution automatically.'},
  {q:'Your team wants a strictly linear main with exactly one commit per PR. Land it with…', opts:['Squash and merge','Create a merge commit','Rebase and merge','Force-push'], a:0, why:'Squash collapses the PR to one clean commit; merge commits break linearity, rebase-and-merge keeps every (possibly messy) commit.'}
];

const TERM_SCENES = [
  [{cls:'', html:'<span class="p">➜</span> git status'}, {cls:'dim', html:'On branch main'}, {cls:'g', html:'nothing to commit, working tree clean'}],
  [{cls:'', html:'<span class="p">➜</span> git switch -c feature/pay'}, {cls:'c', html:"Switched to a new branch 'feature/pay'"}],
  [{cls:'', html:'<span class="p">➜</span> git add -p && git commit -m "feat: checkout"'}, {cls:'g', html:'[feature/pay 8f3a21c] feat: checkout'}],
  [{cls:'', html:'<span class="p">➜</span> git lg'}, {cls:'', html:'*<span class="y"> 8f3a21c</span> <span class="b">(HEAD → feature/pay)</span> feat: checkout'}, {cls:'', html:'*<span class="y"> 1a9c002</span> <span class="b">(main)</span> init'}],
];

/* Progress + nav */
const prog = document.getElementById('prog');
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
function onScroll(){
  const max = document.documentElement.scrollHeight - innerHeight;
  prog.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  nav.classList.toggle('scrolled', scrollY > 8);
}
addEventListener('scroll', onScroll, {passive:true}); onScroll();

burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  mobileNav.classList.toggle('open', !open);
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
}));

/* Active section highlighting */
const sectionIds = ['setup','usage','internals','glossary','commands','workflows','rebasing','conflicts','pushing','rescue','quiz','cheatsheet'];
const allNavLinks = [...document.querySelectorAll('.nav-links a, .mobile-nav a')];
const ioNav = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    allNavLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, {rootMargin:'-40% 0px -50% 0px', threshold:0});
sectionIds.forEach(id => { const el = document.getElementById(id); if (el) ioNav.observe(el); });

/* Reveal */
const ioReveal = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ioReveal.unobserve(e.target); } });
}, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
document.querySelectorAll('.reveal').forEach(el => ioReveal.observe(el));

/* Copy buttons */
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy');
  if (!btn) return;
  const text = btn.getAttribute('data-copy') || '';
  try { await navigator.clipboard.writeText(text); } catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  btn.classList.add('done'); btn.textContent = 'copied';
  setTimeout(() => { btn.classList.remove('done'); btn.textContent = 'copy'; }, 1200);
});

/* Usage bars */
const bars = document.getElementById('usageBars');
bars.innerHTML = USAGE.map((u,i) => {
  const tier = u.tier === 'daily' ? 't-daily' : u.tier === 'weekly' ? 't-weekly' : 't-setup';
  const color = u.tier === 'daily' ? 'var(--green)' : u.tier === 'weekly' ? 'var(--blue)' : 'var(--magenta)';
  return `<div class="uro reveal" style="--d:${i*0.05}s"><span class="rank">${String(i+1).padStart(2,'0')}</span><code>${u.cmd}</code><div class="bar"><i style="--w:${u.w};--tc:${color}"></i></div><span class="pct">${u.pct}%</span><span class="ttag ${tier}">${u.tier}</span></div>`;
}).join('');
bars.querySelectorAll('.uro').forEach(el => ioReveal.observe(el));

/* Pipeline */
const pipeline = document.getElementById('pipeline');
const stageDetail = document.getElementById('stageDetail');
function renderStage(i){
  pipeline.innerHTML = STAGES.map((s,idx) => {
    const arrow = idx < STAGES.length - 1 ? `<div class="arrow" aria-hidden="true"><span class="f">add →</span><span class="b">← restore</span></div>` : '';
    return `<button class="stage${idx===i?' active':''}" type="button" role="tab" aria-selected="${idx===i}" data-i="${idx}"><span class="s-dot"></span><span class="s-name">${s.name}</span><span class="s-sub">${s.sub}</span></button>${arrow}`;
  }).join('');
  const s = STAGES[i];
  stageDetail.innerHTML = `<h4>${s.name}</h4><p>${s.detail}</p><code>${s.code}</code>`;
  pipeline.querySelectorAll('.stage').forEach(btn => btn.addEventListener('click', () => renderStage(+btn.dataset.i)));
}
renderStage(0);

/* Glossary */
const glossGrid = document.getElementById('glossGrid');
const glossQ = document.getElementById('glossQ');
const glossCount = document.getElementById('glossCount');
const glossEmpty = document.getElementById('glossEmpty');
function renderGloss(){
  const q = glossQ.value.trim().toLowerCase();
  const items = GLOSSARY.filter(g => !q || g.t.toLowerCase().includes(q) || g.d.toLowerCase().includes(q) || g.tag.includes(q));
  glossCount.textContent = items.length + ' terms';
  glossEmpty.classList.toggle('hide', items.length > 0);
  glossGrid.innerHTML = items.map(g => `<article class="g-card"><div class="g-top"><h4>${g.t}</h4><span class="g-tag ${g.tag}">${g.tag}</span></div><p>${g.d}</p></article>`).join('');
}
glossQ.addEventListener('input', renderGloss); renderGloss();

/* Commands */
const cmdGrid = document.getElementById('cmdGrid');
const cmdQ = document.getElementById('cmdQ');
const cmdEmpty = document.getElementById('cmdEmpty');
let cmdTier = 'all';
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  cmdTier = tab.dataset.tier;
  renderCmds();
}));
function renderCmds(){
  const q = cmdQ.value.trim().toLowerCase();
  const items = COMMANDS.filter(c => (cmdTier === 'all' || c.tier === cmdTier) && (!q || c.name.includes(q) || c.desc.toLowerCase().includes(q)));
  cmdEmpty.classList.toggle('hide', items.length > 0);
  cmdGrid.innerHTML = items.map(c => `<article class="cmd-card" data-tier="${c.tier}"><div class="cc-top"><div class="cc-name">${c.name}</div><span class="cc-tier ${c.tier}">${c.tier}</span></div><p class="cc-desc">${c.desc}</p><div class="ex cc-ex"><code>${c.ex}</code><button class="copy" type="button" data-copy="${c.ex.replace(/"/g,'&quot;')}">copy</button></div></article>`).join('');
}
cmdQ.addEventListener('input', renderCmds); renderCmds();

/* Quiz */
let qi = 0, score = 0, answered = false;
const quizQ = document.getElementById('quizQ');
const quizOpts = document.getElementById('quizOpts');
const quizPos = document.getElementById('quizPos');
const quizScore = document.getElementById('quizScore');
const quizFeedback = document.getElementById('quizFeedback');
const quizNext = document.getElementById('quizNext');
const quizRestart = document.getElementById('quizRestart');
function showQuiz(){
  answered = false;
  quizNext.disabled = true;
  quizFeedback.textContent = '';
  quizFeedback.className = 'quiz-feedback';
  const item = QUIZ[qi];
  quizPos.textContent = `Question ${qi+1} / ${QUIZ.length}`;
  quizScore.textContent = `Score ${score}`;
  quizQ.textContent = item.q;
  quizOpts.innerHTML = item.opts.map((o,idx) => `<button class="qopt" type="button" data-i="${idx}">${o}</button>`).join('');
  quizOpts.querySelectorAll('.qopt').forEach(btn => btn.addEventListener('click', () => {
    if (answered) return;
    answered = true;
    const choice = +btn.dataset.i;
    quizOpts.querySelectorAll('.qopt').forEach((b,idx) => {
      b.disabled = true;
      if (idx === item.a) b.classList.add('correct');
      else if (idx === choice) b.classList.add('wrong');
    });
    if (choice === item.a) { score++; quizFeedback.textContent = 'Correct. ' + item.why; quizFeedback.classList.add('ok'); }
    else { quizFeedback.textContent = 'Not quite. ' + item.why; quizFeedback.classList.add('bad'); }
    quizScore.textContent = `Score ${score}`;
    quizNext.disabled = false;
    quizNext.textContent = qi === QUIZ.length - 1 ? 'See results' : 'Next';
  }));
}
quizNext.addEventListener('click', () => {
  if (qi >= QUIZ.length - 1) {
    quizQ.textContent = `Done — ${score} / ${QUIZ.length}`;
    quizOpts.innerHTML = '';
    quizFeedback.className = 'quiz-feedback ok';
    quizFeedback.textContent = score === QUIZ.length ? 'Pointers and snapshots: locked in.' : 'Skim Internals once more, then retry the misses.';
    quizNext.disabled = true;
    return;
  }
  qi++; showQuiz();
});
quizRestart.addEventListener('click', () => { qi = 0; score = 0; showQuiz(); });
showQuiz();

/* Terminal animation */
const termBody = document.getElementById('termBody');
let scene = 0;
function paintScene(lines){
  termBody.classList.add('wipe');
  setTimeout(() => {
    termBody.innerHTML = lines.map(l => `<div class="tl ${l.cls||''}">${l.html}</div>`).join('') + '<div class="tl"><span class="p">➜</span> <span class="cursor"></span></div>';
    termBody.classList.remove('wipe');
  }, 280);
}
paintScene(TERM_SCENES[0]);
setInterval(() => { scene = (scene + 1) % TERM_SCENES.length; paintScene(TERM_SCENES[scene]); }, 4200);
