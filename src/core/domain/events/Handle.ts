import {DomainEventInterface} from "@core/domain";

export interface Handle<T extends DomainEventInterface> {
  setupSubscriptions(): void;
}
