from __future__ import annotations

"""Exhaustively check a small, independent public transition specification.

This is not the implementation of A.C.C.E.S.S. All inputs are synthetic.
"""

import argparse
import json
from collections import deque
from dataclasses import asdict, dataclass, replace
from itertools import combinations
from typing import Callable

LABELS: tuple[int, ...] = (0, 1)
CAPACITY: int = len(LABELS)
FULL_MASK: int = (1 << len(LABELS)) - 1
MAX_STATES: int = 320  # 4 private bit pairs × 5 queues × 4² masks.
ACTIONS: tuple[str, ...] = (
    "idle", "toggle-a", "toggle-b", "submit-0", "submit-1", "deliver"
)
VARIANTS: tuple[str, ...] = ("reference", "leaky", "drop-head", "stall-head")


@dataclass(frozen=True)
class State:
    """Two private bits, a shared FIFO, and accepted/delivered label masks."""

    a: int = 0
    b: int = 0
    queue: tuple[int, ...] = ()
    accepted: int = 0
    delivered: int = 0


Graph = dict[State, tuple[tuple[str, State], ...]]
Parents = dict[State, tuple[State, str] | None]
Observation = tuple[int, tuple[int, ...], int, int]


def transition(state: State, action: str, variant: str) -> State:
    """Apply one specified action, including explicit counterexample variants."""
    if action not in ACTIONS or variant not in VARIANTS:
        raise ValueError("unknown action or variant")
    if action == "idle":
        return replace(state, a=state.b) if variant == "leaky" else state
    if action == "toggle-a":
        return replace(state, a=1 - state.a)
    if action == "toggle-b":
        return replace(state, b=1 - state.b)
    if action.startswith("submit-"):
        label = int(action[-1])
        bit = 1 << label
        if state.accepted & bit or len(state.queue) >= CAPACITY:
            return state
        return replace(state, queue=state.queue + (label,),
                       accepted=state.accepted | bit)
    if not state.queue or variant == "stall-head":
        return state
    label = state.queue[0]
    delivered = state.delivered
    if variant != "drop-head":
        delivered |= 1 << label
    return replace(state, queue=state.queue[1:], delivered=delivered)


def observation(state: State) -> Observation:
    """Observer A sees its own bit and explicit shared state, never bit B."""
    return state.a, state.queue, state.accepted, state.delivered


def explore(variant: str) -> tuple[Graph, Parents]:
    """Build the complete reachable graph or fail on the exploration limit."""
    initial = State()
    pending = deque([initial])
    parents: Parents = {initial: None}
    graph: Graph = {}
    while pending:
        state = pending.popleft()
        edges = tuple((action, transition(state, action, variant))
                      for action in ACTIONS)
        graph[state] = edges
        for action, successor in edges:
            if successor not in parents:
                if len(parents) >= MAX_STATES:
                    raise RuntimeError("state limit reached: incomplete exploration")
                parents[successor] = state, action
                pending.append(successor)
    return graph, parents


def initial_path(state: State, parents: Parents) -> list[str]:
    """Reconstruct a shortest action prefix from the initial state."""
    path: list[str] = []
    while (parent := parents[state]) is not None:
        state, action = parent
        path.append(action)
    return list(reversed(path))


def intact(state: State) -> bool:
    """Check queue bounds, types, uniqueness and the accepted-label partition."""
    queued = sum(1 << label for label in state.queue if label in LABELS)
    return (
        state.a in (0, 1) and state.b in (0, 1)
        and len(state.queue) <= CAPACITY
        and all(label in LABELS for label in state.queue)
        and len(set(state.queue)) == len(state.queue)
        and 0 <= state.accepted <= FULL_MASK
        and 0 <= state.delivered <= FULL_MASK
        and not (queued & state.delivered)
        and state.accepted == (queued | state.delivered)
    )


def components(graph: Graph, allowed: set[State]) -> list[set[State]]:
    """Compute SCCs with Tarjan's algorithm on the induced subgraph."""
    indices: dict[State, int] = {}
    low: dict[State, int] = {}
    stack: list[State] = []
    active: set[State] = set()
    result: list[set[State]] = []

    def visit(state: State) -> None:
        indices[state] = low[state] = len(indices)
        stack.append(state)
        active.add(state)
        for _, successor in graph[state]:
            if successor not in allowed:
                continue
            if successor not in indices:
                visit(successor)
                low[state] = min(low[state], low[successor])
            elif successor in active:
                low[state] = min(low[state], indices[successor])
        if low[state] == indices[state]:
            group: set[State] = set()
            while True:
                member = stack.pop()
                active.remove(member)
                group.add(member)
                if member == state:
                    break
            result.append(group)

    for state in graph:  # Stable exploration order, rather than set iteration.
        if state in allowed and state not in indices:
            visit(state)
    return result


def connecting_path(graph: Graph, start: State, target: State,
                    allowed: set[State]) -> list[str]:
    """Find an action path inside an SCC, including a possible empty path."""
    parents: Parents = {start: None}
    pending = deque([start])
    while pending:
        state = pending.popleft()
        if state == target:
            return initial_path(target, parents)
        for action, successor in graph[state]:
            if successor in allowed and successor not in parents:
                parents[successor] = state, action
                pending.append(successor)
    raise RuntimeError("SCC has no connecting path")


def fair_starvation(graph: Graph, parents: Parents) -> dict[str, object] | None:
    """Find a pending-label cycle that can schedule enabled delivery forever."""
    for label in LABELS:
        bit = 1 << label
        allowed = {s for s in graph if s.accepted & bit and not s.delivered & bit}
        for group in components(graph, allowed):
            for state in graph:
                if state not in group:
                    continue
                for action, successor in graph[state]:
                    if action == "deliver" and successor in group:
                        return {
                            "label": label,
                            "prefix": initial_path(state, parents),
                            "loop": [action] + connecting_path(
                                graph, successor, state, group),
                            "loop_start": asdict(state),
                        }
    return None


def check(variant: str) -> dict[str, object]:
    """Check integrity, observer noninterference, and weakly fair delivery."""
    graph, parents = explore(variant)
    violations: dict[str, object] = {}
    for state in graph:
        if not intact(state):
            violations["integrity"] = {
                "prefix": initial_path(state, parents), "state": asdict(state)
            }
            break

    groups: dict[Observation, list[State]] = {}
    for state in graph:
        groups.setdefault(observation(state), []).append(state)
    pair_actions = 0
    for group in groups.values():
        for left, right in combinations(group, 2):
            for action in ACTIONS:
                pair_actions += 1
                if observation(transition(left, action, variant)) != observation(
                        transition(right, action, variant)):
                    violations.setdefault("isolation", {
                        "left_prefix": initial_path(left, parents),
                        "right_prefix": initial_path(right, parents),
                        "left": asdict(left), "right": asdict(right),
                        "action": action,
                    })

    # The SCC fairness criterion assumes a pending label implies nonempty FIFO.
    if "integrity" not in violations:
        witness = fair_starvation(graph, parents)
        if witness is not None:
            violations["fair_delivery"] = witness

    starving = transition(State(), "submit-0", variant)
    unfair_lasso_valid = (
        bool(starving.accepted & 1) and not starving.delivered & 1
        and bool(starving.queue)
        and transition(starving, "idle", variant) == starving
    )
    if not unfair_lasso_valid:
        violations["unfair_witness"] = "starvation lasso does not reproduce"
    return {
        "variant": variant,
        "domain": "two private bits; two once-accepted labels; FIFO capacity two",
        "reachable_states": len(graph),
        "labelled_edges": sum(len(edges) for edges in graph.values()),
        "paired_state_action_checks": pair_actions,
        "status": "PASS" if not violations else "FAIL",
        "violations": violations,
        "fair_delivery_check": (
            "SKIPPED: integrity premise failed" if "integrity" in violations
            else "FAIL" if "fair_delivery" in violations else "PASS"
        ),
        "unconditional_delivery_counterexample": {
            "prefix": ["submit-0"], "loop": ["idle"],
            "valid": unfair_lasso_valid, "weakly_fair": False,
        },
    }


def self_test(checker: Callable[[str], dict[str, object]] = check
              ) -> dict[str, object]:
    """Require a positive model and separate integrity, isolation and SCC failures."""
    expected = {"leaky": "isolation", "drop-head": "integrity",
                "stall-head": "fair_delivery"}
    reports = [checker(variant) for variant in VARIANTS]
    passed = reports[0]["status"] == "PASS"
    for report in reports[1:]:
        violations = report["violations"]
        passed = (passed and report["status"] == "FAIL"
                  and isinstance(violations, dict)
                  and expected[str(report["variant"])] in violations)
    return {"status": "PASS" if passed else "FAIL", "reports": reports}


def main() -> int:
    """Print the actual verification report, failing visibly on checker errors."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--variant", choices=VARIANTS, default="reference")
    parser.add_argument("--self-test", action="store_true")
    arguments = parser.parse_args()
    if arguments.self_test and arguments.variant != "reference":
        parser.error("--self-test checks all variants; do not select one")
    report = self_test() if arguments.self_test else check(arguments.variant)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
