import * as chai from 'chai';
import * as sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
/// @todo Switch to Dependency Injection
//import * as Boom from '@hapi/boom';
import config from '@config/environment';
import globalRouteOptions from '@config/gobalRouteOptions';

chai.use(chaiAsPromised);

describe('GlobalRouteOptionsConfig', () => {
  let sandbox: sinon.SinonSandbox;

  before(() => {
    config.set('enableLogs', false);
  });

  after(() => {
    config.set('enableLogs', true);
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    config.set('env', 'unit_test');
  });

  describe('ValidateFailAction', () => {
    it('fail action throws full error if env is development', () => {
      const expected: Error = new Error('Mock error message');

      const value = globalRouteOptions.validate!.failAction as any;

      return chai.expect(value({}, {}, expected)).to.be.rejectedWith(expected);
    });

    it('fail action throws generic bad request if env is production', async () => {
//      const spy = sandbox.spy(Boom, 'badRequest');

      const value = globalRouteOptions.validate!.failAction as any;

      config.set('env', 'production');

      await chai.expect(value({}, {}, new Error('Should not be thrown'))).to.be.rejected;
//      chai.expect(spy.calledOnce).to.equal(true);
    });
  });

  describe('ResponseFailAction', () => {
    it('fail action throws full error if env is development', () => {
      const expected: Error = new Error('Mock error message');

      const value = globalRouteOptions.response!.failAction as any;

      return chai.expect(value({}, {}, expected)).to.be.rejectedWith(expected);
    });

    it('fail action throws generic bad request if env is production', async () => {
//      const spy = sandbox.spy(Boom, 'boomify');

      const value = globalRouteOptions.response!.failAction as any;

      config.set('env', 'production');

      await chai.expect(value({}, {}, new Error('Should not be thrown'))).to.be.rejected;
//      chai.expect(spy.calledOnce).to.equal(true);
    });
  });
});
