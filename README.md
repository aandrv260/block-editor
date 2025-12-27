## Description

A framework-agnostic, event-driven block editor engine focused on deterministic behavior, architectural clarity, and testability.

Designed as a pure data engine with a strict separation between state, commands, and rendering.

Built to run in any JavaScript environment no matter if it's a web browser, server components, a desktop application, a mobile application or web workers.

The engine has zero external dependencies by design.

## Why this engine exists

Most editors couple rendering, state mutation, and side effects - making them rigid, hard to test, and dangerous to evolve at scale.

This engine solves that. The core is pure, immutable, and UI-agnostic. The UI is simply a function of the state of the engine and nothing more.

This architecture enables:

- Safe refactoring without UI regressions
- Deterministic debugging (same input → same output)
- A stable contract
- Zero coupling between renderer and data
- Confidence when extending the editor under pressure

## Key highlights:

### Unidirectional data flow with action-based data mutation

```md
dispatchAction -> CommandCenter -> mutation -> event
```

Example:

```TS
editor.dispatchAction(
  moveBlock({
    blockId: 'block1',
    targetId: 'root',
    strategy: 'append',
  }),
);
```

`moveBlock` is one of the helper utils that makes the generation of the action payload in a cleaner and more semantic way. Other such utils are `insertBlock`, `deleteBlock`, `updateBlock`, `moveBlock`, etc.

This is simple, synchronous, predictable and easy to debug.

### Extensively tested

✓ Core tests: 690+ passing

✓ Coverage: 92%+

✓ ~10,000+ lines of test code

✓ Running in less than 2 seconds

Tests cover from low-level unit tests to high-level integration flows

**More than 92% code coverage** (intentionally excluding error class constructors)

### Production-grade error handling

Custom error classes with specific error codes and namespaces to help you handle errors in a type-safe and predictable way

All errors classes in the core extend the `EngineError` base abstract class

Included pure type guards for the errors so you can focus on your business logic and not low-level details

### Minimalistic and custom reactive event streams

The engine exposes a minimal, lazy, Rx-inspired event stream system tailored for editor workflows - without any external reactive libraries.

- Lazy by design
- Composable
- Side-effect isolated

```TS
const editor = new Editor();
const logDeletion = (event: DeleteBlockEvent) => { ... }

// It is recommended you prepend or append dollar sign to the variable name to indicate it is a stream.
const deleteBlockWithLogging$ = editor
  .on("block:delete")
  .filter(event => event.blockId === blockId)
  .tap(logDeletion);

// Nothing will ever be emitted until you call the .subscribe() method.
const deleteBlockLogged$ = deleteBlockWithLogging$.map(event => ({
  blockId: event.blockId,
  logged: true,
}));

// ... in another part of your application code
// Now onDelete will be called when an event is emitted.
deleteBlockLogged$.subscribe(onDelete);
```

### Immutability by default

Every exposed structure is readonly:

- document root
- block nodes
- history stack

This enforces correctness and makes debugging trivial.

### JSON-based document history

The engine never stores full document object snapshots in the history. It only stores the JSON snapshots of the document.

The history is a simple array of JSON strings, making it easy to serialize, persist, and inspect.

You can set a limit to the history so you can save memory.

### The UI is designed to literally be a function of the editor state

For the same editor state, you always get the same UI rendered.

The UI just takes the editor and based on its state, it constructs the DOM tree.

**Note:** The UI implementation is intentionally minimal and incomplete. Its purpose is to demonstrate architectural boundaries and adapter design, not to serve as a polished editor UI.

### Framework-agnostic core (zero dependencies, runs anywhere)

Even though only an adapter for React is provided out of the box, you can use the core with any framework you want since the core has exactly 0 dependencies and is flexible in any environment.

You can override the rendering and logic for all or only specific blocks.

### Built with performance in mind

The document tree uses a HashMap indexing of each block so you can get a block by its ID in O(1) average time complexity.

This is very efficient for large documents and extremely useful in the future for reacting to changes and updating only the DOM subtree that is affected.

The history is a simple array of JSON strings so you can serialize and deserialize it easily. Massive objects are not stored in history. You can set a limit to the history so you can save memory for large documents.

## Architecture

The editor is structured around a strict separation between state, mutation, and presentation.

### Core Engine (Framework-agnostic)

The core engine is responsible for all state ownership and mutations.

**Architectural constraints:**

- The document state can only be mutated through commands

- Commands are triggered exclusively via dispatched actions

- The CommandCenter is the single authority allowed to mutate state

- All state changes emit explicit, typed events

- No UI code can access or mutate the document directly

### Command-driven state mutation

```MD
Action → Command → State Mutation → Event
```

This unidirectional flow guarantees:

- Deterministic behavior

- Debuggable execution paths

- Safe refactoring as the system grows

### Event-based integration boundary

- The engine communicates exclusively through events.
- The presentation layer reacts to events but never drives state implicitly.

### Presentation Layer (UI adapters)

The presentation layer is a pure consumer of editor state and events.

**Its responsibilities are limited to:**

- Rendering editor state
- Dispatching actions
- Reacting to emitted events

## Package Structure

```
packages/
├── core/                   # Framework-agnostic engine
│   ├── actions/            # Type-safe actions
│   ├── blocks/             # Block models and validation
│   ├── commands/           # Commands for mutating the state
│   ├── document/           # Document tree
│   ├── events/             # EventBus, events and reactive streams
│   └── history/            # Undo/redo management
│
└── ui-react/               # React integration layer
    ├── components/         # Block renderers
    ├── context/            # EditorProvider
    └── hooks/              # Action dispatcher hooks
```

## Quick start

This repository is a pnpm-based monorepo.

- The core engine lives in packages/core
- The React adapter lives in packages/ui-react
- The playground provides a minimal environment to interact with the editor

```bash
# Install dependencies and build the packages
pnpm install && pnpm -r build

# Start the playground development server
pnpm --filter playground dev

# Run core tests
pnpm -F @block-editor/core test

# Run core test coverage
pnpm -F @block-editor/core test-coverage
```

## Planned evolution (alpha and beyond)

**Note:** The following items are intentionally deferred to later phases to keep the core engine focused, stable, and testable. They are not exhaustive.

- Expand the reference UI implementation (marks, edge cases, performance tuning).
- Custom event stream channels
- Collaboration support (multi-user editing, real-time collaboration, etc.)
- Declarative event stream error handling
- Block extension system
- Comprehensive documentation site
- Built-in persistence layer
- Lifecycle hooks
