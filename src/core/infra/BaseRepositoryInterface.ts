export interface BaseRepositoryInterface<Entity> {
  save: (entity: Entity) => Promise<boolean>;
  get: (id: number) => Promise<Entity>;
}
