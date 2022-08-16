import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from '../../i18n'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        {/* <span><a href=""></a> &copy; </span>*/}
        <a  onClick={this.props.syncProgram}><span className="mr-auto footerlink hover" style={{cursor:"pointer"}}>{i18n.t('static.dashboard.fullMasterDataSync')}</span></a>
        <span className="ml-auto footerlink">Copyright © 2020 {i18n.t('static.footer')}</span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
