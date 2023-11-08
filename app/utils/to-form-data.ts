export type Payload = {
  [key: string]: string | Blob | string[];
};

/**
 * Converts a payload object into a FormData instance.
 *
 * @param payload - An object with string keys and values of either `string`,
 * `Blob`, or an array of `string`.
 * @returns A FormData instance populated with the provided payload.
 *
 * @example
 * const payload = {
 *   text: 'Hello',
 *   file: new Blob(['content'], { type: 'text/plain' }),
 *   questions: ['What is up?', 'Can you tell me?'],
 * };
 * const formData = toFormData(payload);
 */
export function toFormData(payload: Payload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(element => {
        formData.append(key, element);
      });
    } else {
      formData.append(key, value);
    }
  });

  return formData;
}
