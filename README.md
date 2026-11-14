# YokaiDex (Next.js + Admin)

Bản chuyển đổi của dự án `yokaidex` (Create React App) sang **Next.js 16 (App Router)**, dữ liệu lưu trong database qua **Prisma**, kèm **trang quản trị nội dung** tại `/dashboard`.

## Chạy dự án

```bash
npm install
npm run db:push     # tạo bảng
npm run db:seed     # nạp dữ liệu gốc + tạo tài khoản admin (ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD trong .env)
npm run dev         # http://localhost:3000  –  admin: http://localhost:3000/dashboard
```

Production: `npm run build && npm start`.

> ⚠️ `npm run db:seed` **xoá và nạp lại** toàn bộ nội dung từ `prisma/seed-data/` – chỉ dùng khi khởi tạo.

## Cấu hình (.env)

| Biến | Ý nghĩa |
| --- | --- |
| `DATABASE_URL` | Mặc định SQLite `file:./dev.db`. Dùng MySQL của Laragon: đổi `provider = "mysql"` trong `prisma/schema.prisma` và đặt `mysql://root:@localhost:3306/yokaidex` |
| `AUTH_SECRET` | Khoá ký phiên đăng nhập admin (chuỗi ngẫu nhiên dài) |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Tài khoản admin đầu tiên tạo khi seed (đăng nhập bằng username hoặc email) – đổi mật khẩu sau khi đăng nhập |
| `NEXT_PUBLIC_GA_ID` | Mã Google Analytics mặc định, chỉ dùng khi chưa lưu trong Admin › Cài đặt chung (nơi đổi mã GA không cần build lại) |
| `NEXT_PUBLIC_SITE_URL` | URL site, dùng cho metadata / nút chia sẻ |
| `UPLOAD_DIR` | (tuỳ chọn) thư mục lưu ảnh upload, mặc định `./uploads` |

## Cấu trúc

```
prisma/schema.prisma        Mô hình dữ liệu (Yokai, Food, QR, Password, BaffleBoard, ...)
prisma/seed-data/*.json     Dữ liệu trích từ dự án cũ (scripts/extract-legacy.mjs);
                            yokais-yw1/yw2.json cào từ Yo-kai Watch Wiki (scripts/scrape-fandom.mjs)
src/app/(site)/             Website public – giữ nguyên URL & giao diện cũ
src/app/dashboard/          Trang quản trị (đăng nhập, CRUD nội dung)
src/app/uploads/            Phục vụ ảnh upload từ admin
src/lib/data.ts             Truy vấn public có cache ('use cache' + tag "content")
src/styles/site.css         CSS gốc của site, gộp lại
src/styles/admin.css        CSS trang admin
```

## Admin quản lý được

- **Yo-kai** (theo từng game Yo-kai Watch 1 / 2 / 3): thông tin, ảnh, chỉ số, profile, tiến hoá, hợp thể, move set, ẩn/hiện
- **Food**: nhóm món ăn + danh sách món
- **QR Code**: loại coin + các bộ QR (danh sách ảnh slide)
- **Password**: theo game / vùng ngôn ngữ
- **Baffle Board**, **RARE Special Soul**, **Attitudes**, **Changelog**
- **Trang tĩnh**: Home, Privacy Policy (HTML + xem trước)
- **Tin nhắn liên hệ** (form Contact Us lưu vào DB thay cho EmailJS)
- **Tài khoản admin**: thêm/xoá, đổi mật khẩu
- Upload ảnh trực tiếp trong mọi ô ảnh

Khi lưu trong admin, cache của site public được làm mới ngay (`updateTag("content")`).

## Medallium theo game

- `/medallium` chọn game · `/yokai-watch-1|2|3` danh sách (Medallium Yo-kai Watch 1/2/3) · `/yokai-watch-N/<slug>` chi tiết.
- URL cũ `/yokai-information/<slug>` tự chuyển (308) sang `/yokai-watch-3/<slug>`.
- Dữ liệu YW1/YW2 cào từ Yo-kai Watch Wiki: danh sách Medallium (số, tên, rank, tribe, attribute, món ăn) + trang từng yo-kai (stats, move set, profile, evolution, fusion theo đúng game; công thức chỉ nhận khi mọi yo-kai trong đó có mặt trong Medallium của game). Ảnh dùng lại từ YW3.
- Cào lại: `node scripts/scrape-fandom.mjs` (ghi đè seed-data YW1/YW2). Soi 1 trang: `DEBUG_PAGE=Kyubi DEBUG_GAME=1 node scripts/scrape-fandom.mjs` · liệt kê công thức bị bỏ: `REPORT=1 node scripts/scrape-fandom.mjs`.

## Ghi chú khi deploy

- Dùng host chạy Node (VPS, Docker...) để giữ được file SQLite và thư mục `uploads/`. Nếu deploy serverless (Vercel), chuyển sang MySQL/Postgres và lưu ảnh lên dịch vụ lưu trữ (S3, R2...).
- Ảnh QR vẫn trỏ tới blogspot như bản cũ.
