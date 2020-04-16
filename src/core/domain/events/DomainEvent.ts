import { UniqueEntityID } from '@core/domain';

export interface DomainEvent {
  dateTimeOccurred: Date;
  getAggregatedId (): UniqueEntityID;
}
