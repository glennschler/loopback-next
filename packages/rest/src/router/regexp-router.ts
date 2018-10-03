// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RouteEntry, createResolvedRoute, ResolvedRoute} from './routing-table';
import {Request, PathParameterValues} from '../types';
import {inspect} from 'util';
import {compareRoute} from './route-sort';
import pathToRegExp = require('path-to-regexp');
import {BaseRouter} from './router-base';

const debug = require('debug')('loopback:rest:router:regexp');

/**
 * Route entry with path-to-regexp
 */
interface RegExpRouteEntry extends RouteEntry {
  regexp?: RegExp;
  keys?: pathToRegExp.Key[];
}

/**
 * Router implementation based on regexp matching
 */
export class RegExpRouter extends BaseRouter {
  private routes: RegExpRouteEntry[] = [];

  private _sorted: boolean;
  private _sort() {
    if (!this._sorted) {
      this.routes.sort(compareRoute);
      this._sorted = true;
    }
  }

  add(route: RouteEntry) {
    if (super.add(route)) return true;
    // Add the route
    const entry = route as RegExpRouteEntry;
    this.routes.push(entry);
    const path = route.path.replace(/\{([^\{]+)\}/g, ':$1');
    entry.keys = [];
    entry.regexp = pathToRegExp(path, entry.keys, {strict: false, end: true});
    this._sorted = false;
    return true;
  }

  find(request: Request): ResolvedRoute | undefined {
    const found = super.find(request);
    if (found) return found;
    this._sort();
    for (const r of this.routes) {
      debug('trying endpoint %s', inspect(r, {depth: 5}));
      if (r.verb !== request.method!.toLowerCase()) {
        debug(' -> verb mismatch');
        continue;
      }

      const match = r.regexp!.exec(request.path);
      if (!match) {
        debug(' -> path mismatch');
        continue;
      }

      const pathParams = this._buildPathParams(r, match);
      debug(' -> found with params: %j', pathParams);

      return createResolvedRoute(r, pathParams);
    }
    return undefined;
  }

  list() {
    const basicRoutes = Object.values(this.simpleRoutes);
    this._sort();
    return basicRoutes.concat(this.routes);
  }

  private _buildPathParams(
    route: RegExpRouteEntry,
    pathMatch: RegExpExecArray,
  ): PathParameterValues {
    const pathParams = Object.create(null);
    for (const ix in route.keys!) {
      const key = route.keys![ix];
      const matchIndex = +ix + 1;
      pathParams[key.name] = pathMatch[matchIndex];
    }
    return pathParams;
  }
}
