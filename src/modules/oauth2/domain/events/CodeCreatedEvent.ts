import {DomainEventInterface} from "@core/domain/events/DomainEventInterface";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import {OAuth2Code} from "../OAuth2Code";

export class CodeCreatedEvent implements DomainEventInterface {
  public dateTimeOccurred: Date;
  public code: OAuth2Code;

  constructor(code: OAuth2Code) {
    this.dateTimeOccurred = new Date();
    this.code = code;
  }

  getAggregateId(): UniqueEntityID {
    return this.code.uuid;
  }
}
