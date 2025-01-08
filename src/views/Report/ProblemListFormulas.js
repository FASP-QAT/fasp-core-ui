import React, { Component } from 'react';
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Modal, ModalBody, ModalHeader } from 'reactstrap';
import i18n from '../../i18n';
/**
 * Component for Showing Formulas on Problem List.
 */
class ProblemListFormulas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 1,
            accordion: [true, true, true],
            collapse: true,
            modal: false,
            large: false,
            small: false,
            info: false,
            costofinventory: false,
            forecastmatrix: false,
            stockstatusovertime: false,
            inventoryturns: false,
            stockstatus: false,
            stockstatusacrossplaningunit: false,
            shipmentcost: false,
            stockstatusmatrix: false,
        };
        this.toggle = this.toggle.bind(this);
    }
    /**
     * This function is used to toggle the show formula modal
     */
    toggle() {
        this.setState({
            modal: !this.state.modal,
        });
    }
    /**
     * Renders the Formula popup for problem list.
     * @returns {JSX.Element} - Problem list formula popup.
     */
    render() {
        return (
            <div className="animated fadeIn">
                <Modal isOpen={this.state.modal} className={'modal-xl ' + this.props.className} >
                    <ModalHeader toggle={this.toggle} className="ModalHead modal-info-Headher"><strong className="TextWhite" >{i18n.t('static.report.problemReportStatusDetails')}</strong></ModalHeader>
                    <ModalBody >
                        <ListGroup style={{ height: '490px', overflowY: 'scroll' }}>
                            <h5><span className="formulastext-p"><b>{i18n.t('static.problemReport.issueStatus')}</b></span></h5>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.inCompliance')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.inComplianceDesc')}</span></p>
                                    <p><span className="formulastext-p">{i18n.t('static.common.example')} :</span><br></br>
                                        {i18n.t('static.problemReport.inComplianceExample')}</p>
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.resolved')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.resolvedDesc')}</span></p>
                                    <p><span className="formulastext-p">{i18n.t('static.common.example')} :</span><br></br>
                                        {i18n.t('static.problemReport.resolvedExample')}</p>
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.addressed')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.addressedDesc')}</span></p>
                                    <p><span className="formulastext-p">{i18n.t('static.common.example')} :</span><br></br>
                                        {i18n.t('static.problemReport.addressedExample')}</p>
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.open')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.openDesc')}</span></p>
                                    <p><span className="formulastext-p">{i18n.t('static.common.example')} :</span><br></br>
                                        {i18n.t('static.problemReport.openExample')}</p>
                                </ListGroupItemText>
                            </ListGroupItem><br></br>
                            <h5><span className="formulastext-p"><b>{i18n.t('static.problemReport.issueReviewStatus')}</b></span></h5>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.reviewed')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.reviewedDesc')}</span></p>
                                </ListGroupItemText>
                            </ListGroupItem><br></br>
                            <h5><span className="formulastext-p"><b>{i18n.t('static.problemReport.supplyPlanStatus')}</b></span></h5>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.pendingapproval')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.pendingapprovalDesc')}</span></p>
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.rejected')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.rejectedDesc')}</span></p>
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.approved')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.approvedDesc')}</span></p>
                                </ListGroupItemText>
                            </ListGroupItem>
                            <ListGroupItem >
                                <ListGroupItemHeading className="formulasheading">{i18n.t('static.problemReport.noreviewneeded')}</ListGroupItemHeading>
                                <ListGroupItemText className="formulastext">
                                    <p><span className="">{i18n.t('static.problemReport.noreviewneededDesc')}</span></p>
                                </ListGroupItemText>
                            </ListGroupItem>
                        </ListGroup>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}
export default ProblemListFormulas;
