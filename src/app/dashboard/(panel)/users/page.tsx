import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import AdminForm from "@/components/admin/AdminForm";
import { DeleteForm } from "@/components/admin/DeleteButton";
import { TextField } from "@/components/admin/Fields";
import { changePassword, createUser, deleteUser, updateProfile } from "./actions";

const USERNAME_HINT = "3–32 ký tự: chữ thường, số, . _ - · không dùng \"admin\"";

export default async function UsersAdmin() {
  const me = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  const self = users.find((u) => u.id === me.id)!;
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>Tài khoản admin</h1>
          <p>Đăng nhập bằng username hoặc email</p>
        </div>
      </div>
      <div className="a-table-wrap" style={{ marginBottom: 18 }}>
        <table className="a-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Tên</th>
              <th>Ngày tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.username ?? <span className="a-hint">(chưa đặt)</span>}</b>{" "}
                  {u.id === me.id && <span className="a-pill">bạn</span>}
                </td>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.createdAt.toLocaleDateString("vi-VN")}</td>
                <td className="a-right">
                  {u.id !== me.id && (
                    <DeleteForm small action={deleteUser.bind(null, u.id)} confirmText={`Xoá tài khoản ${u.username ?? u.email}?`} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="a-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
        <div>
          <h2>Thông tin của bạn</h2>
          <AdminForm action={updateProfile} submitLabel="Lưu thông tin">
            <div className="a-card">
              <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <TextField name="username" label="Username" defaultValue={self.username ?? ""} hint={USERNAME_HINT} />
                <TextField name="email" label="Email" type="email" defaultValue={self.email} required />
                <TextField name="name" label="Tên hiển thị" defaultValue={self.name} />
              </div>
            </div>
          </AdminForm>
        </div>
        <div>
          <h2>Đổi mật khẩu của bạn</h2>
          <AdminForm action={changePassword} submitLabel="Đổi mật khẩu">
            <div className="a-card">
              <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <TextField name="current" label="Mật khẩu hiện tại" type="password" required />
                <TextField name="next" label="Mật khẩu mới" type="password" required hint="Tối thiểu 8 ký tự" />
                <TextField name="confirm" label="Nhập lại mật khẩu mới" type="password" required />
              </div>
            </div>
          </AdminForm>
        </div>
        <div>
          <h2>Thêm admin</h2>
          <AdminForm action={createUser} submitLabel="Tạo tài khoản">
            <div className="a-card">
              <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <TextField name="username" label="Username" hint={USERNAME_HINT} />
                <TextField name="email" label="Email" type="email" required />
                <TextField name="name" label="Tên hiển thị" />
                <TextField name="password" label="Mật khẩu" type="password" required hint="Tối thiểu 8 ký tự" />
              </div>
            </div>
          </AdminForm>
        </div>
      </div>
    </>
  );
}
