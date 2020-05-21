import {UniqueEntityID} from "../UniqueEntityID";

export interface DomainEventInterface {
  dateTimeOccurred: Date;
  getAggregateId: () => UniqueEntityID;
}
