// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOpenApiSpec} from '@loopback/openapi-spec-builder';
import {
  RoutingTable,
  TrieRouter,
  RestRouter,
  RegExpRouter,
  OpenApiSpec,
} from '@loopback/rest';

function runBenchmark(count = 1000) {
  const spec = givenNumberOfRoutes('/hello', count);

  const trieTest = givenRouter(new TrieRouter(), spec, count);
  const regexpTest = givenRouter(new RegExpRouter(), spec, count);

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

function givenRouter(router: RestRouter, spec: OpenApiSpec, count: number) {
  const name = router.constructor.name;
  class TestController {}

  return () => {
    console.log('Creating %s, %d', name, count);
    let start = process.hrtime();

    const table = new RoutingTable(router);
    table.registerController(spec, TestController);
    router.list(); // Force sorting
    console.log('Created %s %s', name, process.hrtime(start));

    console.log('\nStarting %s %d', name, count);
    start = process.hrtime();
    for (let i = 0; i < count; i++) {
      // tslint:disable-next-line:no-any
      const request: any = {
        method: 'get',
        path: `/my/hello/${i % 16}/version_${i}`,
      };

      try {
        table.find(request);
      } catch (e) {
        // ignore
      }
    }
    console.log('Done %s %s\n', name, process.hrtime(start));
  };
}

runBenchmark(+process.argv[2] || 1000);
