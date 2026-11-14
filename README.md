# YokaiDex (Next.js + Admin)

Bản chuyển đổi của dự án `yokaidex` (Create React App) sang **Next.js 16 (App Router)**, dữ liệu lưu trong database qua **Prisma**, kèm **trang quản trị nội dung** tại `/admin`.

## Chạy dự án

```bash
npm install
npm run db:push     # tạo bảng
npm run db:seed     # nạp dữ liệu gốc + tạo tài khoản admin (ADMIN_EMAIL / ADMIN_PASSWORD trong .env)
npm run dev         # http://localhost:3000  –  admin: http://localhost:3000/admin
```

Production: `npm run build && npm start`.

> ⚠️ `npm run db:seed` **xoá và nạp lại** toàn bộ nội dung từ `prisma/seed-data/` – chỉ dùng khi khởi tạo.

## Cấu hình (.env)

| Biến | Ý nghĩa |
| --- | --- |
| `DATABASE_URL` | Mặc định SQLite `file:./dev.db`. Dùng MySQL của Laragon: đổi `provider = "mysql"` trong `prisma/schema.prisma` và đặt `mysql://root:@localhost:3306/yokaidex` |
| `AUTH_SECRET` | Khoá ký phiên đăng nhập admin (chuỗi ngẫu nhiên dài) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Tài khoản admin đầu tiên tạo khi seed – đổi mật khẩu sau khi đăng nhập |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (tuỳ chọn) |
| `NEXT_PUBLIC_SITE_URL` | URL site, dùng cho metadata / nút chia sẻ |
| `UPLOAD_DIR` | (tuỳ chọn) thư mục lưu ảnh upload, mặc định `./uploads` |

## Cấu trúc

```
prisma/schema.prisma        Mô hình dữ liệu (Yokai, Food, QR, Password, BaffleBoard, ...)
prisma/seed-data/*.json     Dữ liệu trích từ dự án cũ (scripts/extract-legacy.mjs)
src/app/(site)/             Website public – giữ nguyên URL & giao diện cũ
src/app/admin/              Trang quản trị (đăng nhập, CRUD nội dung)
src/app/uploads/            Phục vụ ảnh upload từ admin
src/lib/data.ts             Truy vấn public có cache ('use cache' + tag "content")
src/styles/site.css         CSS gốc của site, gộp lại
src/styles/admin.css        CSS trang admin
```

## Admin quản lý được

- **Yo-kai**: thông tin, ảnh, chỉ số, profile, tiến hoá, hợp thể, move set, ẩn/hiện
- **Food**: nhóm món ăn + danh sách món
- **QR Code**: loại coin + các bộ QR (danh sách ảnh slide)
- **Password**: theo game / vùng ngôn ngữ
- **Baffle Board**, **RARE Special Soul**, **Attitudes**, **Changelog**
- **Trang tĩnh**: Home, Privacy Policy (HTML + xem trước)
- **Tin nhắn liên hệ** (form Contact Us lưu vào DB thay cho EmailJS)
- **Tài khoản admin**: thêm/xoá, đổi mật khẩu
- Upload ảnh trực tiếp trong mọi ô ảnh

Khi lưu trong admin, cache của site public được làm mới ngay (`updateTag("content")`).

## Ghi chú khi deploy

- Dùng host chạy Node (VPS, Docker...) để giữ được file SQLite và thư mục `uploads/`. Nếu deploy serverless (Vercel), chuyển sang MySQL/Postgres và lưu ảnh lên dịch vụ lưu trữ (S3, R2...).
- Ảnh QR vẫn trỏ tới blogspot như bản cũ.
