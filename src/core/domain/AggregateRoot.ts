import {Entity} from "./Entity";
import {DomainEventInterface} from "./events/DomainEventInterface";
import {UniqueEntityID} from "@core/domain/UniqueEntityID";

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEventInterface[] = [];
  protected readonly _uuid: UniqueEntityID;

  get id(): number | undefined {
    return this._id;
  }

  get uuid(): UniqueEntityID {
    return this._uuid;
  }

  protected constructor(protected readonly props: T, protected readonly _id?: number, _uuid?: UniqueEntityID) {
    super(props, _id);
    this._uuid = _uuid ? _uuid : new UniqueEntityID();
  }

  get domainEvents(): DomainEventInterface[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEventInterface): void {
    // Add the domain event to this aggregate's list of domain events
    this._domainEvents.push(domainEvent);

  }

  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }
}
