import React, { Component } from 'react';
import {
    Alert,
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Row
} from 'reactstrap';
import BroadcastService from '../../../api/BroadcastService';
import getLabelText from '../../../CommonComponent/getLabelText';

class UnsubscribeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: '',
            preferences: [],
            loading: true,
            saving: false,
            successMessage: '',
            errorMessage: '',
            lang: localStorage.getItem('lang') || 'en'
        };
    }

    componentDidMount() {
        const query = new URLSearchParams(this.props.location.search);
        const token = query.get('token') || '';
        this.setState({ token }, () => {
            if (token) {
                this.loadPreferences(token);
            } else {
                this.setState({
                    loading: false,
                    errorMessage: 'No unsubscribe token provided. Please use the link provided in your email or log in to QAT to manage your notification preferences.'
                });
            }
        });
    }

    loadPreferences = (token) => {
        BroadcastService.getPreferencesByToken(token)
            .then(res => {
                this.setState({
                    preferences: res.data || [],
                    loading: false
                });
            })
            .catch(err => {
                this.setState({
                    loading: false,
                    errorMessage: 'Invalid or expired unsubscribe link. Please log in to QAT to manage your preferences.'
                });
            });
    };

    handleToggle = (categoryId) => {
        const updated = this.state.preferences.map(p => {
            if (p.categoryId === categoryId && p.allowOptOut) {
                return { ...p, optedOut: !p.optedOut };
            }
            return p;
        });
        this.setState({ preferences: updated });
    };

    handleUnsubscribeCategory = (categoryId) => {
        this.setState({ saving: true, successMessage: '', errorMessage: '' });
        BroadcastService.unsubscribeByToken({
            token: this.state.token,
            categoryId: categoryId
        })
            .then(() => {
                const updated = this.state.preferences.map(p => {
                    if (p.categoryId === categoryId) {
                        return { ...p, optedOut: true };
                    }
                    return p;
                });
                this.setState({
                    saving: false,
                    preferences: updated,
                    successMessage: 'You have been successfully unsubscribed from this email category.'
                });
            })
            .catch(err => {
                this.setState({
                    saving: false,
                    errorMessage: 'Failed to update preference. Please try again.'
                });
            });
    };

    render() {
        const { preferences, loading, saving, successMessage, errorMessage } = this.state;

        return (
            <div className="app flex-row align-items-center" style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '40px 15px' }}>
                <Container>
                    <Row className="justify-content-center">
                        <Col md="8" lg="6">
                            <Card className="shadow border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                                <CardHeader className="text-white py-4 text-center" style={{ backgroundColor: '#002f6c' }}>
                                    <h4 className="mb-1" style={{ fontWeight: 700 }}>Quantification Analytics Tool (QAT)</h4>
                                    <p className="mb-0 small" style={{ opacity: 0.9 }}>Email Notification Preferences</p>
                                </CardHeader>
                                <CardBody className="p-4">
                                    {successMessage && <Alert color="success">{successMessage}</Alert>}
                                    {errorMessage && <Alert color="danger">{errorMessage}</Alert>}

                                    {loading ? (
                                        <div className="text-center py-5">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-3 text-muted">Loading your preferences...</p>
                                        </div>
                                    ) : preferences.length > 0 ? (
                                        <div>
                                            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
                                                Manage which email updates you receive from QAT. You can opt out of announcements at any time.
                                            </p>

                                            <div className="list-group list-group-flush mb-4">
                                                {preferences.map(pref => (
                                                    <div key={pref.categoryId} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                                        <div style={{ paddingRight: '15px' }}>
                                                            <div style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>
                                                                {pref.label ? getLabelText(pref.label, this.state.lang) : pref.categoryName}
                                                                {!pref.allowOptOut && (
                                                                    <span className="badge badge-secondary ml-2" style={{ fontSize: '11px', fontWeight: 'normal' }}>
                                                                        Mandatory
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <small className="text-muted d-block mt-1">
                                                                {!pref.allowOptOut
                                                                    ? 'Mandatory system and downtime announcements.'
                                                                    : (pref.optedOut ? 'Currently unsubscribed.' : 'Currently subscribed.')}
                                                            </small>
                                                        </div>
                                                        <div>
                                                            {pref.allowOptOut ? (
                                                                pref.optedOut ? (
                                                                    <span className="badge badge-warning p-2">Unsubscribed</span>
                                                                ) : (
                                                                    <Button
                                                                        color="danger"
                                                                        size="sm"
                                                                        outline
                                                                        onClick={() => this.handleUnsubscribeCategory(pref.categoryId)}
                                                                        disabled={saving}
                                                                    >
                                                                        Unsubscribe
                                                                    </Button>
                                                                )
                                                            ) : (
                                                                <span className="text-muted small">Always active</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="text-center mt-4 pt-3 border-top">
                                                <small className="text-muted">
                                                    Need further assistance? Contact <a href="mailto:support@quantificationanalytics.org">support@quantificationanalytics.org</a>
                                                </small>
                                            </div>
                                        </div>
                                    ) : null}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default UnsubscribeComponent;
