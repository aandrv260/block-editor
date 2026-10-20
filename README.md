## Description

A framework-agnostic, event-driven block editor engine focused on developer experience, architectural clarity, and testability.

Runs in any JavaScript environment, from web browsers to servers and web workers.

Around 12 KB minified and gzipped, with a single runtime dependency: [Valibot](https://valibot.dev).

## Why this engine exists

This engine is lightweight and fast by design. The whole core is around 12 KB gzipped with a single dependency, every command runs synchronously, and every block lookup is O(1), so it stays fast as documents grow.

It also focuses on developer experience. Most editor engines are powerful but hard to learn, with schemas, plugin systems with many concepts and global type augmentation. Here the API is small, the data is plain JSON, and everything is typed automatically.

## Quick look

```TS
const ClearDocumentExtension = defineExtension({
  name: "ClearDocumentExtension",
  events: defineEvents<{
    "document:clear": { removedBlocks: number };
  }>(),
  commands: ({ createCommand }) => ({
    clearDocument: createCommand(({ document, createEvent }) => {
      const blocks = [...document.getRoot().children];

      blocks.forEach(block => document.remove(block.id));

      return createEvent("document:clear", {
        removedBlocks: blocks.length,
      });
    }),
  }),
});

const editor = new Editor({ extensions: [ClearDocumentExtension] });

// Several commands, one change, one undo step
editor.transaction(tx => {
  tx.execute("insertBlock", { targetId: "root", strategy: "append", newBlock });
  tx.execute("insertText", { blockId: newBlock.id, offset: 0, text: "Hello" });
});

// Typed from the extension, with autocomplete
editor.execute("clearDocument");
editor.subscribe("document:clear", event => console.log(event.removedBlocks));
```

## Key highlights

- **Command-based mutation.** The document only changes through commands, and every payload is typed.
- **Transactions.** Several commands commit as one change and roll back if anything fails.
- **Typed extensions.** Custom commands, events and hooks are typed per editor, with no global type augmentation.
- **Extension hooks.** `onBeforeCommand`, `onAfterCommand`, `onBeforeCommit`, `onEditorInit` and `onEditorDestroy`.
- **Event streams.** A lazy, Rx-inspired `editor.on(...)` with `map`, `filter` and `tap`, without external libraries.
- **Typed errors.** Every error extends `EngineError`, with error codes and type guards.
- **Readonly by default.** The document, blocks and history are exposed as readonly.

### The UI is a function of the editor state

For the same editor state, you always get the same UI rendered.

**Note:** The React adapter is intentionally minimal. It demonstrates the architectural boundaries, not a polished editor UI yet. Work is still in progress.

### Built with performance in mind

Every block is indexed by its ID, so you get any block in O(1) average time, even in large documents.

This also makes it possible to update only the DOM subtree that changed.

### Framework-agnostic core

Only a React adapter ships out of the box, but the core works with any framework since it depends only on Valibot.

You can override the rendering and logic for all or only specific blocks.

### Developer experience first

Commands and events are typed from your extensions, so you get autocomplete everywhere without writing a single type.

The API is intentionally minimal. `execute`, `transaction` and `subscribe` cover almost everything you need.

Mistakes fail at compile time, from a typo in an event name to a hook that doesn't exist.

### Extensively tested

✓ Core tests: 840+ passing

✓ Coverage: 94%+

✓ Running in less than 2 seconds

## Package Structure

```
packages/
├── core/                   # Framework-agnostic engine
│   ├── blocks/             # Block models, text content, marks and validation
│   ├── commands/           # Commands, transactions and the CommandCenter
│   ├── document/           # Document tree
│   ├── editor/             # Editor entry point and its types
│   ├── errors/             # EngineError base class and error codes
│   ├── events/             # EventBus, events and reactive streams
│   ├── extensions/         # Extensions and their hooks
│   └── history/            # Undo/redo management and history grouping
│
└── ui-react/               # React integration layer
    ├── components/         # Block renderers
    ├── context/            # EditorProvider
    └── hooks/              # Editor, history and block hooks
```

## Quick start

```bash
# Install dependencies and build the packages
pnpm install && pnpm -r build

# Start the playground development server
pnpm playground

# Run core tests
pnpm -F @block-editor/core test
```

## Planned next steps

- Block extension system
- Expand the UI implementation
- Collaboration support
- Built-in persistence layer
- Comprehensive documentation site
