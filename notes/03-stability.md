# 03 · Perturbation bounds

**Question.** Does a bound on one transition control a long run?

Let $(S,d)$ and $(U,\rho)$ be metric spaces. For each $t\in\mathbb N$, assume
$F_t:S\times U\to S$ satisfies, for all states $x,y$ and inputs $u,v$,

$$
d(F_t(x,u),F_t(y,v))
\leq\kappa_t d(x,y)+L_t\rho(u,v),
\qquad \kappa_t,L_t\geq0.
$$

Compare runs $x_{t+1}=F_t(x_t,u_t)$ and $y_{t+1}=F_t(y_t,v_t)$.
Write $e_t=d(x_t,y_t)$ and $\delta_t=\rho(u_t,v_t)$. Then, for $n>m$,

$$
e_n\leq
\left(\prod_{j=m}^{n-1}\kappa_j\right)e_m
+\sum_{r=m}^{n-1}
L_r\delta_r\left(\prod_{j=r+1}^{n-1}\kappa_j\right).
$$

An empty product is one. **Proof:** the one-step inequality gives the case
$n=m+1$. Substitute the bound for $e_n$ into
$e_{n+1}\leq\kappa_n e_n+L_n\delta_n$ and collect terms. Induction completes
the argument.

## Three distinct conclusions

With identical inputs, the sum vanishes. A uniform bound

$$
\sup_{0\leq m<n}\prod_{j=m}^{n-1}\kappa_j<\infty
$$

controls amplification of initial error over every time interval. It does
not imply that error vanishes: $F_t(x,u)=x$ has $\kappa_t=1$ and preserves it.

Even decay of the product from time zero is weaker than uniform control over
all intervals. Choose $\kappa_{2r}=2^{r+1}$ and
$\kappa_{2r+1}=2^{-2(r+1)}$. The prefix products tend to zero, including the
odd-length prefixes, but the single-step gains $\kappa_{2r}$ are unbounded.
A disturbance introduced late can therefore face a large local amplification.

For input error, assume the stronger uniform bounds
$\kappa_t\leq\kappa<1$, $L_t\leq L$ and $\delta_t\leq\delta$. Then

$$
e_n\leq\kappa^{n-m}e_m+
L\delta\frac{1-\kappa^{n-m}}{1-\kappa}.
$$

The first term decays; persistent input error leaves a bound of
$L\delta/(1-\kappa)$. Bounded same-input sensitivity alone does not control
accumulated input error. For $F(x,u)=x+u$, identical-input runs preserve their
distance, while a constant input offset makes the distance grow linearly.

## What a system claim would require

The metric and constants need a justification for the actual state variables.
A stochastic transition needs a coupling or a distributional metric rather
than an unqualified deterministic inequality. Neither a Lipschitz expression
nor this algebra demonstrates stable identity, intelligence or consciousness.
This note is an analytic derivation; the finite checker does not test it.

For context on contraction analysis, see Lohmiller and Slotine,
[*On Contraction Analysis for Non-linear Systems*](https://web.mit.edu/nsl/www/preprints/contraction.pdf),
Automatica 34(6), 1998. The discrete perturbation bound above follows directly
from its stated assumptions and carries no claim of a new stability result.

[← Delivery](./02-delivery.md) · [Next: evidence →](./04-evidence.md)
