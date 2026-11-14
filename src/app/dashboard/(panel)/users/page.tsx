import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import AdminForm from "@/components/admin/AdminForm";
import { DeleteForm } from "@/components/admin/DeleteButton";
import { TextField } from "@/components/admin/Fields";
import { changePassword, createUser, deleteUser, updateProfile } from "./actions";
import { getTr } from "@/lib/admin-lang-server";

export default async function UsersAdmin() {
  const me = await requireAdmin();
  const { tr, locale } = await getTr();
  const USERNAME_HINT = tr('3–32 ký tự: chữ thường, số, . _ - · không dùng "admin"', '3–32 chars: lowercase letters, digits, . _ - · "admin" is not allowed');
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  const self = users.find((u) => u.id === me.id)!;
  return (
    <>
      <div className="a-page-head">
        <div>
          <h1>{tr("Tài khoản admin", "Admin accounts")}</h1>
          <p>{tr("Đăng nhập bằng username hoặc email", "Log in with username or email")}</p>
        </div>
      </div>
      <div className="a-table-wrap" style={{ marginBottom: 18 }}>
        <table className="a-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>{tr("Tên", "Name")}</th>
              <th>{tr("Ngày tạo", "Created")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <b>{u.username ?? <span className="a-hint">{tr("(chưa đặt)", "(not set)")}</span>}</b>{" "}
                  {u.id === me.id && <span className="a-pill">{tr("bạn", "you")}</span>}
                </td>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.createdAt.toLocaleDateString(locale)}</td>
                <td className="a-right">
                  {u.id !== me.id && (
                    <DeleteForm small action={deleteUser.bind(null, u.id)} confirmText={tr(`Xoá tài khoản ${u.username ?? u.email}?`, `Delete account ${u.username ?? u.email}?`)} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="a-form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
        <div>
          <h2>{tr("Thông tin của bạn", "Your profile")}</h2>
          <AdminForm action={updateProfile} submitLabel={tr("Lưu thông tin", "Save profile")}>
            <div className="a-card">
              <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <TextField name="username" label="Username" defaultValue={self.username ?? ""} hint={USERNAME_HINT} />
                <TextField name="email" label="Email" type="email" defaultValue={self.email} required />
                <TextField name="name" label={tr("Tên hiển thị", "Display name")} defaultValue={self.name} />
              </div>
            </div>
          </AdminForm>
        </div>
        <div>
          <h2>{tr("Đổi mật khẩu của bạn", "Change your password")}</h2>
          <AdminForm action={changePassword} submitLabel={tr("Đổi mật khẩu", "Change password")}>
            <div className="a-card">
              <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <TextField name="current" label={tr("Mật khẩu hiện tại", "Current password")} type="password" required />
                <TextField name="next" label={tr("Mật khẩu mới", "New password")} type="password" required hint={tr("Tối thiểu 8 ký tự", "At least 8 characters")} />
                <TextField name="confirm" label={tr("Nhập lại mật khẩu mới", "Confirm new password")} type="password" required />
              </div>
            </div>
          </AdminForm>
        </div>
        <div>
          <h2>{tr("Thêm admin", "Add admin")}</h2>
          <AdminForm action={createUser} submitLabel={tr("Tạo tài khoản", "Create account")}>
            <div className="a-card">
              <div className="a-form-grid" style={{ gridTemplateColumns: "1fr" }}>
                <TextField name="username" label="Username" hint={USERNAME_HINT} />
                <TextField name="email" label="Email" type="email" required />
                <TextField name="name" label={tr("Tên hiển thị", "Display name")} />
                <TextField name="password" label={tr("Mật khẩu", "Password")} type="password" required hint={tr("Tối thiểu 8 ký tự", "At least 8 characters")} />
              </div>
            </div>
          </AdminForm>
        </div>
      </div>
    </>
  );
}
