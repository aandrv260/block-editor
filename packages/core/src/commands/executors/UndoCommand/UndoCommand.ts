import { createHistoryUndoEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import { Command } from "../Command";

export class UndoCommand extends Command<"history:undo"> {
  // TODO: This seems a bit... like easy to break. What if I change the impl of history.undo and then the command breaks for no good reason? This doesn't make sense. I better expose a pure method or a getter property from DocumentHistory like canUndo and canRedo so I can use it here. This will be a thousand times easier to reason about and less flaky.
  public execute(): void {
    const currentDocumentJSON = this.history.undo();

    if (!currentDocumentJSON) {
      return;
    }

    this.document.swap(currentDocumentJSON);
    this.eventBus.emit("history:undo", createHistoryUndoEvent());
  }
}
