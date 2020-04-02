import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import ProductService from '../../api/ProductService'
import AuthenticationService from '../Common/AuthenticationService.js';
import getLabelText from '../../CommonComponent/getLabelText'
import i18n from '../../i18n'

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: [],
      lang: localStorage.getItem('lang'),
      message:''
    }

    this.options = {
      sortIndicator: true,
      hideSizePerPage: true,
      paginationSize: 3,
      hidePageListOnlyOnePage: true,
      clearSearch: true,
      alwaysShowAllBtns: false,
      withFirstAndLast: false,
      onRowClick: function (row) {
        this.editProduct(row);
      }.bind(this)
    }

    this.showProductLabel = this.showProductLabel.bind(this);
    this.showGenericLabel = this.showGenericLabel.bind(this);
    this.showRealmLabel = this.showRealmLabel.bind(this);
    this.showProductCategoryLabel = this.showProductCategoryLabel.bind(this);
    this.showForcastingUnitLabel = this.showForcastingUnitLabel.bind(this);
    this.editProduct = this.editProduct.bind(this);
    this.addProduct = this.addProduct.bind(this);
  }

  editProduct(product) {
    console.log(product);
    var productId=product.productId;
    this.props.history.push({
      pathname: `/product/editProduct/${productId}`,
      // state: { product }
    });
  }

  addProduct() {
    this.props.history.push({
      pathname: "/product/addProduct"
    });
  } 

  componentDidMount() {
    AuthenticationService.setupAxiosInterceptors();
    ProductService.getProductList()
      .then(response => {
        if (response.status == 200) {
          console.log(response.data);
          this.setState({
            table: response.data
          })
        } else {
          this.setState({ message: response.data.messageCode })
        }
      })
      .catch(
        error => {
          if (error.message === "Network Error") {
            this.setState({ message: error.message });
          } else {
            switch (error.response.status) {
              case 500:
              case 401:
              case 404:
              case 406:
              case 412:
                this.setState({ message: error.response.data.messageCode });
                break;
              default:
                this.setState({ message: 'static.unkownError' });
                break;
            }
          }
        }
      );
  }


  showProductLabel(cell, row) {
    return getLabelText(cell, this.state.lang);
  }

  showGenericLabel(cell, row) {
    return getLabelText(cell, this.state.lang);
  }

  showRealmLabel(cell, row) {
    return getLabelText(cell.label, this.state.lang);
  }


  showProductCategoryLabel(cell, row) {
    return getLabelText(cell.label, this.state.lang);
  }


  showForcastingUnitLabel(cell, row) {
    return getLabelText(cell.label, this.state.lang);
  }

  showStatus(cell, row) {
    if (cell) {
      return "Active";
    } else {
      return "Disabled";
    }
  }
  render() {
    return (
      <div className="animated">
        <h5>{i18n.t(this.props.match.params.message)}</h5>
        <h5>{i18n.t(this.state.message)}</h5>
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>{i18n.t('static.product.productlist')}{' '}
            <div className="card-header-actions">
              <div className="card-header-action">
                <a href="javascript:void();" title="Add product" onClick={this.addProduct}><i className="fa fa-plus-square"></i></a>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.state.table} version="4" hover pagination search options={this.options}>
              <TableHeaderColumn isKey dataField="productId" hidden>Product Id</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="label" dataFormat={this.showProductLabel} dataSort>{i18n.t('static.product.product')}</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="genericLabel" dataFormat={this.showGenericLabel} dataSort>{i18n.t('static.product.productgenericname')}</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="realm" dataFormat={this.showRealmLabel} dataSort>{i18n.t('static.product.realm')}</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="productCategory" dataFormat={this.showProductCategoryLabel} dataSort>{i18n.t('static.product.productcategory')}</TableHeaderColumn>
              <TableHeaderColumn filterFormatted dataField="forecastingUnit" dataFormat={this.showForcastingUnitLabel} dataSort>{i18n.t('static.product.unit')}</TableHeaderColumn>
              {/* <TableHeaderColumn dataField="stopDate" dataSort>Stop date</TableHeaderColumn> */}
              <TableHeaderColumn dataFormat={this.showStatus} dataField="active">Active</TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default ProductList;
