import {AggregateRoot, DomainEventInterface, UniqueEntityID} from '@core/domain';

export class DomainEvents {
  private static handlersMap: {
    [key: string]: any
  } = {};
  private static markedAggregates: AggregateRoot<any>[] = [];

  static markAggregateForDispatch(aggregate: AggregateRoot<any>): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>): void {
    aggregate.domainEvents.forEach((event: DomainEventInterface) => this.dispatch(event));
  }

  private static removeAggregateFomMarkedDispatchList(aggregate: AggregateRoot<any>): void {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
    this.markedAggregates.splice(index, 1);
  }

  private static findMarkedAggregateByID(id: UniqueEntityID): AggregateRoot<any> | null {
    let found: AggregateRoot<any> | null = null;
    for (const aggregate of this.markedAggregates) {
      if (aggregate.id.equals(id)) {
        found = aggregate;
        break;
      }
    }

    return found;
  }

  static dispatchEventsForAggregate(id: UniqueEntityID): void {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFomMarkedDispatchList(aggregate);
    }
  }

  static register(callback: (event: DomainEventInterface) => void, eventClassName: string): void {
    if (!this.handlersMap.hasOwnProperty(eventClassName)) {
      this.handlersMap[eventClassName] = [];
    }
    this.handlersMap[eventClassName].push(callback);
  }

  static clearHandlers(): void {
    this.handlersMap = {};
  }

  static clearMarkedAggregates(): void {
    this.markedAggregates = [];
  }

  private static dispatch(event: DomainEventInterface): void {
    const eventClassName: string = event.constructor.name;

    if (this.handlersMap.hasOwnProperty(eventClassName)) {
      const handlers: any[] = this.handlersMap[eventClassName];
      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}
