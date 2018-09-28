// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/dist-util
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const path = require('path');
const util = require('util');
const semver = require('semver');

/**
 * Make sure node version meets the requirement. This file intentionally
 * only uses ES5 features so that it can be run with lower versions of Node
 * to report the version requirement.
 */
function checkNodeVersion(range) {
  const nodeVer = process.versions.node;
  const requiredVer = range || require('./package.json').engines.node;
  const ok = semver.satisfies(nodeVer, requiredVer);
  if (!ok) {
    const format = 'Node.js %s is not supported. Please use a version %s.';
    const msg = util.format(format, nodeVer, requiredVer);
    throw new Error(msg);
  }
}

/**
 * Get name of the distribution based on current node versions
 */
function getDist() {
  checkNodeVersion();
  /*
  const nodeMajorVersion = +process.versions.node.split('.')[0];
  return nodeMajorVersion >= 10 ? './dist' : './dist';
  */
  return 'dist';
}

/**
 * Load distribution for the given project and name
 * @param {string} projectRootDir Root directory of the project
 * @param {string} dist Optional name of the distribution
 */
function loadDist(projectRootDir, dist) {
  dist = dist || getDist();
  const distDir = path.join(projectRootDir, dist);
  return require(distDir);
}

module.exports = {getDist, loadDist, checkNodeVersion};
