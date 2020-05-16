import * as chai from 'chai';
import {knex, TABLES} from '@db';
import {getUserById, getActiveUserById, createUser, updateUser} from './UserRepository';
import Knex = require("knex");
import {QueryBuilder} from "knex";
import {NewUser, User} from "../../../domain";
import chaiDatetime from "chai-datetime";

chai.use(chaiDatetime);
const expect = chai.expect;

describe('UserRepository', () => {
  let data: Knex;

  before(async () => {
    data = await knex();
  })

  beforeEach(async () => {
    await data.migrate.latest();
    await data.seed.run();
  });

  afterEach(async () => {
    await data.migrate.rollback();
  });

  describe('Function "getUser"', () => {
    let findUser: Function;

    beforeEach(async () => {
      const users = (): QueryBuilder => data.table(TABLES.USER);
      findUser = await getUserById(users);
      expect(findUser).to.be.ok;
    });

    it('returns an user with an ID', async () => {
      const user: User = await findUser(2);

      expect(user).to.include({
        id: 2,
        username: 'testuser2',
        created: user.created,
        email: 'me@isomr2.co',
        guid: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
        active: true,
        type: 'user',
      });
    });

    it('returns an inactive user with an ID', async () => {
      const user: User = await findUser(1);

      expect(user).to.include({
        id: 1,
        username: 'testuser',
        email: 'me@isomr.co',
        guid: 'f03ede7c-b121-4112-bcc7-130a3487988c',
        active: false,
        type: 'user',
      });
    });

    it('throws an exception without an ID', async () => {
      return findUser().catch((err: Error) => {
        expect(err).has.property('message', 'Invalid ID');
      });
    });

    it('throws an exception with an invalid ID', async () => {
      return findUser(10000).catch((err: Error) => {
        expect(err).has.property('message', 'Invalid ID');
      });
    });
  });

  describe('Function "getActiveUser"', async () => {
    let findActiveUser: Function;

    beforeEach(async () => {
      const users = (): QueryBuilder => data.table(TABLES.USER);
      findActiveUser = await getActiveUserById(users);
      expect(findActiveUser).to.be.ok;
    });

    it('returns an active user', async () => {
      const user: User = await findActiveUser(2);

      expect(user).to.include({
        id: 2,
        username: 'testuser2',
        created: user.created,
        email: 'me@isomr2.co',
        guid: 'f03ede7c-b121-4112-bcc7-130a3e87988c',
        active: true,
        type: 'user',
      });
    });

    it('throws an exception with an inactive user', async () => {
      return findActiveUser(1).catch((err: Error) => {
        expect(err).to.include({httpStatus: 400, errorCode: "invalid_user"});
      });
    });
  });

  describe('Function "insertUser"', async () => {
    let insert: Function;
    let findById: Function;

    beforeEach(async () => {
      const users = (): QueryBuilder => data.table(TABLES.USER);
      insert = await createUser(users);
      expect(insert).to.be.ok;
      findById = await getUserById(users);
      expect(findById).to.be.ok;
    });

    it('inserts a new user', async () => {
      const newUser: NewUser = {
        email: 'test@test.it',
        name: 'a new user',
        username: 'testuser3',
        guid: '123455',
        type: 'group',
        active: true
      };

      const user: User = await insert(newUser);

      expect(user).to.be.an('object');
      expect(user).has.property('id', 3)
      expect(user).to.include(newUser);

      const currUser: User = await findById(user.id);

      expect(currUser).to.include(user);
      expect(currUser.created).to.be.an('Date').that.is.beforeTime(new Date());
    });

    it('throws an error for missing fields', async () => {
      return insert({
        email: 'test@test.it',
        name: 'a new user',
        username: 'testuser3',
        guid: '123455',
        type: 'group',
        active: true
      } as NewUser).catch((err: Error) => {
        expect(err).to.include({errno: 19, code: "SQLITE_CONSTRAINT"});
      });
    });
  });

  describe('Function "UpdateUser"', async () => {
    let update: Function;
    let findById: Function;

    beforeEach(async () => {
      const users = (): QueryBuilder => data.table(TABLES.USER);
      update = await updateUser(users);
      expect(update).to.be.ok;
      findById = await getUserById(users);
      expect(findById).to.be.ok;
    });

    it('updates an user', async () => {
      const currUser: User = await findById(1);

      const newUser = {
        name: '12345BlaBla',
        id: 1,
        email: currUser.email
      };

      const updatedUser: User = await update(newUser);

      expect(updatedUser).to.include(newUser);
      expect(updatedUser.name).not.eq(currUser.name);
    });
  });
});
