import { PrismaClient, Prisma } from "../src/generated/prisma";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    id: "user",
    name: "RaNii",
    email: "johnsontolotriniavo@gmail.com",
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    boards: {
      create: [
        {
          title: "Web master",
          createdAt: new Date(),
          columns: {
            create: [
              {
                title: "À faire",
                position: 1,
                tasks: {
                  create: [
                    {
                      content: "Installer Next.js",
                      position: 1,
                      createdAt: new Date(),
                    },
                    {
                      content: "Configurer Prisma",
                      position: 2,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
              {
                title: "En cours",
                position: 2,
                tasks: {
                  create: [
                    {
                      content: "Coder l’authentification",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
              {
                title: "Terminé",
                position: 3,
                tasks: {
                  create: [
                    {
                      content: "Initialiser le repo",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
            ],
          },
        },
        // Nouveau board 1
        {
          title: "Reacc Native project",
          createdAt: new Date(),
          columns: {
            create: [
              {
                title: "À faire",
                position: 1,
                tasks: {
                  create: [
                    {
                      content: "Installer Expo",
                      position: 1,
                      createdAt: new Date(),
                    },
                    {
                      content: "Configurer navigation",
                      position: 2,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
              {
                title: "En cours",
                position: 2,
                tasks: {
                  create: [
                    {
                      content: "Créer l’écran d’accueil",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
              {
                title: "Terminé",
                position: 3,
                tasks: {
                  create: [
                    {
                      content: "Initialiser le projet",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
            ],
          },
        },
        // Nouveau board 2
        {
          title: "Data Science",
          createdAt: new Date(),
          columns: {
            create: [
              {
                title: "À faire",
                position: 1,
                tasks: {
                  create: [
                    {
                      content: "Collecter les données",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
              {
                title: "En cours",
                position: 2,
                tasks: {
                  create: [
                    {
                      content: "Nettoyer les données",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
              {
                title: "Terminé",
                position: 3,
                tasks: {
                  create: [
                    {
                      content: "Définir le problème",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
            ],
          },
        },
        // Nouveau board 3
        {
          title: "Projet Design",
          createdAt: new Date(),
          columns: {
            create: [
              {
                title: "À faire",
                position: 1,
                tasks: {
                  create: [
                    {
                      content: "Créer moodboard",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
              {
                title: "En cours",
                position: 2,
                tasks: {
                  create: [
                    {
                      content: "Maquetter la page d’accueil",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
              {
                title: "Terminé",
                position: 3,
                tasks: {
                  create: [
                    {
                      content: "Choisir la palette de couleurs",
                      position: 1,
                      createdAt: new Date(),
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  },
];

export async function main() {
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
  console.log("Seed terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
