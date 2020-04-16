import { DomainEvent } from "@core/domain";

export interface Handle<T extends DomainEvent> {
  setupSubscriptions(): void;
}
