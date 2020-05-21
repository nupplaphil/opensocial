import * as bcrypt from "bcrypt";

import {ValueObject} from "@core/domain/ValueObject";
import {Guard} from "@core/logic/Guard";

import {InvalidPassword} from "./errors";

export type UserPasswordProps = {
  value: Buffer;
}

const passwordIsValid = (password: string): boolean => {
  return password.length >= 8;
}

export class UserPassword extends ValueObject<UserPasswordProps> {
  private constructor(props: UserPasswordProps) {
    super(props);
  }

  toString(): string {
    return this.props.value.toString('utf-8');
  }

  async compare(plainTextPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, this.props.value.toString('utf-8'));
  }

  static async create(password: string, hashed?: boolean): Promise<UserPassword> {
    const propsResult = Guard.againstNullOrUndefined(password, 'password');

    if (!propsResult.succeeded) {
      throw new InvalidPassword(propsResult.message);
    } else {
      if (!hashed) {
        if (!passwordIsValid(password)) {
          throw new InvalidPassword('Password doesnt meet criteria');
        } else {
          return new UserPassword({
            value: Buffer.from(await bcrypt.hash(password, 12))
          });
        }
      } else {
        return new UserPassword({
          value: Buffer.from(password),
        });
      }
    }
  }
}
