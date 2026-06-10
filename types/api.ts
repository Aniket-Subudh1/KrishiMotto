export type ResponseMeta = {
  requestId?: string;
  ts: string;
};

/** V1 envelope: `/api/v1/*` */
export type V1Response<T> = {
  data: T;
  meta: ResponseMeta;
};

/** Legacy envelope: `/auth/*` */
export type LegacyResponse<T> = {
  response: T;
  meta: ResponseMeta;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
};

export type PaginatedItems<T> = {
  items: T[];
};
