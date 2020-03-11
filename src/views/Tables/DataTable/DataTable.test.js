import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router'
import DataTable from './DataTable';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MemoryRouter><DataTable /></MemoryRouter>, div);
  ReactDOM.unmountComponentAtNode(div);
});
