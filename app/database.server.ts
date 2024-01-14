import { init } from '@paralleldrive/cuid2';
import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  var __database__: PrismaClient;
}

const cuid = init({ length: 8 });

/**
 * Middleware to avoid collisions when setting a slug. It autogenerates a slug
 * with cuid, which should pretty much never collide.
 *
 * @param parameters - An object with information about the action (e.g. name
 * of the query).
 * @param next - next represents the "next level" in the middleware stack, which
 * could be the next middleware or the Prisma Query, depending on where in the
 * stack you are.
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/middleware
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/middleware#running-order-and-the-middleware-stack
 *
 * @returns The result of the next middleware in the stack.
 */
const slugMiddleware: Prisma.Middleware = async (parameters, next) => {
  if (parameters.action === 'create' && parameters.model === 'Organization') {
    const {
      args: { data },
    } = parameters;
    const slugExists = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    // If the slug exists, or the slug is a hardcoded route we need to generate
    // a new slug.
    if (slugExists || data.slug === 'new') {
      data.slug = (data.slug + '-' + cuid()).toLowerCase();
    }
  }

  if (parameters.action === 'update' && parameters.model === 'Organization') {
    const {
      args: { data, where },
    } = parameters;
    if (data.slug) {
      const slugExists = await prisma.organization.findUnique({
        where: { slug: data.slug },
      });

      // If the slug exists, and it's not the slug of the organization we're
      // updating, or the slug is a hardcoded route then we need to generate a
      // new slug.
      if ((slugExists && slugExists.id !== where.id) || data.slug === 'new') {
        data.slug = (data.slug + '-' + cuid()).toLowerCase();
      }
    }
  }

  const result = await next(parameters);
  return result;
};

// This is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// In production we'll have a single connection to the DB.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();

  prisma.$use(slugMiddleware);
} else {
  if (!global.__database__) {
    global.__database__ = new PrismaClient();

    global.__database__.$use(slugMiddleware);
  }
  prisma = global.__database__;
  prisma.$connect();
}

export { prisma };
