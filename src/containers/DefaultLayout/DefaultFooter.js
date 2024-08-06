import PropTypes from 'prop-types';
import React, { Component } from 'react';
import i18n from '../../i18n';
const propTypes = {
  children: PropTypes.node,
};
const defaultProps = {};
/**
 * This is the footer component that needs to be displayed on every page
 */
class DefaultFooter extends Component {
  render() {
    const { children, ...attributes } = this.props;
    return (
      <React.Fragment>
        {localStorage.getItem('sessionType') === 'Online' && <a onClick={this.props.syncProgram}><span className="mr-auto footerlink hover" style={{ cursor: "pointer" }}>{i18n.t('static.dashboard.fullMasterDataSync')}</span></a>}
        <span className="ml-auto footerlink">Copyright © 2020 {i18n.t('static.footer')}</span>
      </React.Fragment>
    );
  }
}
DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;
export default DefaultFooter;
