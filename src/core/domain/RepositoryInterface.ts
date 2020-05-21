export interface RepositoryInterface<Entity> {
  getById?: (id: number) => Promise<Entity>;
  save?: (entity: Entity) => Promise<Entity>;
  delete?: (entity: Entity) => Promise<void>;
}
