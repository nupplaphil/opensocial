import {DomainEventInterface} from "@core/domain/events/DomainEventInterface";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import {OAuth2Token} from "../OAuth2Token";

export class TokenCreatedEvent implements DomainEventInterface {
  public dateTimeOccurred: Date;
  public token: OAuth2Token;

  constructor(token: OAuth2Token) {
    this.dateTimeOccurred = new Date();
    this.token = token;
  }

  getAggregateId(): UniqueEntityID {
    return this.token.uuid;
  }
}
