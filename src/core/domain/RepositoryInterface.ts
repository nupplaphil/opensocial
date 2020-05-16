export interface RepositoryInterface<Entity> {
  getById?: (id: number) => Promise<Entity>;
  create?: (entity: Entity) => Promise<Entity>;
  update?: (entity: Entity) => Promise<Entity>;
  delete?: (entity: Entity) => Promise<void>;
}
