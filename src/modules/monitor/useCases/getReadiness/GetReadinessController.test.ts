import * as chai from 'chai';
import { Logger } from '@core/util';
import {Request, ResponseObject, ResponseToolkit, ResponseValue} from "@hapi/hapi";
import chaiAsPromised from "chai-as-promised";
import {GetReadinessController} from "./GetReadinessController";

chai.use(chaiAsPromised);

describe('Controller for readiness monitoring', () => {
  it('returns "ok"', () => {
    const controller = new GetReadinessController({} as Logger);

    chai.expect(controller.execute({} as Request, {
      response(value?: ResponseValue): ResponseObject {
        chai.expect(value).to.have.property('status').with.true;

        return {} as ResponseObject
      }
    } as ResponseToolkit)).to.be.ok;
  });
});
