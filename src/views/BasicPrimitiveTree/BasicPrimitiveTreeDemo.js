// import React from 'react';
// import { OrgDiagram } from 'basicprimitivesreact';
// import { PageFitMode, Enabled } from 'basicprimitives';
// import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent'
// var photos = {
//     a: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAA8CAIAAACrV36WAAAAAXNSR0IArs4c6QAAAARn' +
//         'QU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGnSURBVGhD7dnBbQJBDAVQk1o2QjlQwKYGzpSwKQfq4IxIC' +
//         'RTB9jLZHCJFwWv7/7EiDt6zmX2yPYMHNq01eb7n5flI36JiIXWpbFW2kAwgsdVblS0kA0hs9db/ZWs+vW/Wno9PxPE3dh' +
//         'ls6Od+HI1XT1d64Sb8R5utEulwdbA8VY+LZ/kqkfF456pBHxDz5Xxze/p2vsxukBbAshTVOE0PO4B2cUlWKrgUTKsrV0e' +
//         'ut3RVU/cm5aKKqPXVbjuIDPtDUh2JImq1+jmjkupIFNFStXadHncWXkecpb3393me4oJZnionXyjLV6W4QFZEleHCWNG+' +
//         '0eKggQJiRVV6vhAXwoqrul0AC1H1uuIsTLUyukYH1jBL7WJ8lgq6oqwkVXSQDrLSVEFXjJWoirlCrFRVyBVhJasirgCr6' +
//         '5tEv7a5A5jL0tcN7vNl9OVcHqtXRbocVr+Kc9k3H/3qPL69Ise7dh0SsS+2JmtFddgvdy/gGbY7Jdp2GRcyrlu1BfUjxt' +
//         'iPRm/lqVbGHOMHnU39zQm0I/UbBLA+GVosJHGVrcoWkgEktnoLydYXkF/LiXG21MwAAAAASUVORK5CYII='
// };
// function BasicPrimitiveTreeDemo() {

//     const config = {
//         pageFitMode: PageFitMode.AutoSize,
//         autoSizeMinimum: { width: 100, height: 100 },
//         cursorItem: 0,
//         highlightItem: 0,
//         hasSelectorCheckbox: Enabled.True,
//         items: [
//             {
//                 id: 0,
//                 parent: null,
//                 title: 'Akil Mahimwala',
//                 description: 'CEO, Altius',
//                 image: photos.a
//             },
//             {
//                 id: 1,
//                 parent: 0,
//                 title: 'Ravi Sharma',
//                 description: 'Manager, Software',
//                 image: photos.a
//             },
//             {
//                 id: 2,
//                 parent: 0,
//                 title: 'Sameer Gharpure',
//                 description: 'Manager, Software',
//                 image: photos.a
//             },
//             {
//                 id: 3,
//                 parent: 2,
//                 title: 'Anchal Chouvhan',
//                 description: 'Project Lead',
//                 image: photos.a
//             },
//             {
//                 id: 4,
//                 parent: 3,
//                 title: 'Dolly Chabbriya',
//                 description: 'Sr. Developer',
//                 image: photos.a
//             },
//             {
//                 id: 5,
//                 parent: 3,
//                 title: 'Palash Nikam',
//                 description: 'Sr. Developer',
//                 image: photos.a
//             },
//             {
//                 id: 6,
//                 parent: 3,
//                 title: 'Shubham Deulkar',
//                 description: 'Developer',
//                 image: photos.a
//             }

//         ]
//     };

//     return (
//         <div className="animated fadeIn">
//             {/* <AuthenticationServiceComponent history={this.props.history} /> */}
//             <OrgDiagram centerOnCursor={true} config={config} />
//         </div>
//     );
// }

// export default BasicPrimitiveTreeDemo;
import React, { Component } from 'react';
import SamplesList from '../../SamplesList';
import {
    DragNDrop
} from '../../Samples';
// import '../../../src/global.css';

class BasicPrimitiveTreeDemo extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);

        let key = 1;
        this.hash = SamplesList.reduce((agg, group) => {
            group.key = key;
            key += 1;
            group.items.reduce((agg, item) => {
                item.key = key;
                key += 1;
                agg[item.key] = item;
                return agg;
            }, agg)
            return agg;
        }, {});

        this.state = {
            activeItem: (SamplesList[0].items[0])
        };
    }
    componentDidMount() {
        console.log("activeItem---", this.state.activeItem);
    }
    onChange({ target }) {
        const { activeItem } = this.state;
        const newItem = this.hash[target.value];
        if (activeItem.key !== newItem.key) {
            this.setState({
                activeItem: newItem
            });
        }
    }

    render() {
        const { activeItem } = this.state;
        return (
            <div className="container">
                <h1>Basic Primitives Diagrams for React</h1>
                <p>
                    {/* <select onChange={this.onChange}>
                        {SamplesList.map(({ key, label, items }) => (
                            <optgroup key={key} label={label}>
                                {items.map(({ key: itemKey, label }) => (
                                    <option key={itemKey} value={itemKey} >{label}</option>
                                ))}
                            </optgroup>
                        )
                        )}
                    </select> */}
                </p>
                <div class="sample">
                    {/* <DragNDrop /> */}
                    {activeItem.component}
                </div>
            </div>
        );
    }
}

export default BasicPrimitiveTreeDemo;
