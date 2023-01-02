import { Magic } from '@magic-sdk/admin';
import invariant from 'tiny-invariant';

invariant(process.env.MAGIC_SECRET_KEY, 'MAGIC_SECRET_KEY must be set');

export const magicAdmin = new Magic(process.env.MAGIC_SECRET_KEY);
