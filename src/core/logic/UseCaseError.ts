export interface UseCaseError {
  readonly message: string;
}

export abstract class UseCaseError implements UseCaseError {
  protected constructor(readonly message: string) {
  }
}
