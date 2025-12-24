import { type BlockPayload, DEFAULT_DOCUMENT_ROOT_ID } from "@block-editor/core";
import { useInsertBlock, useHistory } from "@block-editor/react";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  outline?: boolean;
  disabled?: boolean;
}

const Button = ({
  children,
  onClick,
  outline = false,
  disabled = false,
}: ButtonProps) => {
  const variantClassName = outline
    ? "border-gray-300 border"
    : "bg-blue-500 text-white";

  return (
    <button
      type="button"
      className={`${variantClassName} text-sm px-2 py-2 rounded-md disabled:pointer-events-none disabled:opacity-50 cursor-pointer`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const SAMPLE_BLOCK1 = {
  id: "node1",
  type: "heading",
  data: { text: "some_text", level: 1 },
} as const satisfies BlockPayload;

export default function EditorInfo() {
  const insertBlock = useInsertBlock();
  const { isHistoryEmpty, clearHistory } = useHistory();

  const onAppendBlock = () => {
    insertBlock({
      newBlock: {
        ...SAMPLE_BLOCK1,
        id: crypto.randomUUID(),
        data: { ...SAMPLE_BLOCK1.data, text: "Test" },
      },
      targetId: DEFAULT_DOCUMENT_ROOT_ID,
      strategy: "append",
    });
  };

  return (
    <div className="mb-10">
      <div className="mb-5 flex items-center justify-center gap-2">
        <Button onClick={onAppendBlock}>Append</Button>

        <Button onClick={clearHistory} disabled={isHistoryEmpty} outline>
          Clear history
        </Button>
      </div>
    </div>
  );
}
