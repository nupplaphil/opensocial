import {UniqueEntityID} from '@core/domain';

export interface DomainEventInterface {
  dateTimeOccurred: Date;
  getAggregatedId (): UniqueEntityID;
}
