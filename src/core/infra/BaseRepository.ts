import Knex from 'knex';

export abstract class BaseRepository<Entity>{
  constructor(protected knex: Knex) {
  }
}
