// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RouteEntry, createResolvedRoute} from './routing-table';
import {Trie} from './trie';
import {Request} from '../types';
import {inspect} from 'util';
import {BaseRouter} from './router-base';

const debug = require('debug')('loopback:rest:router:trie');

/**
 * Router implementation based on trie
 */
export class TrieRouter extends BaseRouter {
  private trie = new Trie<RouteEntry>();

  add(route: RouteEntry) {
    if (super.add(route)) return true;
    // Add the route to the trie
    const key = this.getKeyForRoute(route);
    this.trie.create(key, route);
    return true;
  }

  find(request: Request) {
    const method = request.method.toLowerCase();
    const path = `/${method}${request.path}`;

    let route = this.simpleRoutes[path];
    if (route) return createResolvedRoute(route, {});

    const found = this.trie.match(path);
    debug('Route matched: %j', found);

    if (found) {
      route = found.node.value!;
      if (route) {
        debug('Route found: %s', inspect(route, {depth: 5}));
        return createResolvedRoute(route, found.params || {});
      }
    }
    return undefined;
  }

  list() {
    const basicRoutes = Object.values(this.simpleRoutes);
    const routesWithVars = this.trie.list().map(n => n.value);
    return basicRoutes.concat(routesWithVars);
  }
}
