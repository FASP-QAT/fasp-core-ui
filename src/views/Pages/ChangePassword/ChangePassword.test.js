import React from 'react';
import ReactDOM from 'react-dom';
import ChangePassword from './ChangePassword';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ChangePassword />, div);
  ReactDOM.unmountComponentAtNode(div);
});
