import {DomainEventInterface} from "@core/domain/events/DomainEventInterface";
import {UniqueEntityID} from "@core/domain";
import {User} from "@modules/user/domain/User";

export class UserCreateEvent implements DomainEventInterface {
  dateTimeOccurred: Date;
  user: User;

  constructor(user: User) {
    this.dateTimeOccurred = new Date();
    this.user = user;
  }

  getAggregatedId(): UniqueEntityID {
    return this.user.id;
  }
}
