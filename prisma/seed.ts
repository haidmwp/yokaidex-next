/* Nạp dữ liệu từ prisma/seed-data/*.json vào database.
 *   npm run db:seed            -> xoá & nạp lại toàn bộ nội dung, tạo admin nếu chưa có
 * Tài khoản admin lấy từ ADMIN_EMAIL / ADMIN_PASSWORD trong .env
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dir = path.join(__dirname, "seed-data");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const load = (name: string): any[] => JSON.parse(fs.readFileSync(path.join(dir, name + ".json"), "utf8"));

async function main() {
  console.log("Xoá dữ liệu cũ...");
  await prisma.$transaction([
    prisma.foodItem.deleteMany(),
    prisma.foodCategory.deleteMany(),
    prisma.qrSet.deleteMany(),
    prisma.qrCategory.deleteMany(),
    prisma.password.deleteMany(),
    prisma.passwordRegion.deleteMany(),
    prisma.baffleBoard.deleteMany(),
    prisma.attitude.deleteMany(),
    prisma.specialSoul.deleteMany(),
    prisma.changelog.deleteMany(),
    prisma.page.deleteMany(),
    prisma.yokai.deleteMany(),
  ]);

  const yokais = load("yokais");
  for (let i = 0; i < yokais.length; i += 100) {
    await prisma.yokai.createMany({ data: yokais.slice(i, i + 100) });
  }
  console.log(`✓ ${yokais.length} yokai`);

  for (const { items, ...cat } of load("food")) {
    await prisma.foodCategory.create({
      data: { ...cat, items: { create: items.map((it: object, i: number) => ({ ...it, sortOrder: i })) } },
    });
  }
  console.log("✓ food");

  for (const { sets, ...cat } of load("qr")) {
    await prisma.qrCategory.create({ data: { ...cat, sets: { create: sets } } });
  }
  console.log("✓ qr code");

  for (const { passwords, ...region } of load("passwords")) {
    await prisma.passwordRegion.create({ data: { ...region, passwords: { create: passwords } } });
  }
  console.log("✓ passwords");

  await prisma.baffleBoard.createMany({ data: load("baffleboards") });
  await prisma.attitude.createMany({ data: load("attitudes") });
  await prisma.specialSoul.createMany({ data: load("specialsouls") });
  await prisma.changelog.createMany({ data: load("changelog") });
  await prisma.page.createMany({ data: load("pages") });
  console.log("✓ baffle board, attitudes, special souls, changelog, pages");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (!exists) {
      await prisma.user.create({
        data: { email, name: "Admin", passwordHash: await bcrypt.hash(password, 10) },
      });
      console.log(`✓ tạo tài khoản admin ${email}`);
    }
  } else {
    console.warn("! Thiếu ADMIN_EMAIL / ADMIN_PASSWORD – chưa tạo tài khoản admin");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
