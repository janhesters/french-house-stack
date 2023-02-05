import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import {
  Form as FrameworkForm,
  useActionData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormProps } from 'remix-forms';
import { createForm } from 'remix-forms';
import type { SomeZodObject } from 'zod';

/**
 * Maps ids to autoComplete values.
 *
 * @see https://github.com/SeasonedSoftware/remix-forms/issues/53
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
 *
 * @param id - An id from a the child of a <form /> element.
 * @returns An autocomplete value.
 */
export const mapIdToAutoComplete = (id?: string) =>
  ({
    name: 'name',
    firstName: 'given-name',
    lastName: 'family-name',
    emailAddress: 'email',
    username: 'username',
    country: 'country-name',
    streetAddress: 'street-address',
    city: 'address-level2',
    stateProvince: 'address-level1',
    zipPostalCode: 'postal-code',
  }[id ?? '']);

const Button = ({ className, ...props }: JSX.IntrinsicElements['button']) => (
  <button
    className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    {...props}
  />
);

const CheckBox = forwardRef<HTMLInputElement, JSX.IntrinsicElements['input']>(
  function CheckBox({ type = 'checkbox', ...props }, ref) {
    return (
      <input
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

const CheckBoxWrapper = (props: JSX.IntrinsicElements['div']) => (
  <div className="flex h-5 items-center" {...props} />
);

const Error = ({ children, ...props }: JSX.IntrinsicElements['div']) => {
  const { t } = useTranslation('user-profile');

  return (
    <p className="mt-2 text-sm text-red-600" {...props}>
      {Array.isArray(children) ? t(children[0]) : children}
    </p>
  );
};

const GlobalError = (props: JSX.IntrinsicElements['p']) => (
  <div className="rounded-md bg-yellow-50 p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <ExclamationCircleIcon
          className="h-5 w-5 text-yellow-400"
          aria-hidden="true"
        />
      </div>

      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">
          Attention needed
        </h3>
        <div className="mt-2 text-sm text-yellow-700">
          <p {...props} />
        </div>
      </div>
    </div>
  </div>
);

const Field = (props: JSX.IntrinsicElements['div']) => (
  <div className="sm:col-span-6" {...props} />
);

const Input = forwardRef<HTMLInputElement, JSX.IntrinsicElements['input']>(
  function Input({ type = 'text', ...props }, ref) {
    return (
      <input
        autoComplete={mapIdToAutoComplete(props.name)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-500 dark:bg-slate-700 dark:text-white sm:text-sm"
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

const Label = (props: JSX.IntrinsicElements['label']) => (
  <label
    className="block text-sm font-medium text-gray-700 dark:text-gray-400"
    {...props}
  />
);

export const Radio = forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements['input']
>(function Radio({ type = 'radio', ...props }, ref) {
  return (
    <input
      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
      ref={ref}
      type={type}
      {...props}
    />
  );
});

const Select = forwardRef<HTMLSelectElement, JSX.IntrinsicElements['select']>(
  function Select(props, ref) {
    return (
      <select
        autoComplete={mapIdToAutoComplete(props.name)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        ref={ref}
        {...props}
      />
    );
  },
);

const TextArea = forwardRef<
  HTMLTextAreaElement,
  JSX.IntrinsicElements['textarea']
>(function TextArea(props, ref) {
  return (
    <textarea
      className="block w-full rounded-md border-gray-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      ref={ref}
      rows={3}
      {...props}
    />
  );
});

const RemixForm = createForm({
  component: FrameworkForm,
  useNavigation,
  useSubmit,
  useActionData,
});

export const Form = <Schema extends SomeZodObject>(
  props: FormProps<Schema>,
) => (
  <RemixForm<Schema>
    className="space-y-8 divide-y divide-gray-200"
    buttonComponent={Button}
    checkboxComponent={CheckBox}
    checkboxWrapperComponent={CheckBoxWrapper}
    errorComponent={Error}
    fieldComponent={Field}
    globalErrorsComponent={GlobalError}
    inputComponent={Input}
    labelComponent={Label}
    multilineComponent={TextArea}
    selectComponent={Select}
    renderField={({ Field, ...props }) => {
      const { name } = props;

      return (
        <Field key={name as string} {...props}>
          {({ Label, SmartInput, Errors }) => (
            <>
              <Label />

              <div className="mt-1">
                <SmartInput />
              </div>

              <Errors />
            </>
          )}
        </Field>
      );
    }}
    {...props}
  />
);
