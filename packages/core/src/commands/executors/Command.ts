import type {
  EditorActionMap,
  EditorActionType,
} from "../../actions/actions.models";
import type { EditorEventsMap } from "../../events/editor-event-bus/editorEvent.models";
import type { EditorDocument } from "../../document/EditorDocument";

/**
 * This is the base class for all commands. It's responsible for defining the `execute()` method interface as well as a clear structure for the constructors so no code is duplicated and no mistakes are made that way.
 *
 * A command only changes the document. It knows nothing about the history or the event bus, so the command center records the history and emits the returned event after the command succeeds.
 */
export abstract class Command<T extends EditorActionType> {
  constructor(
    protected readonly payload: EditorActionMap[T]["payload"],
    protected readonly document: EditorDocument,
  ) {}

  /**
   * Changes the document and returns the event that describes the change.
   */
  public abstract execute(): EditorEventsMap[T];
}
