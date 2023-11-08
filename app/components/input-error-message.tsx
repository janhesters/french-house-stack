import type { ReactNode } from 'react';

type InputErrorMessageProps = {
  children: ReactNode;
  id: string;
} & Omit<JSX.IntrinsicElements['div'], 'children' | 'id'>;

export function InputErrorMessage(props: InputErrorMessageProps) {
  return (
    <div className="mt-2 text-sm text-red-600 dark:text-red-500" {...props} />
  );
}
