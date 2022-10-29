import 'dotenv/config';

import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { exit } from 'process';

const prettyPrint = (object: any) =>
  console.log(JSON.stringify(object, undefined, 2));

const prisma = new PrismaClient();

const userId = process.env.SEED_USER_ID;

async function seed() {
  if (!userId) {
    throw new Error('Please provide a userId to seed.ts');
  }

  const user = await prisma.userProfile.create({
    data: {
      id: userId,
      email: faker.internet.email(),
      name: faker.name.fullName(),
      avatar: faker.image.avatar(),
    },
  });
  console.log('========= result of seed: =========');
  prettyPrint({ user });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    exit(1);
  });
