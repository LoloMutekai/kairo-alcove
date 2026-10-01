# The executable reference model

Run `python3 reference/check.py` from the repository root. The program uses
only Python's standard library and exits nonzero if a stated model check fails.
`--self-test` additionally verifies that deliberate leak and drop variants are
rejected for the expected reasons. JSON output gives the checked domain and
actual counts from the run.

## State and actions

The immutable state is `(a, b, queue, accepted, delivered)`:

- `a` and `b` are bits belonging to different principals;
- `queue` is a FIFO of message labels `0` and `1`, with capacity two;
- `accepted` and `delivered` are bit masks over those two labels.

Every state starts with an empty queue and no accepted labels. The initial
private bits are zero; toggling either bit makes both values reachable.
The complete action alphabet is `idle`, `toggle-a`, `toggle-b`, `submit-0`,
`submit-1` and `deliver`. Each label can be accepted once. Submitting an already
accepted label, submitting to a full queue, or delivering an empty queue leaves
the state unchanged. There is no network, file store or model call.

## Checking algorithm

1. Breadth-first search constructs the entire reachable labelled graph. Stored
   predecessors reconstruct shortest paths to failing state invariants.
2. For each pair of reachable states with equal observer-A projections and
   each common action, the checker compares successor projections. Equality
   must be preserved. A violation reports both initial paths and the action.
3. For each label, restrict the graph to states where it is accepted but not
   delivered. Find the strongly connected components containing cycles. A
   weakly fair infinite starvation run in this model would require an internal
   delivery edge in such a component: delivery is continuously enabled in
   every pending state. No such component is permitted.
4. Construct and verify an unfair lasso: `submit-0`, followed by `idle` forever.
   It is retained as a counterexample to unconditional delivery.

For this finite transition system, an internal delivery edge in a cyclic
strongly connected component is both necessary and sufficient for a weakly
fair starvation execution: traverse it repeatedly using connecting paths
inside the component. Without one, any execution trapped in a pending
component violates fairness. This criterion relies on the model's single
fair action; it is not a general LTL model checker.

## Checks with deliberately broken transitions

`--variant leaky` copies `b` into `a` during idle. `--variant drop-head` pops
the FIFO head without recording delivery. `--variant stall-head` schedules
delivery but leaves the queue untouched; it exercises the fairness-cycle
check while preserving integrity. These variants are counterexample fixtures,
not optional runtime behavior. Each command must exit nonzero:

```sh
python3 reference/check.py --variant leaky
python3 reference/check.py --variant drop-head
python3 reference/check.py --variant stall-head
```

The model's state limit is an exploration guard, not a performance claim. If
the limit is exceeded, the program fails rather than returning a partial pass.
The checker does not transfer any result to the private implementation of
A.C.C.E.S.S.; see [the evidence boundary](../notes/04-evidence.md).
