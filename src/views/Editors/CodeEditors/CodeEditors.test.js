import React from 'react';
import ReactDOM from 'react-dom';
import CodeEditors from './CodeEditors';

global.window.focus = jest.fn();

global.document.createRange = () => {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {
      return {right: 0};
    },
    getClientRects: () => {
      return {
        length: 0,
        left: 0,
        right: 0
      };
    },
  }
};

global.document.body.createTextRange = () => {
  return {
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {},
    getBoundingClientRect: () => {
      return {right: 0};
    },
    getClientRects: () => {
      return {
        length: 0,
        left: 0,
        right: 0
      };
    },
  };
};


it('renders without crashing', () => {

  const div = document.createElement('div');

  ReactDOM.render(<CodeEditors/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
