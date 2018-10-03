// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestRouter, RouteEntry, createResolvedRoute} from './routing-table';
import {Trie} from './trie';
import {Request} from '../types';
import {inspect} from 'util';

const debug = require('debug')('loopback:rest:router:trie');

/**
 * Router implementation based on trie
 */
export class TrieRouter implements RestRouter {
  private trie = new Trie<RouteEntry>();
  add(route: RouteEntry) {
    // Add the route to the trie
    let path = route.path.startsWith('/') ? route.path : `/${route.path}`;
    const verb = route.verb.toLowerCase() || 'get';
    this.trie.create(`/${verb}${path}`, route);
  }

  find(request: Request) {
    const method = request.method.toLowerCase();
    const path = `/${method}${request.path}`;

    const found = this.trie.match(path);
    debug('Route matched: %j', found);

    if (found) {
      const route = found.node.value;
      if (route) {
        debug('Route found: %s', inspect(route, {depth: 5}));
        return createResolvedRoute(route, found.params || {});
      }
    }
    return undefined;
  }

  list() {
    return this.trie.list().map(n => n.value);
  }
}
