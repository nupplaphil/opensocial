import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {ExtendedError, Rethrow} from './';

chai.use(chaiAsPromised);

describe('ExtendedErrorLib', () => {
  describe('ExtendedError', () => {
    it('constructs ExtendedError with message and options', () => {
      const expected = {
        message: 'mock error message',
        options: {
          http: {
            statusCode: 400,
            message: 'mock hapi message'
          }
        }
      };

      const value: ExtendedError = new ExtendedError(expected.message, expected.options);

      chai.expect(value.message).to.equal(expected.message);
      chai.expect(value.options).to.equal(expected.options);
    });
  });

  describe('Rethrow', () => {
    it('constructs Rethrow with message, options, and existing error', () => {
      const expected = {
        original: new Error(),
        message: 'mock error message',
        options: {
          http: {
            statusCode: 400,
            message: 'mock hapi message'
          }
        }
      };

      const value: Rethrow = new Rethrow(expected.message, expected.original, expected.options);

      chai.expect(value.message).to.equal(expected.message);
      chai.expect(value.options).to.deep.equal(expected.options);
      chai.expect(value.original).to.deep.equal(expected.original);
    });

    it('constructs Rethrow with merged options', () => {
      const expected = {
        original: new ExtendedError('original error message', {
          http: {
            statusCode: 401,
            message: 'original hapi message',
            override: 'mock override value'
          }
        }),
        message: 'mock error message',
        options: {
          http: {
            statusCode: 400
          }
        }
      };

      const value: Rethrow = new Rethrow(expected.message, expected.original, expected.options);

      chai.expect(value.options).to.deep.equal({
        http: {
          statusCode: 400,
          message: 'original hapi message',
          override: 'mock override value'
        }
      });
    });
  });
});
