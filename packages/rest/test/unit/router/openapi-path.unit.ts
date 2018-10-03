// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/openapi-v3.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

import {toOpenApiPath} from '../../..';

describe('toOpenApiPath', () => {
  const INVALID_PARAM = /Invalid path template: '.+'. Please use \{param\} instead of '\:param'/;
  const NO_PARAM_MODIFIER = /Parameter modifier is not allowed in path/;
  const INVALID_PARAM_NAME = /Invalid parameter name '.+' found in path/;

  it('allows /{foo}/bar', () => {
    const path = toOpenApiPath('/{foo}/bar');
    expect(path).to.eql('/{foo}/bar');
  });

  it('allows /{foo}/{bar}', () => {
    const path = toOpenApiPath('/{foo}/{bar}');
    expect(path).to.eql('/{foo}/{bar}');
  });

  it('allows /{_foo}/{bar}', () => {
    const path = toOpenApiPath('/{_foo}/{bar}');
    expect(path).to.eql('/{_foo}/{bar}');
  });

  it('disallows /:foo/bar', () => {
    disallows('/:foo/bar');
  });

  it('disallows /:foo/:bar', () => {
    disallows('/:foo/:bar');
  });

  it('disallows /:foo+', () => {
    disallows('/:foo+');
  });

  it('disallows /:foo?', () => {
    disallows('/:foo?');
  });

  it('disallows /:foo*', () => {
    disallows('/:foo*');
  });

  it('disallows /:foo(\\d+)', () => {
    disallows('/:foo(\\d+)');
  });

  it('disallows /foo/(.*)', () => {
    disallows('/foo/(.*)');
  });

  it('disallows /{foo}+', () => {
    disallows('/{foo}+', NO_PARAM_MODIFIER);
  });

  it('disallows /{foo}?', () => {
    disallows('/{foo}?', NO_PARAM_MODIFIER);
  });

  it('disallows /{foo}*', () => {
    disallows('/{foo}*', NO_PARAM_MODIFIER);
  });

  it('disallows /{foo}(\\d+)', () => {
    disallows('/{foo}(\\d+)');
  });

  it('disallows /{$123}', () => {
    disallows('/{$123}', INVALID_PARAM_NAME);
  });

  it('disallows /{%abc}', () => {
    disallows('/{%abc}', INVALID_PARAM_NAME);
  });

  function disallows(path: string, pattern?: RegExp) {
    expect(() => toOpenApiPath(path)).to.throw(pattern || INVALID_PARAM);
  }
});
