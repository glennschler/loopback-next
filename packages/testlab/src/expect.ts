// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const shouldAsFunction = require('should/as-function');

// tslint:disable-next-line:no-any
shouldAsFunction.use((should: any, assertion: any) => {
  assertion.addChain('to');
});

export const expect = shouldAsFunction;
