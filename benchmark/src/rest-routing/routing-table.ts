// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {RoutingTable} from '@loopback/rest';
import * as pathToRegExp from 'path-to-regexp';

function runBenchmark() {
  const count = 1000;
  let table: RoutingTable;
  const trieTest = () => {
    const spec = givenNumberOfRoutes('/hello', count);

    class TestController {}

    table = new RoutingTable();
    table.registerController(spec, TestController);

    const start = process.hrtime();
    for (let i = 0; i < count; i++) {
      // tslint:disable-next-line:no-any
      const request: any = {
        method: 'get',
        path: `/my/hello/${i % 16}/version_${i}`,
      };

      try {
        const r = table.find(request);
      } catch (e) {
        // ignore
      }
    }
    console.log('trie', process.hrtime(start));
  };

  const regexpTest = () => {
    const routes = givenNumberOfExpressRoutes('/my/hello', count);

    const start = process.hrtime();
    for (let i = 0; i < count; i++) {
      // tslint:disable-next-line:no-any
      const request: any = {
        method: 'get',
        path: `/my/hello/${i % 16}/version_${i}`,
      };

      for (const r of routes) {
        if (request.method === r.verb && request.path.match(r.path)) {
          break;
        }
      }
    }
    console.log('regexp', process.hrtime(start));
  };

  trieTest();

  regexpTest();
}

function givenNumberOfRoutes(base: string, num: number) {
  const spec = anOpenApiSpec();
  let i = 0;
  while (i < num) {
    spec.withOperationReturningString(
      'get',
      `${base}/${i % 8}/version_${i}`,
      'greet',
    );
    i++;
  }
  spec.withOperationReturningString(
    'get',
    `${base}/{group}/{version}`,
    'greet',
  );
  const result = spec.build();
  result.basePath = '/my';
  return result;
}

function givenNumberOfExpressRoutes(base: string, num: number) {
  const routes = [];
  let i = 0;
  while (i < num) {
    routes.push({
      verb: 'get',
      path: pathToRegExp(`${base}/${i % 8}/version_${i}`, [], {end: true}),
      operation: 'greet',
    });
    i++;
  }
  routes.push({
    verb: 'get',
    path: pathToRegExp(`${base}/:group/:version}`, [], {end: true}),
    operation: 'greet',
  });
  return routes;
}

runBenchmark();
