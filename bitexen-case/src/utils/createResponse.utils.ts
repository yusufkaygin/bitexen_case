interface CreateResponseParams {
  isError?: boolean;
  message?: object;
}

export function createResponse({
  isError = false,
  message,
}: CreateResponseParams) {
  let messageKey = isError ? 'error' : 'success';

  return {
    isError,
    [messageKey]: message,
  };
}
