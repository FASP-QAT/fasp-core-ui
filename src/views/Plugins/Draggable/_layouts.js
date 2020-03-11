// layout is an array of objects
const layoutXl = [
  {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
  {i: 'b', x: 1, y: 0, w: 1, h: 2},
  {i: 'c', x: 2, y: 0, w: 1, h: 2},
  {i: 'd', x: 0, y: 1, w: 1, h: 2},
  {i: 'e', x: 1, y: 1, w: 1, h: 2},
  {i: 'f', x: 2, y: 1, w: 1, h: 2}
];
const layoutLg = [
  {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
  {i: 'b', x: 1, y: 0, w: 1, h: 2},
  {i: 'c', x: 2, y: 0, w: 1, h: 2},
  {i: 'd', x: 0, y: 1, w: 1, h: 2},
  {i: 'e', x: 1, y: 1, w: 1, h: 2},
  {i: 'f', x: 2, y: 1, w: 1, h: 2}
];
const layoutMd = [
  {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
  {i: 'b', x: 1, y: 0, w: 1, h: 2},
  {i: 'c', x: 0, y: 1, w: 1, h: 2},
  {i: 'd', x: 1, y: 1, w: 1, h: 2},
  {i: 'e', x: 0, y: 2, w: 1, h: 2},
  {i: 'f', x: 1, y: 2, w: 1, h: 2}
];
const layoutSm = [
  {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
  {i: 'b', x: 0, y: 1, w: 1, h: 2},
  {i: 'c', x: 0, y: 2, w: 1, h: 2},
  {i: 'd', x: 0, y: 3, w: 1, h: 2},
  {i: 'e', x: 0, y: 4, w: 1, h: 2},
  {i: 'f', x: 0, y: 5, w: 1, h: 2}
];

const layouts = { xl: layoutXl, lg: layoutLg, md: layoutMd, sm: layoutMd, xs: layoutSm };

export default layouts;
