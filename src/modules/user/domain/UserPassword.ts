import {compare, hash} from 'bcrypt';
import {ValueObject} from '@core/domain';
import {Guard} from '@core/logic';

type UserPasswordProps = {
  value: string;
  hashed?: boolean;
}

export class UserPassword extends ValueObject<UserPasswordProps> {
  private constructor(props: UserPasswordProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private hashPassword(password: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      hash(password, '', (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      })
    });
  }

  isAlreadyHashed(): boolean {
    return !!this.props.hashed;
  }

  get getHashedValue(): Promise<string> {
    return new Promise<string>((resolve => {
      if (this.isAlreadyHashed()) {
        return resolve(this.props.value);
      } else {
        return resolve(this.hashPassword(this.props.value));
      }
    }))
  }

  private bcryptCompare(plainText: string, hashed: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      compare(plainText, hashed, (err, compareResult) => {
        if (err) return resolve(false);
        return resolve(compareResult);
      })
    });
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    let hashed: string;
    if (this.isAlreadyHashed()) {
      hashed = this.props.value;
      return this.bcryptCompare(plainTextPassword, hashed);
    } else {
      return this.props.value === plainTextPassword;
    }
  }

  static isAppropriateLength(value: string): boolean {
    return value.length >= 8;
  }

  static create(props: UserPasswordProps): UserPassword | undefined {
    const propsResult = Guard.againstNullOrUndefined(props.value, 'password');

    if (!propsResult.succeeded) {
      return undefined;
    } else {
      if(!props.hashed) {
        if (!this.isAppropriateLength(props.value)) {
          return undefined;
        }
      }

      return new UserPassword({
        value: props.value,
        hashed: !!props.hashed
      });
    }
  }
}
