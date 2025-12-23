import type {
  EditorActionMap,
  EditorActionType,
} from "../../actions/actions.models";
import type { DocumentHistory } from "../../history/DocumentHistory";
import type { EditorEventBus } from "../../events/editor-event-bus/editorEvent.models";
import type { EditorDocument } from "../../document/EditorDocument";

// TODO: Add an options object and remove the multiple constructor parameters.
// TODO: Consider implementing the template pattern here to enforce structure of the execute method and so in the future contributors of this lib don't forget to update the history or emit events. But let's have first 12+ command to see what is common and what is not so I don't overengineer early on. I see in some commands that I have guard clauses so I need to think about it carefully.
/**
 * This is the base class for all commands. It's responsible for defining the `execute()` method interface as well as a clear structure for the constructors so no code is duplicated and no mistakes are made that way.
 */
export abstract class Command<T extends EditorActionType> {
  constructor(
    protected readonly payload: EditorActionMap[T]["payload"],
    protected readonly eventBus: EditorEventBus,
    protected readonly history: DocumentHistory,
    protected readonly document: EditorDocument,
  ) {}

  public abstract execute(): void;
}
