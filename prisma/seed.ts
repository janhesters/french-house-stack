import 'dotenv/config';

import { exit } from 'node:process';

import { faker } from '@faker-js/faker';
import { createId } from '@paralleldrive/cuid2';
import { PrismaClient } from '@prisma/client';

const prettyPrint = (object: any) =>
  console.log(JSON.stringify(object, undefined, 2));

const prisma = new PrismaClient();

const userDid = process.env.SEED_USER_DID;
const userEmail = process.env.SEED_USER_EMAIL;

async function seed() {
  if (!userDid) {
    throw new Error('Please provide a userDid to seed.ts');
  }

  if (!userEmail) {
    throw new Error('Please provide a userEmail to seed.ts');
  }

  console.log('👤 Creating user profiles ...');
  const user = await prisma.userProfile.create({
    data: {
      did: userDid,
      email: userEmail,
      id: createId(),
      name: faker.person.fullName(),
      acceptedTermsAndConditions: true,
    },
  });
  const memberUser = await prisma.userProfile.create({
    data: {
      did: createId(),
      email: faker.internet.email(),
      id: createId(),
      name: faker.person.fullName(),
      acceptedTermsAndConditions: true,
    },
  });
  const adminUser = await prisma.userProfile.create({
    data: {
      did: createId(),
      email: faker.internet.email(),
      id: createId(),
      name: faker.person.fullName(),
      acceptedTermsAndConditions: true,
    },
  });

  console.log('🏢 Creating organization ...');
  const organizationName = faker.company.name();
  const organization = await prisma.organization.create({
    data: {
      name: organizationName,
      slug: faker.helpers.slugify(organizationName).toLowerCase(),
    },
  });

  console.log('👥 Adding users to organization ...');
  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      memberships: {
        create: [
          { member: { connect: { id: user.id } }, role: 'owner' },
          { member: { connect: { id: memberUser.id } }, role: 'member' },
          { member: { connect: { id: adminUser.id } }, role: 'admin' },
        ],
      },
    },
  });

  console.log('========= 🌱 result of seed: =========');
  prettyPrint({ user, organization, memberUser, adminUser });
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
