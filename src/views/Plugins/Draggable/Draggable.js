import React, { Component } from 'react';
import { Button, Card, CardBody, CardHeader } from 'reactstrap';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { getStyle } from '@coreui/coreui-pro/dist/js/coreui-utilities.js'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './Draggable.css'
import defaultLayouts from './_layouts';

const breakPoints = {}
breakPoints.xl = parseInt(getStyle('--breakpoint-xl'), 10)
breakPoints.lg = parseInt(getStyle('--breakpoint-lg'), 10)
breakPoints.md = parseInt(getStyle('--breakpoint-md'), 10)
breakPoints.sm = parseInt(getStyle('--breakpoint-sm'), 10)
breakPoints.xs = parseInt(getStyle('--breakpoint-xs'), 10)

const ResponsiveGridLayout = WidthProvider(Responsive);

class Draggable extends Component {

  constructor(props) {
    super(props);

    this.state = {
      layouts: JSON.parse(localStorage.getItem('CoreUI-React-Draggable-Layouts') || JSON.stringify(defaultLayouts))
    };
  }

  resetLayout() {
    this.setState({ layouts: JSON.parse(JSON.stringify(defaultLayouts)) });
  }

  onLayoutChange(layout, layouts) {
    localStorage.setItem('CoreUI-React-Draggable-Layouts', JSON.stringify(layouts))
    this.setState({ layouts });
  }

  render() {

    const loremIpsum = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.'

    return (
      <div className="animated fadeIn">
        <ResponsiveGridLayout className="layout" layouts={this.state.layouts}
                              onLayoutChange={(layout, layouts) =>
                                this.onLayoutChange(layout, layouts)
                              }
                              breakpoints={breakPoints}
                              cols={{xl: 3, lg: 3, md: 3, sm: 2, xs: 1}}
                              isResizable={false}
                              measureBeforeMount={false}
                              draggableHandle={".card-header"}>
          <Card key="a" className="card-accent-primary">
            <CardHeader>
              <i className="cui-layers"></i>
              Static Card 1
              <div className="card-header-actions">
                <Button color="link" size="sm" className="card-header-action" onClick={() => this.resetLayout()}>Reset Layout</Button>
              </div>
            </CardHeader>
            <CardBody>
              {loremIpsum}
            </CardBody>
          </Card>
          <Card key="b" className="card-accent-secondary">
            <CardHeader>
              <i className="cui-cursor-move"></i>
              Drag & Drop Card 2 <a href="https://coreui.io/pro/react/" className="badge badge-danger">CoreUI Pro Component</a>
            </CardHeader>
            <CardBody>
              {loremIpsum}
            </CardBody>
          </Card>
          <Card key="c" className="card-accent-success">
            <CardHeader>
              <i className="cui-cursor-move"></i>
              Drag & Drop Card 3 <a href="https://coreui.io/pro/react/" className="badge badge-danger">CoreUI Pro Component</a>
            </CardHeader>
            <CardBody>
              {loremIpsum}
            </CardBody>
          </Card>
          <Card key="d" className="card-accent-info">
            <CardHeader>
              <i className="cui-cursor-move"></i>
              Drag & Drop Card 4 <a href="https://coreui.io/pro/react/" className="badge badge-danger">CoreUI Pro Component</a>
            </CardHeader>
            <CardBody>
              {loremIpsum}
            </CardBody>
          </Card>
          <Card key="e" className="card-accent-warning">
            <CardHeader>
              <i className="cui-cursor-move"></i>
              Drag & Drop Card 5 <a href="https://coreui.io/pro/react/" className="badge badge-danger">CoreUI Pro Component</a>
            </CardHeader>
            <CardBody>
              {loremIpsum}
            </CardBody>
          </Card>
          <Card key="f" className="card-accent-danger">
            <CardHeader>
              <i className="cui-cursor-move"></i>
              Drag & Drop Card 6 <a href="https://coreui.io/pro/react/" className="badge badge-danger">CoreUI Pro Component</a>
            </CardHeader>
            <CardBody>
              {loremIpsum}
            </CardBody>
          </Card>
        </ResponsiveGridLayout>
      </div>
    )
  }
}

export default Draggable
