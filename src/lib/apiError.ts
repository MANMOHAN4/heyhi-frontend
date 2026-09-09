type ApiErrorBody = {
  code?: string;
  message?: string;
  request_id?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(status: number, body?: ApiErrorBody);

  constructor(
    code: string,
    message: string,
    status?: number,
    requestId?: string,
  );

  constructor(
    statusOrCode: number | string,
    bodyOrMessage: ApiErrorBody | string = {},
    optionalStatus = 500,
    optionalRequestId?: string,
  ) {
    const isStatusFirst = typeof statusOrCode === "number";

    const status = isStatusFirst ? statusOrCode : optionalStatus;

    const body: ApiErrorBody = isStatusFirst
      ? (bodyOrMessage as ApiErrorBody)
      : {
          code: statusOrCode,
          message: bodyOrMessage as string,
          request_id: optionalRequestId,
        };

    super(body.message ?? `Request failed with status ${status}.`);

    this.name = "ApiError";
    this.status = status;
    this.code = body.code ?? "HTTP_ERROR";
    this.requestId = body.request_id;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.code === "UNAUTHORIZED";
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {};

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = {};
  }

  return new ApiError(response.status, body);
}
