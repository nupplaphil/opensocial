import {DomainEventInterface} from "@core/domain/events/DomainEventInterface";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";
import {OAuth2Client} from "../OAuth2Client";

export class ClientCreatedEvent implements DomainEventInterface {
  public dateTimeOccurred: Date;
  public client: OAuth2Client;

  constructor(client: OAuth2Client) {
    this.dateTimeOccurred = new Date();
    this.client = client;
  }

  getAggregateId(): UniqueEntityID {
    return this.client.uuid;
  }
}
