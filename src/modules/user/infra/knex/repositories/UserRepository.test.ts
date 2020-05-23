import * as chai from 'chai';
import {knex, TABLES} from '@db';
import {getActiveUserById, getUserById, saveUser} from './UserRepository';
import {QueryBuilder} from "knex";
import {User, UserProps} from "../../../domain";
import chaiDatetime from "chai-datetime";
import {UniqueEntityID} from "../../../../../core/domain/UniqueEntityID";
import Knex = require("knex");

chai.use(chaiDatetime);
const expect = chai.expect;

const equalUser = (user: User, expectUser: User, id?: number): void => {
  if (user.isSaved && expectUser.isSaved) {
    expect(user.id).to.be.eq(expectUser.id);
  } else if (id !== undefined) {
    expect(user.id).to.be.eq(id);
  }
  expect(user.username).to.be.eq(expectUser.username);
  //expect(user.password).to.be.eq(expectUser.password ? expectUser.password : undefined);
  expect(user.email).to.be.eq(expectUser.email);
  expect(user.uuid.equals(expectUser.uuid)).to.be.true;
  expect(user.active).to.be.eq(expectUser.active);
  expect(user.type).to.be.eq(expectUser.type);
}

const equalProps = (user: User, expectProps: UserProps, id?: number): void => {
  expect(user.id).to.be.eq(id);
  expect(user.username).to.be.eq(expectProps.username);
  //expect(user.password).to.be.eq(expectProps.password ? expectProps.password : undefined);
  expect(user.email).to.be.eq(expectProps.email);
  expect(user.uuid.equals(expectProps.uuid)).to.be.true;
  expect(user.active).to.be.eq(expectProps.active);
  expect(user.type).to.be.eq(expectProps.type);
}

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

      equalProps(user, {
        username: 'Testuser2',
        email: 'me@isomr2.co',
        uuid: new UniqueEntityID('f03ede7c-b121-4112-bcc7-130a3e87988c'),
        name: 'Test User 2',
        active: true,
        type: 'user',
      } as UserProps, 2);
    });

    it('returns an inactive user with an ID', async () => {
      const user: User = await findUser(1);

      equalProps(user, {
        username: 'Testuser1',
        email: 'me@isomr.co',
        uuid: new UniqueEntityID('f03ede7c-b121-4112-bcc7-130a3487988c'),
        name: 'Test User 1',
        active: false,
        type: 'user',
      } as UserProps, 1);
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

      equalProps(user, {
        username: 'Testuser2',
        email: 'me@isomr2.co',
        uuid: new UniqueEntityID('f03ede7c-b121-4112-bcc7-130a3e87988c'),
        name: 'Test User 2',
        active: true,
        type: 'user',
      } as UserProps, 2);
    });

    it('throws an exception with an inactive user', async () => {
      return findActiveUser(1).catch((err: Error) => {
        expect(err).to.include({httpStatus: 400, errorCode: "invalid_user"});
      });
    });
  });

  describe('Function "saveUser"', async () => {
    let insert: Function;
    let findById: Function;

    beforeEach(async () => {
      const users = (): QueryBuilder => data.table(TABLES.USER);
      insert = await saveUser(users);
      expect(insert).to.be.ok;
      findById = await getUserById(users);
      expect(findById).to.be.ok;
    });

    it('inserts a new user', async () => {
      const newUser = await User.create({
        email: 'test@test.it',
        name: 'a new user',
        username: 'testuser3',
        uuid: new UniqueEntityID('123455'),
        type: 'group',
        active: true
      });

      const user: User = await insert(newUser);

      expect(user).to.be.an('object');
      expect(user).has.property('id', 3);

      equalUser(user, newUser);

      const currUser: User = await findById(user.id);

      equalUser(user, currUser);
    });

    it('throws an error for missing fields', async () => {
      return insert(await User.create({
        email: 'test@test.it',
        name: 'a new user',
        username: 'testuser3',
        uuid: new UniqueEntityID('123455'),
        type: 'group',
        active: true
      })).catch((err: Error) => {
        expect(err).to.include({errno: 19, code: "SQLITE_CONSTRAINT"});
      });
    });
  });

  describe('Function "UpdateUser"', async () => {
    let update: Function;
    let findById: Function;

    beforeEach(async () => {
      const users = (): QueryBuilder => data.table(TABLES.USER);
      update = await saveUser(users);
      expect(update).to.be.ok;
      findById = await getUserById(users);
      expect(findById).to.be.ok;
    });

    it('updates an user', async () => {
      const currUser: User = await findById(1);

      const newUser = await User.create({
        active: currUser.active,
        created: currUser.created,
        email: currUser.email,
        name: '12345BlaBla',
        password: currUser.password,
        type: currUser.type,
        username: currUser.username,
        uuid: currUser.uuid,
      }, currUser.id);

      const updatedUser: User = await update(newUser);

      equalUser(updatedUser, newUser);
      expect(updatedUser.name).not.eq(currUser.name);
    });
  });
});
