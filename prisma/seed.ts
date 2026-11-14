/* Nạp dữ liệu từ prisma/seed-data/*.json vào database.
 *   npm run db:seed            -> xoá & nạp lại toàn bộ nội dung, tạo admin nếu chưa có
 * Tài khoản admin lấy từ ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD trong .env
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

  // yokais.json = Yo-kai Watch 3; yokais-yw1/yw2.json = cào từ fandom (scripts/scrape-fandom.mjs)
  const yokais = [
    ...load("yokais-yw1"),
    ...load("yokais-yw2"),
    ...load("yokais").map((y) => ({ ...y, game: 3 })),
  ];
  for (let i = 0; i < yokais.length; i += 100) {
    await prisma.yokai.createMany({ data: yokais.slice(i, i + 100) });
  }
  console.log(`✓ ${yokais.length} yokai (YW1 + YW2 + YW3)`);

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
  for (const s of load("settings")) {
    await prisma.setting.upsert({ where: { key: s.key }, create: s, update: { value: s.value } });
  }
  console.log("✓ baffle board, attitudes, special souls, changelog, pages, settings");

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const username = process.env.ADMIN_USERNAME?.toLowerCase() || null;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (!exists) {
      await prisma.user.create({
        data: { username, email, name: "Admin", passwordHash: await bcrypt.hash(password, 10) },
      });
      console.log(`✓ tạo tài khoản admin ${username ?? email}`);
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
