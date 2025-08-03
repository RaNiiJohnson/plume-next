import { PrismaClient, Prisma } from "../src/generated/prisma";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    id: "user-ranii",
    name: "Toto",
    email: "toto@gmail.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-demo",
    name: "Demo User",
    email: "demo@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-admin",
    name: "Admin",
    email: "admin@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-test",
    name: "Test User",
    email: "test@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-guest",
    name: "Invité",
    email: "guest@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  {
    id: "user-sarah",
    name: "Sarah King",
    email: "sarah.king@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-marcus",
    name: "Marcus Lee",
    email: "marcus.lee@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-elena",
    name: "Elena Torres",
    email: "elena.torres@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-zoe",
    name: "Zoé Martin",
    email: "zoe.martin@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-liam",
    name: "Liam O'Connor",
    email: "liam.oconnor@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-ava",
    name: "Ava Chen",
    email: "ava.chen@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-noah",
    name: "Noah Kim",
    email: "noah.kim@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-olivia",
    name: "Olivia Dubois",
    email: "olivia.dubois@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-ethan",
    name: "Ethan Smith",
    email: "ethan.smith@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-emma",
    name: "Emma Müller",
    email: "emma.muller@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-jacob",
    name: "Jacob Brown",
    email: "jacob.brown@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-lina",
    name: "Lina Haddad",
    email: "lina.haddad@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-thomas",
    name: "Thomas Nguyen",
    email: "thomas.nguyen@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-nora",
    name: "Nora Anders",
    email: "nora.anders@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-youssef",
    name: "Youssef Benali",
    email: "youssef.benali@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-julia",
    name: "Julia Weber",
    email: "julia.weber@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-alex",
    name: "Alex Thompson",
    email: "alex.thompson@example.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-samira",
    name: "Samira Aloui",
    email: "samira.aloui@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-david",
    name: "David Cohen",
    email: "david.cohen@example.com",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function main() {
  console.log("🌱 Début du seeding...");

  for (const user of userData) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (existingUser) {
        console.log(
          `✅ L'utilisateur ${user.name} (${user.email}) existe déjà - ignoré`
        );
        continue;
      }

      await prisma.user.create({ data: user });
      console.log(`✨ Utilisateur créé: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(
        `❌ Erreur lors de la création de l'utilisateur ${user.name}:`,
        error
      );
    }
  }

  console.log("🎉 Seed terminé !");
}

export async function mainWithUpsert() {
  console.log("🌱 Début du seeding avec upsert...");

  for (const user of userData) {
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          updatedAt: new Date(),
        },
        create: user,
      });
      console.log(`✨ Utilisateur traité: ${user.name} (${user.email})`);
    } catch (error) {
      console.error(
        `❌ Erreur lors du traitement de l'utilisateur ${user.name}:`,
        error
      );
    }
  }

  console.log("🎉 Seed terminé !");
}

main()
  .catch((e) => {
    console.error("💥 Erreur générale:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
