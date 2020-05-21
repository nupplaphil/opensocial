import {DomainEventInterface} from "@core/domain/events/DomainEventInterface";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import {User} from "../User";

export class UserCreatedEvent implements DomainEventInterface {
  public dateTimeOccurred: Date;
  public user: User;

  constructor(user: User) {
    this.dateTimeOccurred = new Date();
    this.user = user;
  }

  getAggregateId(): UniqueEntityID {
    return this.user.uuid;
  }
}
