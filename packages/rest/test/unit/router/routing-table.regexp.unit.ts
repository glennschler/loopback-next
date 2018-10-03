// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {get, getControllerSpec, param} from '@loopback/openapi-v3';
import {
  ShotRequestOptions,
  expect,
  stubExpressContext,
} from '@loopback/testlab';
import {ControllerRoute, Request, RoutingTable} from '../../..';
import {RegExpRouter} from '../../..';

describe('RoutingTable with RegExpRouter', () => {
  it('does not fail if some of the parameters are not decorated', () => {
    class TestController {
      @get('/greet')
      greet(prefix: string, @param.query.string('message') message: string) {
        return prefix + ': ' + message;
      }
    }
    const spec = getControllerSpec(TestController);
    const table = givenRoutingTable();
    table.registerController(spec, TestController);
    const paths = table.describeApiPaths();
    const params = paths['/greet']['get'].parameters;
    expect(params).to.have.property('length', 1);
    expect(params[0]).to.have.properties({
      name: 'message',
      in: 'query',
      schema: {type: 'string'},
    });
  });

  it('finds simple "GET /hello" endpoint', () => {
    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/hello', 'greet')
      .build();

    class TestController {}

    const table = givenRoutingTable();
    table.registerController(spec, TestController);

    const request = givenRequest({
      method: 'get',
      url: '/hello',
    });

    const route = table.find(request);

    expect(route).to.be.instanceOf(ControllerRoute);
    expect(route)
      .to.have.property('spec')
      .containEql(spec.paths['/hello'].get);
    expect(route).to.have.property('pathParams');
    expect(route.describe()).to.equal('TestController.greet');
  });

  it('finds simple "GET /my/hello" endpoint', () => {
    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/hello', 'greet')
      .build();

    // @jannyHou: please note ` anOpenApiSpec()` returns an openapi spec,
    // not controller spec, should be FIXED
    // the routing table test expects an empty spec for
    // interface `ControllerSpec`
    spec.basePath = '/my';

    class TestController {}

    const table = givenRoutingTable();
    table.registerController(spec, TestController);

    const request = givenRequest({
      method: 'get',
      url: '/my/hello',
    });

    const route = table.find(request);

    expect(route).to.be.instanceOf(ControllerRoute);
    expect(route)
      .to.have.property('spec')
      .containEql(spec.paths['/hello'].get);
    expect(route).to.have.property('pathParams');
    expect(route.describe()).to.equal('TestController.greet');
  });

  function givenRequest(options?: ShotRequestOptions): Request {
    return stubExpressContext(options).request;
  }

  function givenRoutingTable() {
    return new RoutingTable(new RegExpRouter());
  }
});
