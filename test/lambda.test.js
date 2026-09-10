const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const sinon = require('sinon');

describe('Lambda handler', function() {
  it('uses the promise-based serverless Express handler', async function() {
    const response = { statusCode: 200 };
    const serverlessHandler = sinon.stub().resolves(response);
    const serverlessExpress = sinon.stub().returns(serverlessHandler);
    const app = {};
    const { handler } = proxyquire('../lambda', {
      '@vendia/serverless-express': serverlessExpress,
      './app': app
    });
    const event = {};
    const context = {};

    expect(handler.length).to.equal(2);
    expect(await handler(event, context)).to.equal(response);
    sinon.assert.calledOnceWithExactly(serverlessExpress, { app });
    sinon.assert.calledOnceWithExactly(serverlessHandler, event, context);
  });
});
