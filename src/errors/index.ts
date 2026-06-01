export class CustomError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
  ) {
    super(message);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class BadCredentialsError extends CustomError {
  constructor(message?: string) {
    super(
      message ||
        "Credenciais inválidas. Cheque seu email e a senha e tente novamente",
      401,
    );
  }
}
