import {ValueObject} from "@core/domain";
import {Guard} from "@core/logic";

type UserEmailProps = {
  value: string;
};

export class UserEmail extends ValueObject<UserEmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: UserEmailProps) {
    super(props);
  }

  static create(email: string): UserEmail | undefined {
    const guardResult = Guard.againstNullOrUndefined(email, 'email');
    if (!guardResult.succeeded) {
      return undefined;
    } else {
      return new UserEmail({ value: email });
    }
  }
}
