export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const getErrorTitle = (error: unknown): string => {
  const message = getErrorMessage(error);
  if (message.toLowerCase().includes('network')) return 'Network Error';
  if (message.toLowerCase().includes('timeout')) return 'Request Timeout';
  if (message.toLowerCase().includes('auth')) return 'Authentication Error';
  if (message.toLowerCase().includes('unauthorized')) return 'Unauthorized';
  if (message.toLowerCase().includes('not found')) return 'Not Found';
  return 'Error';
};

export const isRecoverableError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    !message.includes('authentication') &&
    !message.includes('authorization') &&
    !message.includes('unauthorized')
  );
};

export const getRecoveryAction = (error: unknown): string => {
  const message = getErrorMessage(error).toLowerCase();

  if (message.includes('network')) {
    return 'Check your internet connection and try again';
  }
  if (message.includes('timeout')) {
    return 'The request took too long. Please try again';
  }
  if (message.includes('auth')) {
    return 'Please log in again to continue';
  }
  if (message.includes('not found')) {
    return 'The requested data could not be found';
  }
  return 'Try again or contact support if the problem persists';
};
