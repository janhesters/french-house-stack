import { Link } from '@remix-run/react';
import { CheckIcon } from 'lucide-react';

import { DisableableLink } from '~/components/disableable-link';
import { cn } from '~/utils/shadcn-ui';

type Step = {
  name: string;
  href: string;
  status: 'complete' | 'current' | 'upcoming';
  disabled?: boolean;
};

export type StepsPanelsComponentProps = {
  label: string;
  steps: Step[];
};

export function StepsPanelsComponent({
  label,
  steps,
}: StepsPanelsComponentProps) {
  return (
    <nav aria-label={label}>
      <ol className="divide-y divide-border rounded-lg border bg-card shadow md:flex md:divide-y-0">
        {steps.map((step, stepIndex) => (
          <li key={step.name} className="relative md:flex md:flex-1">
            {step.status === 'complete' ? (
              <DisableableLink
                className="group flex w-full items-center rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={step.disabled}
                to={step.href}
              >
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span
                    className={cn(
                      'flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-primary',
                      !step.disabled && 'group-hover:bg-primary/90',
                    )}
                  >
                    <CheckIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </span>

                  <span className="ml-4 text-sm font-medium text-foreground">
                    {step.name}
                  </span>
                </span>
              </DisableableLink>
            ) : step.status === 'current' ? (
              <Link
                aria-current="step"
                className="flex items-center rounded-md px-6 py-4 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                to={step.href}
              >
                <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary/90">
                  <span className="text-primary/90">
                    {(stepIndex + 1).toString().padStart(2, '0').slice(-2)}
                  </span>
                </span>

                <span className="ml-4 text-sm font-medium text-primary/90">
                  {step.name}
                </span>
              </Link>
            ) : (
              <DisableableLink
                className="group flex items-center rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={step.disabled}
                to={step.href}
              >
                <span className="flex items-center px-6 py-4 text-sm font-medium">
                  <span
                    className={cn(
                      'flex size-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-foreground/30',
                      !step.disabled && 'group-hover:border-foreground/40',
                    )}
                  >
                    <span
                      className={cn(
                        'text-foreground/60',
                        !step.disabled && 'group-hover:text-foreground',
                      )}
                    >
                      {(stepIndex + 1).toString().padStart(2, '0').slice(-2)}
                    </span>
                  </span>

                  <span
                    className={cn(
                      'ml-4 text-sm font-medium text-foreground/60',
                      !step.disabled && 'group-hover:text-foreground',
                    )}
                  >
                    {step.name}
                  </span>
                </span>
              </DisableableLink>
            )}

            {stepIndex === steps.length - 1 ? undefined : (
              <>
                <div
                  className="absolute right-0 top-0 hidden h-full w-5 md:block"
                  aria-hidden="true"
                >
                  <svg
                    className="h-full w-full text-border"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      vectorEffect="non-scaling-stroke"
                      stroke="currentcolor"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
