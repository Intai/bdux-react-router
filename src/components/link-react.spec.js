import chai from 'chai';
import sinon from 'sinon';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Link from './link-react';

const render = () => {
  let renderer = TestUtils.createRenderer();
  renderer.render(<Link to="/path" />);
  return renderer.getRenderOutput();
};

describe('Link Component', () => {

  it('should handle onclick', () => {
    let output = render();
    chai.expect(output.props.onClick).to.be.a('function');
  });

});
