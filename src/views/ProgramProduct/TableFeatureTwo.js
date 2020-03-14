import React, { Component } from "react";
import {
    Button
} from 'reactstrap';

export default class DeleteSpecificRow extends Component {
   
    render() {

        return (
            <Button type="button" size="sm" color="danger" onClick={()=>this.props.handleRemoveSpecificRow(this.props.rowId)} ><i className="fa fa-dot-circle-o"></i> Delete  Row </Button>
        );
    }

}