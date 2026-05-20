---
title: "Playing with LangGraph"
description: "What clicked for me about LangGraph after building a small local learning project."
date: "May 10 2026"
---

I had never used [LangGraph](https://www.langchain.com/langgraph) before today.

I had seen the name around, and I understood at a high level that it had something to do with agents and workflows, but I had not actually built anything with it yet.

If you have never heard of LangGraph before, the short version is that it is a Python framework for building stateful, multi-step LLM applications. Instead of thinking in terms of one prompt and one response, it lets you model a flow made up of steps, branching decisions, shared state, and persistence between steps.

It also helps to place it in the broader LangChain ecosystem. LangChain is the wider set of tools and abstractions for building LLM applications, while LangGraph is the part focused on orchestration. Put simply: LangChain gives you building blocks for working with models, prompts, tools, and messages, and LangGraph gives you a structured way to run those pieces through a durable workflow.

After spending some time with it, the biggest thing that made it click for me was this:

LangGraph is much easier to understand if you stop thinking about it as “AI magic” and instead think about it as a **stateful workflow engine** built on top of ideas that should already feel familiar if you have a computer science or software engineering background.

In other words:

- the **graph** is the workflow structure
- the **state** is the data moving through that structure
- the **nodes** do work
- the **edges** decide what happens next

Once I started looking at it that way, it stopped feeling mysterious.

---

#### What LangGraph Actually Is

At its core, LangGraph is a runtime for building multi-step applications where state moves through a graph.

It is developed as part of the LangChain ecosystem, but it solves a more specific problem. If LangChain is the general toolkit, LangGraph is the workflow layer inside that world. That distinction is useful because it explains why LangGraph starts to make sense only once your app has multiple steps, routing decisions, or memory that needs to survive beyond a single prompt.

Each step in the graph reads some state, does some work, and returns updates. The runtime then merges those updates into the shared state and follows the next edge.

That may sound abstract, but it is actually pretty close to concepts most engineers already know:

- control flow graphs
- state machines
- workflow engines
- durable jobs

The LangGraph-specific part is that it adds features that are useful for LLM systems:

- checkpointing
- resumability
- thread-level memory
- human-in-the-loop pauses
- streaming

So the graph theory gives you the structure, and LangGraph gives you the runtime behavior on top of that structure.

---

#### What Made It Click For Me

The distinction that mattered most for me was:

- **topology**: the fixed shape of the workflow
- **state**: the mutable data moving through it

That sounds obvious, but it is the mental model that made the rest of the API make sense.

In LangGraph, the graph topology is your nodes and edges. That is the static part.

The state is the data you carry through the workflow: inputs, intermediate decisions, tool results, messages, or anything else the system needs while it runs.

That separation matters because LangGraph is not really about “generate some text.” It is about **orchestrating a process**.

That is why it feels like a good fit for:

- branching workflows
- tool-calling agents
- multi-step support or review flows
- anything that may need persistence or a human approval point

And it is also why it would be overkill for a one-shot “prompt in, answer out” script.

---

#### The First Example: A Tiny Graph

The first thing I built was a deliberately tiny example just to understand the mechanics.

```python
builder = StateGraph(HelloState)
builder.add_node("introduce_topic", introduce_topic)
builder.add_node("explain_graph_shape", explain_graph_shape)
builder.add_edge(START, "introduce_topic")
builder.add_edge("introduce_topic", "explain_graph_shape")
builder.add_edge("explain_graph_shape", END)
```

This was useful because it strips the whole idea down to the essentials:

- define a state type
- define a couple of nodes
- connect them with edges
- compile the graph

That is it.

No models. No tools. No prompts. Just workflow mechanics.

For learning, that was the right place to start, because it made it obvious that a node is simply a step of computation and an edge is simply the control-flow rule that determines where execution goes next.

That kind of example is also a good reminder that LangGraph is not only for "full agent" systems. You can use it for ordinary, explicit workflows where an LLM might only appear in one or two nodes.

---

#### The Example That Taught Me the Most

The more useful example was a small support-ticket router.

The shared state looked roughly like this:

```python
class TicketState(TypedDict, total=False):
    ticket_text: str
    customer_tier: str
    category: str
    priority: str
    response: str
    next_step: str
    needs_human: bool
    history: Annotated[list[str], _append]
```

This example made a few important things concrete for me.

First, the state should be **raw application data**, not prompt-shaped text. That means storing things like `category`, `priority`, and `needs_human` as explicit fields instead of burying them inside strings.

Second, nodes return **state updates**, not some giant monolithic output object. One node might classify the ticket. Another might decide whether a human should review it. Another might prepare the next response. Each one owns a small part of the workflow.

Third, the `history` field showed me how state merging works. In this example, multiple nodes append to the same list rather than overwriting it. That gave me a simple audit trail of what happened during the run.

That last part felt especially useful. Once you have branching workflows, being able to inspect the decision path is not a nice-to-have. It is part of making the system debuggable.

It also felt like a more realistic example than the usual "chatbot" framing. A ticket router has obvious steps, obvious branching, and obvious state: classify the request, decide whether it needs a human, route it, and keep enough history to explain why the system did what it did.

---

#### Conditional Edges Are Where It Starts Feeling Powerful

The part that felt most “LangGraph” to me was the conditional routing.

```python
builder.add_conditional_edges(
    "classify_ticket",
    choose_route,
    {
        "human_review": "human_review",
        "billing_response": "billing_response",
        "technical_response": "technical_response",
        "general_response": "general_response",
    },
)
```

This is where the workflow stops being a straight line and starts behaving like an actual process.

The `classify_ticket` node updates the state. Then `choose_route` inspects that state and decides which node should run next.

That felt familiar immediately, because it is just explicit branching:

- if the ticket is high priority, escalate to a human
- otherwise route by category

The difference is that the branching is part of the graph structure itself. It is not buried somewhere in a large, tangled block of orchestration code.

That explicitness seems like one of the main reasons to use LangGraph in the first place.

---

#### Graph API vs Functional API

I also tried the Functional API so I could compare the two approaches.

The Graph API is the one that made the runtime model clearest to me. You see the nodes. You see the edges. You see the graph shape directly.

The Functional API felt more like:

“Keep writing normal Python, but let LangGraph wrap it with checkpointing and workflow semantics.”

That version looked more like this:

```python
@entrypoint(checkpointer=CHECKPOINTER)
def review_workflow(inputs: dict[str, Any], *, previous: Any = None) -> dict[str, Any]:
    assessment = score_change(inputs).result()
    decision = choose_reviewer(assessment).result()
    return {
        "summary": decision["summary"],
        "risk_score": decision["risk_score"],
        "recommended_reviewer": decision["reviewer"],
        "recommended_action": decision["action"],
        "previous_run": previous,
    }
```

This was a helpful contrast.

If the workflow structure itself is important and you want to inspect routing explicitly, the Graph API seems like the better fit.

If the logic is already easier to express as ordinary Python control flow, the Functional API feels more natural.

My first impression is that the Graph API is the better learning tool, while the Functional API is the easier bridge for existing Python orchestration code.

---

#### Where I Think I Would Use LangGraph

After playing around with LangGraph for a bit, the use cases that make sense to me are:

- multi-step agents that call tools
- workflows with branching decisions
- systems that need thread-level memory
- flows that may pause for human review
- long-running processes where resumability matters

More concrete versions of those might be:

- a support workflow that triages requests before deciding whether to draft a reply or escalate
- a research assistant that searches, summarizes, then asks for approval before continuing
- a document-processing pipeline that classifies files, extracts fields, and routes exceptions to a person

The common theme is that there is real workflow complexity to manage.

That also implies where I would not use it.

If I just need to call a model once, maybe parse a response, and return the result, LangGraph feels like unnecessary machinery.

Likewise, if there is no branching, no meaningful state, and no need for persistence, I would probably just use a direct SDK or a simpler LangChain flow.

That is probably the most important practical takeaway from day one: **LangGraph solves orchestration problems, not every LLM problem.**

---

#### A Couple of First-Day Gotchas

One thing that briefly confused me was local development.

`langgraph dev` does run your graph locally, but the Studio UI experience is tied to LangSmith-hosted tooling. So even though the runtime is local, opening the Studio view in a browser may still ask you to log in.

That makes more sense once you realize these are two separate things:

- the graph server is local
- the Studio frontend is hosted

You can still work perfectly fine locally using the local API and docs endpoint, but it is worth knowing that “local runtime” does not necessarily mean “fully local browser UI.”

That is a tooling nuance, not a LangGraph concept, but it is exactly the kind of thing that is useful to understand early.

---

#### Final Thoughts

The thing I learned today is that LangGraph is not really hard in the abstract. It just helps a lot to place it in the right category.

If you approach it expecting some kind of magical agent abstraction, it feels vague.

If you approach it as a workflow runtime with shared state, explicit transitions, and persistence, it becomes much easier to reason about.

That framing also makes it easier to decide when to use it.

For me, the next useful step is obvious: keep the workflow exactly as it is, but replace one deterministic node with a real model call.

That feels like the right abstraction boundary.

LangGraph should own the workflow.
The model should just be one component inside it.
