export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const badRequest = message => new HttpError(400, 'VALIDATION_ERROR', message);
export const unauthorized = (message = 'Please sign in to continue.') => new HttpError(401, 'UNAUTHENTICATED', message);
export const forbidden = (message = 'You do not have permission to do this.') => new HttpError(403, 'FORBIDDEN', message);
export const notFound = message => new HttpError(404, 'NOT_FOUND', message);
export const conflict = message => new HttpError(409, 'CONFLICT', message);
