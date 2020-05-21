export type GuardResult = {
  succeeded: boolean;
  message?: string;
}

export type GuardArgument = {
  argument: any;
  argumentName: string;
}

export type GuardArgumentCollection = GuardArgument[];

export class Guard {
  public static combine (guardResults: GuardResult[]): GuardResult {
    for (const result of guardResults) {
      if (result.succeeded === false) return result;
    }

    return { succeeded: true };
  }

  public static againstNullOrUndefined (argument: any, argumentName: string): GuardResult {
    if (argument === null || argument === undefined) {
      return { succeeded: false, message: `${argumentName} is null or undefined` }
    } else {
      return { succeeded: true }
    }
  }

  public static againstNullOrUndefinedBulk(args: GuardArgumentCollection): GuardResult {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(arg.argument, arg.argumentName);
      if (!result.succeeded) return result;
    }

    return { succeeded: true }
  }

  public static isOneOf (value: any, validValues: any[], argumentName: string) : GuardResult {
    let isValid = false;
    for (const validValue of validValues) {
      if (value === validValue) {
        isValid = true;
      }
    }

    if (isValid) {
      return { succeeded: true }
    } else {
      return {
        succeeded: false,
        message: `${argumentName} isn't oneOf the correct types in ${JSON.stringify(validValues)}. Got "${value}".`
      }
    }
  }

  public static inRange (num: number, min: number, max: number, argumentName: string) : GuardResult {
    const isInRange = num >= min && num <= max;
    if (!isInRange) {
      return { succeeded: false, message: `${argumentName} is not within range ${min} to ${max}.`}
    } else {
      return { succeeded: true }
    }
  }

  public static allInRange (numbers: number[], min: number, max: number, argumentName: string) : GuardResult {
    let failingResult: GuardResult = {succeeded: true};
    for(const num of numbers) {
      const numIsInRangeResult = this.inRange(num, min, max, argumentName);
      if (!numIsInRangeResult.succeeded) failingResult = numIsInRangeResult;
    }

    if (!failingResult.succeeded) {
      return { succeeded: false, message: `${argumentName} is not within the range.`}
    } else {
      return { succeeded: true }
    }
  }
}
