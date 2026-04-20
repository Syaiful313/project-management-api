import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { SystemRole, GroupRole } from "../generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seeding...");

  const password = await bcrypt.hash("Admin123!", 10);

  // 1. Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@tasko.com" },
    update: {},
    create: {
      email: "superadmin@tasko.com",
      firstName: "Syaiful",
      lastName: "Admin",
      password: password,
      role: SystemRole.SUPER_ADMIN,
      isVerified: true,
    },
  });

  // 2. Create 3 Regular Users
  const userAdmin = await prisma.user.upsert({
    where: { email: "user.admin@tasko.com" },
    update: {},
    create: {
      email: "user.admin@tasko.com",
      firstName: "User",
      lastName: "Admin-Group",
      password: password,
      role: SystemRole.USER,
      isVerified: true,
    },
  });

  const userSupervisor = await prisma.user.upsert({
    where: { email: "user.supervisor@tasko.com" },
    update: {},
    create: {
      email: "user.supervisor@tasko.com",
      firstName: "User",
      lastName: "Supervisor",
      password: password,
      role: SystemRole.USER,
      isVerified: true,
    },
  });

  const userMember = await prisma.user.upsert({
    where: { email: "user.member@tasko.com" },
    update: {},
    create: {
      email: "user.member@tasko.com",
      firstName: "User",
      lastName: "Member",
      password: password,
      role: SystemRole.USER,
      isVerified: true,
    },
  });

  console.log("Users created successfully.");

  // 3. Create 1 Group
  const mainGroup = await prisma.group.create({
    data: {
      title: "Scuto Main Workspace",
      totalKpi: 100,
      isStrict: true,
    },
  });

  console.log(`Group "${mainGroup.title}" created.`);

  // 4. Assign 3 Users to Group with different roles
  await prisma.groupMember.createMany({
    data: [
      {
        userId: userAdmin.id,
        groupId: mainGroup.id,
        role: GroupRole.ADMIN,
      },
      {
        userId: userSupervisor.id,
        groupId: mainGroup.id,
        role: GroupRole.SUPERVISOR,
      },
      {
        userId: userMember.id,
        groupId: mainGroup.id,
        role: GroupRole.MEMBER,
      },
    ],
  });

  console.log(
    "Group members assigned with Admin, Supervisor, and Member roles.",
  );
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
