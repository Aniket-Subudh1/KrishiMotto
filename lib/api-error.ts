import axios from 'axios';

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
};

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.error?.message;
    if (message) {
      return message;
    }

    if (error.message === 'Network Error') {
      return 'Unable to reach the server. Check your connection.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
