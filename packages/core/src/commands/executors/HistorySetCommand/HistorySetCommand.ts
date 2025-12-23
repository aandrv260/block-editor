import { HistoryRecordMismatchError } from "../../errors/history-set/HistoryRecordMismatchError";
import { createHistorySetEvent } from "../../../events/editor-event-bus/editorEvent.emits";
import { Command } from "../Command";

export class HistorySetCommand extends Command<"history:set"> {
  public execute(): void {
    const { history } = this.payload;
    const lastRecordInHistory = history[history.length - 1];
    const isHistoryEmpty = !lastRecordInHistory;

    if (isHistoryEmpty) {
      this.setHistoryAndEmit();
      return;
    }

    if (lastRecordInHistory !== this.document.toJSON()) {
      throw new HistoryRecordMismatchError();
    }

    this.setHistoryAndEmit();
  }

  private setHistoryAndEmit() {
    this.history.setHistory(this.payload.history);
    this.eventBus.emit(
      "history:set",
      createHistorySetEvent({
        history: this.history.getHistory(),
        currentPosition: this.history.getCurrentPosition(),
        currentRecord: this.history.getCurrent(),
      }),
    );
  }
}
