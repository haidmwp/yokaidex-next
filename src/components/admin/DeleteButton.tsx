"use client";

/** Nút xoá có hỏi xác nhận; `action` là server action đã bind sẵn id. */
export default function DeleteButton({
  action,
  label = "Xoá",
  confirmText = "Bạn chắc chắn muốn xoá? Thao tác này không thể hoàn tác.",
  small,
}: {
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
  small?: boolean;
}) {
  return (
    <button
      type="submit"
      formAction={action}
      formNoValidate
      className={`a-btn a-btn-danger${small ? " a-btn-sm" : ""}`}
      onClick={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      {label}
    </button>
  );
}

/** Như DeleteButton nhưng tự bọc trong <form> riêng (dùng ngoài form khác). */
export function DeleteForm(props: Parameters<typeof DeleteButton>[0]) {
  return (
    <form style={{ display: "inline" }}>
      <DeleteButton {...props} />
    </form>
  );
}
