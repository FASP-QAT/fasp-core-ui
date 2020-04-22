import React, { PureComponent } from 'react';
// import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

const oldCode = `
{
  "name": "Original name",
  "description": null
}
`;
const newCode = `
{
  "name": "My updated name",
  "description": "Brand new description",
  "status": "running"
}
`;

export default class syncPage extends PureComponent {
  render = () => {
    return (
      <></>
      // <ReactDiffViewer
      //     oldValue={oldCode}
      //     newValue={newCode}
      //     compareMethod={DiffMethod.WORDS}
      //     splitView={true}
      // />
    );
  };
}