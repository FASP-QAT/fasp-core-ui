import React from 'react';
import ReactDOM from 'react-dom';
import Draggable from './Draggable';

var localStorageMock = (function() {
  var store = {};
  return {
    getItem: function(key) {
      return store[key];
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Draggable />, div);
  ReactDOM.unmountComponentAtNode(div);
});
