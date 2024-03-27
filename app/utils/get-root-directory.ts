import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const getRootDirectory = (directory: string): string => {
  let currentPath = directory;
  while (!existsSync(join(currentPath, 'package.json'))) {
    const parentDirectory = dirname(currentPath);
    if (parentDirectory === currentPath) {
      throw new Error(
        'Reached the filesystem root without finding package.json.',
      );
    }
    currentPath = parentDirectory;
  }
  return currentPath;
};
