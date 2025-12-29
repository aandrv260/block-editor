import { cls } from "@/common/cls";

interface Props {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

export default function EditorStateTab({ children, onClick, active }: Props) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "text-sm cursor-pointer border-b py-3",
        active ? "border-b-white" : "border-b-transparent",
      )}
    >
      {children}
    </button>
  );
}
