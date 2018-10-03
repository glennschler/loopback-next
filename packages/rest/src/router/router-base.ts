// Copyright IBM Corp. 2017, 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RestRouter, RouteEntry, createResolvedRoute} from './routing-table';
import {Request} from '../types';
import {getPathVariables} from './openapi-path';

/**
 * Base router implementation that only handles path without variables
 */
export class BaseRouter implements RestRouter {
  /**
   * A map to optimize matching for routes without variables in the path
   */
  protected simpleRoutes: {[path: string]: RouteEntry} = {};

  protected getKeyForRoute(route: RouteEntry) {
    const path = route.path.startsWith('/') ? route.path : `/${route.path}`;
    const verb = route.verb.toLowerCase() || 'get';
    return `/${verb}${path}`;
  }

  add(route: RouteEntry) {
    const key = this.getKeyForRoute(route);
    if (!getPathVariables(route.path)) {
      this.simpleRoutes[key] = route;
      return true;
    }
    return false;
  }

  protected getKeyForRequest(request: Request) {
    const method = request.method.toLowerCase();
    return `/${method}${request.path}`;
  }

  find(request: Request) {
    const path = this.getKeyForRequest(request);
    let route = this.simpleRoutes[path];
    if (route) return createResolvedRoute(route, {});
    else return undefined;
  }

  list() {
    return Object.values(this.simpleRoutes);
  }
}
