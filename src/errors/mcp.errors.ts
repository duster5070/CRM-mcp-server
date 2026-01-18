export enum McpErrorCode {
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  METHOD_NOT_FOUND = -32601,
  PARSE_ERROR = -32700,
  PERMISSION_DENIED = 403,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
}

export class McpError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'McpError';
  }
}

export class UnauthorizedError extends McpError {
  constructor(message: string = 'Permission denied') {
    super(McpErrorCode.PERMISSION_DENIED, message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends McpError {
  constructor(resource: string) {
    super(McpErrorCode.NOT_FOUND, `Resource not found: ${resource}`);
    this.name = 'NotFoundError';
  }
}

export class InputValidationError extends McpError {
  constructor(message: string) {
    super(McpErrorCode.INVALID_PARAMS, message);
    this.name = 'InputValidationError';
  }
}
