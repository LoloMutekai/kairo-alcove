# 01 · Isolation across executions

**Question.** If a component's private state changes, what can an observer learn?

An access-control rule constrains a read. Noninterference constrains the
observable effects of a computation. They are different obligations.

## Model

Let the state space be $S=P\times H\times C$: observer-private state $P$,
other-private state $H$, and explicitly shared state $C$. Let
$F:S\times U\to S$ be a deterministic transition and
$o:S\to O$ an observation map. Write $x\equiv_o y$ when $o(x)=o(y)$.
All quantifiers below range over their stated domains.

The one-step obligation is

$$
\forall x,y\in S,\;\forall u\in U:\quad
x\equiv_o y\;\Longrightarrow\;F(x,u)\equiv_o F(y,u).
$$

Equivalently, $o\circ F$ factors through the observation: there exists
$\widehat F:o(S)\times U\to o(S)$ such that

$$
o(F(x,u))=\widehat F(o(x),u).
$$

**Why the equivalence holds.** Given the obligation, choose any state $x$
with observation $z$ and define $\widehat F(z,u)=o(F(x,u))$. The obligation
makes this independent of the representative. The converse follows by
substitution. Restricting the domain to $o(S)$ avoids inventing an unreachable
observation.

## Consequence for complete runs

For two runs $x_{t+1}=F(x_t,u_t)$ and $y_{t+1}=F(y_t,u_t)$ under the **same
input sequence**, $x_0\equiv_o y_0$ implies $x_t\equiv_o y_t$ for every
$t\in\mathbb N$. The base case is the premise. The one-step obligation
propagates the induction hypothesis.

In the reference model, $o(a,b,q,A,D)=(a,q,A,D)$: the observer sees its own
bit $a$, the shared queue $q$, accepted message labels $A$, and delivered
labels $D$. It cannot observe bit $b$. The checker examines pairs of reachable
states with the same observation, for every action. The leaking variant sets
$a\leftarrow b$ on an idle action and produces an explicit violating pair.

## Where this stops

The result is conditional on the observation and input models. A scheduler
whose choices depend on a secret can leak through those choices; the theorem
holds inputs equal and does not justify that scheduler. Timing, resource use,
exceptions and external I/O must be included if they are observable. The
finite checker covers its declared bit-valued model; the inductive argument
covers any deterministic transition satisfying the obligation.

The comparison is across executions. This is the reason information-flow
policies are naturally expressed as hyperproperties. See Clarkson and
Schneider, [*Hyperproperties*](https://www.cs.cornell.edu/fbs/publications/HyperpropertiesCSFW.pdf),
CSF 2008, §§1–2. The argument above is a specialization, not a novelty claim.

[← Notebook](../README.md) · [Next: delivery →](./02-delivery.md)
