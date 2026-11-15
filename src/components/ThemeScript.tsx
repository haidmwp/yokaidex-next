/**
 * Đặt html[data-theme] trước khi trang hiện ra (không bị nháy màu): lựa chọn đã lưu ở localStorage,
 * chưa chọn thì theo cài đặt sáng/tối của thiết bị. Nút chuyển: components/ThemeToggle.tsx.
 * Website và trang quản trị lưu lựa chọn riêng (THEME_KEYS).
 */
export const THEME_KEYS = { site: "yd-theme", admin: "yd-admin-theme" } as const;

const script = (key: string) =>
  `(function(){try{var t=localStorage.getItem(${JSON.stringify(key)});if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function ThemeScript({ storageKey }: { storageKey: string }) {
  return <script dangerouslySetInnerHTML={{ __html: script(storageKey) }} />;
}
