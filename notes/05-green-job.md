# 05 · A green job with stale output

**Question.** Can a successful automation fail to publish the file it generated?

Yes. An earlier version of my profile workflow generated one path and checked
another. The command succeeded; the intended artifact never reached a commit.
This is a case from the public profile repository, separate from the abstract
model and from the private implementation of A.C.C.E.S.S.

## The source-level mismatch

In the published
[generator](https://github.com/LoloMutekai/LoloMutekai/blob/df690d100dcea00b53315fe27e68bb658306d1ac/metrics/generate.py),
the output is `assets/tokonoma.svg`. The corresponding
[workflow](https://github.com/LoloMutekai/LoloMutekai/blob/df690d100dcea00b53315fe27e68bb658306d1ac/.github/workflows/metrics.yml)
tests and stages `assets/metrics.svg`:

```sh
if git diff --quiet -- assets/metrics.svg; then
  echo "metrics.svg unchanged — nothing to commit."
  exit 0
fi
git add assets/metrics.svg
```

When only `assets/tokonoma.svg` changes, the path-restricted diff is empty.
The branch returns success before staging the generated file.

## Evidence from a run

The archived [workflow run](https://github.com/LoloMutekai/LoloMutekai/actions/runs/31865233477)
records the generator writing `assets/tokonoma.svg`, followed by the commit
step reporting the other file unchanged. Source and execution agree on the
failure mechanism. The run is evidence of that run; it is not evidence that
every scheduled invocation behaved identically.

## What would validate a repair?

A path correction is necessary but needs an exercised case: make the generator
produce a changed file, confirm that the exact file is staged and committed,
then read it back from the resulting commit. Also exercise the genuinely
unchanged case so the workflow remains quiet when there is nothing to publish.
A successful job alone cannot substitute for this check.

In this profile redesign I retired the metrics automation and its cards. I
did not reactivate it with a path correction, and no repaired production run
is claimed. The old source remains available at the pinned revision above.

[← Notebook](../README.md)
