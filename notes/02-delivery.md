# 02 · Delivery, fairness and starvation

**Question.** What bridges “accepted” and “eventually consumed”?

For each unique message label $p$, let $\operatorname{accepted}_p$ and
$\operatorname{delivered}_p$ be persistent state predicates. In linear temporal
logic, the desired condition is

$$
\Box(\operatorname{accepted}_p\Rightarrow\Diamond\operatorname{delivered}_p).
$$

Here $\Box$ means “at every position in an infinite execution” and $\Diamond$
means “at this or a later position”. Acceptance means the enqueue succeeded;
a rejected submission creates no delivery obligation.

## Integrity first

Let $A$ be the set of accepted labels, $D$ the set of delivered labels and $q$
the FIFO sequence of pending labels. The model maintains

$$
A=\operatorname{set}(q)\;\dot\cup\;D,
\qquad |q|\leq B,
$$

where $\dot\cup$ denotes disjoint union and $B$ is the queue capacity. A label
is submitted at most once. Delivery removes the head of $q$ and adds that
label to $D$. These transitions preserve the equality. Silently discarding
the head breaks it immediately; the checker prints the path that does so.

## The progress assumption

An enabled consumer is **weakly fair** if, whenever it remains continuously
enabled from some position onward, it is eventually scheduled. In this model,
the delivery action is enabled exactly when $q$ is nonempty. Executions are
infinite; an idle transition supplies stuttering when necessary.

Fix an accepted, undelivered label $p$. Let $r(p)$ be its position in the
queue, counting the head as one. While $p$ is pending:

- enqueuing at the tail does not increase $r(p)$;
- idle and private-bit updates preserve $r(p)$;
- delivery decreases $r(p)$, or delivers $p$ when $r(p)=1$.

The consumer remains enabled while $p$ is pending. Weak fairness forces a
delivery; applying the same reasoning after each delivery gives a finite
descent of the positive integer $r(p)$. Thus $p$ is eventually delivered.

## Two stronger claims that fail

**Without fairness:** enqueue $p$, then idle forever. Integrity still holds;
the delivery condition fails. The checker emits this prefix and loop.

**With weak fairness alone:** delivery has no fixed time bound. Arbitrarily
many finite idle steps before each delivery are allowed. If the scheduler
instead guarantees at least one delivery in every $K$ transitions while the
queue is nonempty, a label at rank $r$ is delivered within $rK\leq BK$
transitions after acceptance. A wall-clock bound additionally needs a bound
on transition duration.

The reference model allows two labels, each accepted at most once. Its finite
graph has no fair infinite execution with a pending label: within such a
region, any cycle containing a delivery edge would strictly increase $|D|$
and could not return to its starting state. The checker searches that graph
explicitly. The rank argument above also applies to longer FIFO executions
with fresh labels, provided pending labels cannot be dropped or overtaken.

Safety invariants and progress arguments have different proof obligations.
See Alpern and Schneider, [*Recognizing Safety and Liveness*](https://www.cs.cornell.edu/fbs/publications/RecSafeLive.pdf),
Distributed Computing 2, 1987. The queue argument here uses these established
ideas; it does not establish delivery in a private implementation.

[← Isolation](./01-isolation.md) · [Next: stability →](./03-stability.md)
