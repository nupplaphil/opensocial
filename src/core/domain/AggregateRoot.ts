import {DomainEventInterface, DomainEvents, Entity, UniqueEntityID} from '@core/domain';
import {createLogger} from '@util';

const LOGGER = createLogger('AggregateRoot');

export abstract class AggregateRoot<T> extends Entity<T>{
  private _domainEvents: DomainEventInterface[] = [];

  get id(): UniqueEntityID {
    return this._id;
  }

  get domainEvents(): DomainEventInterface[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEventInterface): void {
    this._domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
    this.logDomainEventAdded(domainEvent);
  }

  clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }

  private logDomainEventAdded(domainEvent: DomainEventInterface): void {
    const thisClass = Reflect.getPrototypeOf(this);
    const domainEventClass = Reflect.getPrototypeOf(domainEvent);
    LOGGER.debug('Domain Event Created', { class: thisClass.constructor.name, event: domainEventClass.constructor.name });
  }
}
