interface ValidationError {
  type: string;
  columns: string[];
}

export const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const response = (statusCode: number, body: any) => {
  console.log(statusCode, body);
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
};

export const successResponse = (statusCode: number, message: string) => {
  return response(statusCode, { message });
};

export const errorResponse = (statusCode: number, error: string) => {
  return response(statusCode, { error });
};

export const validationErrorResponse = (statusCode: number, error: ValidationError) => {
  return response(statusCode, { error });
};
