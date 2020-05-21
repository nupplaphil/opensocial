import {DomainEventInterface} from "@core/domain/events/DomainEventInterface";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import {OAuth2Code} from "../OAuth2Code";

export class CodeUsedEvent implements DomainEventInterface {
  public dateTimeOccurred: Date;
  public code: OAuth2Code;
  public verifier: string | undefined;

  constructor(code: OAuth2Code, verifier?: string) {
    this.dateTimeOccurred = new Date();
    this.code = code;
    this.verifier = verifier;
  }

  getAggregateId(): UniqueEntityID {
    return this.code.uuid;
  }
}
