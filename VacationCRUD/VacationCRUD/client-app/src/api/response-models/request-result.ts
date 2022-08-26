class EmptyRequestResult {
    errors: Array<string> = [];
    statusCode: number = -1;
}

class RequestResult<T> extends EmptyRequestResult {
    data?: T;
}

class ErrorRequestResult {
    errorText?: string;
}

export { EmptyRequestResult, RequestResult, ErrorRequestResult };