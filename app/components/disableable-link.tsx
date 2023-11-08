import type { LinkProps } from '@remix-run/react';
import { Link } from '@remix-run/react';

export type DisableableLinkComponentProps = LinkProps & { disabled?: boolean };

export function DisableableLink(props: DisableableLinkComponentProps) {
  const { disabled, children, ...rest } = props;

  return disabled ? (
    <span aria-disabled="true" {...rest}>
      {children}
    </span>
  ) : (
    <Link {...rest}>{children}</Link>
  );
}
