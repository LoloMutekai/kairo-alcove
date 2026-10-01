# 04 · The evidence boundary

The public material concerns a newly written abstract reference model.
It contains no extracted implementation, private data or execution logs.
Keeping that distinction visible makes each result interpretable.

| Claim | Evidence available here | Further obligation for a running system |
|---|---|---|
| The finite reference model preserves message integrity. | Reachability exploration and shortest failing paths for a dropping variant. | Map concrete storage, failures and recovery to the invariant; exercise the actual producer and consumer. |
| Its observations are independent of the other private bit under equal actions. | Exhaustive paired-state check and an inductive proof. | Define every observable channel and show that concrete transitions satisfy the abstraction, including the scheduler. |
| Its accepted messages are eventually delivered under weak fairness. | FIFO rank argument and finite graph check; unfair starvation witness. | Justify scheduling progress and the relation between an acknowledgement and the intended effect. |
| A deterministic transition satisfying the metric assumptions has the derived perturbation bound. | Algebraic derivation and counterexamples to stronger claims. | Supply a meaningful metric and valid constants for the concrete transition. |

## Why a public model is useful

A small model makes a contract inspectable without granting access to a
personal machine. It can expose contradictory requirements, missing
assumptions and checks that pass because nothing happened. It establishes
properties of that model. Carrying them into an implementation requires a
separate correspondence argument and evidence from its live paths.

The current checker does not model crashes, persistence storage, concurrent
interleavings inside an action, network transport, real timing, adversarial
inputs or language-model output. In particular, the notebook's question about
restart persistence remains a question rather than a verified result.

## Scope of the work

These are technical expository notes and a verification example based on
established concepts. There is no empirical study, comparative benchmark,
claim of scientific priority or inference about cognition in this repository.
An empirical claim would need its own protocol, relevant controls, inspectable
results and failure cases. A statement about the private system would need
evidence for that system.

[← Stability](./03-stability.md) · [Notebook →](../README.md)
