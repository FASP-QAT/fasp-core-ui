import React, { Component } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import {
    Badge,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Table
} from 'reactstrap';
import BroadcastService from '../../api/BroadcastService';
import LanguageService from '../../api/LanguageService';
import UserService from '../../api/UserService';
import getLabelText from '../../CommonComponent/getLabelText';
import { filterOptions, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

class BroadcastMessageComponent extends Component {
    constructor(props) {
        super(props);
        this.editorRef = React.createRef();
        this.state = {
            categories: [],
            languages: [],
            roleList: [],
            categoryId: 1,
            selectedRoles: [],
            selectedLanguage: '',
            subject: '',
            messageBody: '',
            recipientCount: 0,
            loadingCount: false,
            sending: false,
            loading: true,
            successMessage: '',
            errorMessage: '',
            historyModalOpen: false,
            historyList: [],
            loadingHistory: false,
            selectedHistoryItem: null,
            historyViewModalOpen: false,
            lang: localStorage.getItem('lang') || 'en'
        };

        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }

    componentDidMount() {
        this.loadCategories();
        this.loadRoles();
        this.loadLanguages();
    }

    loadCategories = () => {
        BroadcastService.getCategories()
            .then(res => {
                const cats = res.data || [];
                this.setState({
                    categories: cats,
                    categoryId: cats.length > 0 ? cats[0].categoryId : 1,
                    loading: false
                }, this.calculateRecipientCount);
            })
            .catch(err => {
                console.error('Failed to load categories', err);
                this.setState({ loading: false });
            });
    };

    loadRoles = () => {
        UserService.getRoleList()
            .then(res => {
                if (res.status === 200 && res.data) {
                    const roles = res.data.map(r => ({
                        value: r.roleId,
                        label: getLabelText(r.label, this.state.lang)
                    }));
                    roles.sort((a, b) => {
                        const itemA = a.label ? a.label.toUpperCase() : '';
                        const itemB = b.label ? b.label.toUpperCase() : '';
                        return itemA.localeCompare(itemB);
                    });
                    this.setState({
                        roleList: roles,
                        selectedRoles: roles
                    }, this.calculateRecipientCount);
                }
            })
            .catch(err => {
                console.error('Failed to load roles', err);
            });
    };

    loadLanguages = () => {
        LanguageService.getLanguageListActive()
            .then(res => {
                if (res.status === 200 && res.data) {
                    const list = res.data.map(l => ({
                        languageId: l.languageId,
                        label: getLabelText(l.label, this.state.lang) || (l.label && l.label.label_en) || l.languageCode
                    }));
                    list.sort((a, b) => {
                        const itemA = a.label ? a.label.toUpperCase() : '';
                        const itemB = b.label ? b.label.toUpperCase() : '';
                        return itemA.localeCompare(itemB);
                    });
                    this.setState({ languages: list });
                }
            })
            .catch(err => {
                console.error('Failed to load languages', err);
            });
    };

    loadHistory = () => {
        this.setState({ loadingHistory: true });
        BroadcastService.getBroadcastHistory()
            .then(res => {
                this.setState({
                    historyList: res.data || [],
                    loadingHistory: false
                });
            })
            .catch(err => {
                console.error('Failed to load broadcast history', err);
                this.setState({ loadingHistory: false });
            });
    };

    calculateRecipientCount = () => {
        const { categoryId, selectedRoles, roleList, selectedLanguage } = this.state;
        if (!selectedRoles || selectedRoles.length === 0) {
            this.setState({ recipientCount: 0, loadingCount: false });
            return;
        }
        const isAllRoles = selectedRoles.length === roleList.length;
        const targetRoles = isAllRoles ? [] : selectedRoles.map(r => r.value);
        const targetLanguages = selectedLanguage ? [parseInt(selectedLanguage)] : [];

        this.setState({ loadingCount: true });
        BroadcastService.getRecipientCount({
            categoryId: parseInt(categoryId),
            targetRoles: targetRoles,
            targetLanguages: targetLanguages
        })
            .then(res => {
                this.setState({
                    recipientCount: res.data ? res.data.recipientCount : 0,
                    loadingCount: false
                });
            })
            .catch(err => {
                console.error('Failed to get recipient count', err);
                this.setState({ loadingCount: false });
            });
    };

    handleCategoryChange = (e) => {
        this.setState({ categoryId: e.target.value }, this.calculateRecipientCount);
    };

    handleRoleChange = (selected) => {
        this.setState({ selectedRoles: selected || [] }, this.calculateRecipientCount);
    };

    handleLanguageChange = (e) => {
        this.setState({ selectedLanguage: e.target.value }, this.calculateRecipientCount);
    };

    handleSubjectChange = (e) => {
        this.setState({ subject: e.target.value });
    };

    handleBodyInput = () => {
        if (this.editorRef.current) {
            const textOnly = this.editorRef.current.innerText || '';
            const isEmpty = textOnly.trim() === '';
            if (isEmpty) {
                this.editorRef.current.setAttribute('data-empty', 'true');
                this.setState({ messageBody: '' });
            } else {
                this.editorRef.current.removeAttribute('data-empty');
                this.setState({ messageBody: this.editorRef.current.innerHTML });
            }
        }
    };

    formatText = (command, value = null) => {
        if (this.editorRef.current) {
            this.editorRef.current.focus();
        }
        document.execCommand(command, false, value);
        this.handleBodyInput();
    };

    insertLinkPrompt = () => {
        const url = prompt(i18n.t('static.broadcast.enterUrl', 'Enter URL (e.g. https://www.example.com):'), 'https://');
        if (url && url.trim() !== '' && url !== 'https://') {
            this.formatText('createLink', url.trim());
        }
    };

    toggleHistoryModal = () => {
        const nextState = !this.state.historyModalOpen;
        this.setState({ historyModalOpen: nextState }, () => {
            if (nextState) {
                this.loadHistory();
            }
        });
    };

    handleSendClick = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        const { subject, messageBody, selectedRoles } = this.state;
        if (!selectedRoles || selectedRoles.length === 0) {
            this.setState({ errorMessage: i18n.t('static.broadcast.roleRequired', 'Please select at least one role in Target Audience.') }, () => {
                hideSecondComponent();
            });
            return;
        }
        if (!subject || subject.trim() === '') {
            this.setState({ errorMessage: i18n.t('static.broadcast.subjectRequired', 'Subject line is required.') }, () => {
                hideSecondComponent();
            });
            return;
        }
        const textOnly = messageBody ? messageBody.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim() : '';
        if (!textOnly) {
            this.setState({ errorMessage: i18n.t('static.broadcast.bodyRequired', 'Message body cannot be empty.') }, () => {
                hideSecondComponent();
            });
            return;
        }

        this.setState({ sending: true, successMessage: '', errorMessage: '' });

        const { categoryId, roleList, selectedLanguage } = this.state;
        const isAllRoles = !selectedRoles || selectedRoles.length === 0 || selectedRoles.length === roleList.length;
        const targetRoles = isAllRoles ? [] : selectedRoles.map(r => r.value);
        const targetLanguages = selectedLanguage ? [parseInt(selectedLanguage)] : [];

        BroadcastService.sendBroadcast({
            categoryId: parseInt(categoryId),
            targetRoles: targetRoles,
            targetLanguages: targetLanguages,
            subject: subject.trim(),
            bodyHtml: messageBody
        })
            .then(res => {
                if (this.editorRef.current) {
                    this.editorRef.current.innerHTML = '';
                    this.editorRef.current.setAttribute('data-empty', 'true');
                }
                this.setState({
                    sending: false,
                    successMessage: i18n.t('static.broadcast.addedSuccess', 'Broadcast message added successfully.'),
                    subject: '',
                    messageBody: ''
                }, () => {
                    hideSecondComponent();
                });
            })
            .catch(err => {
                console.error('Send broadcast failed', err);
                const msg = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to send broadcast message. Please try again.';
                this.setState({
                    sending: false,
                    errorMessage: msg
                }, () => {
                    hideSecondComponent();
                });
            });
    };

    viewHistoryDetails = (item) => {
        this.setState({
            selectedHistoryItem: item,
            historyViewModalOpen: true
        });
    };

    toggleHistoryViewModal = () => {
        this.setState({
            historyViewModalOpen: !this.state.historyViewModalOpen,
            selectedHistoryItem: null
        });
    };

    cancelClicked() {
        this.props.history.push('/applicationDashboard');
    }

    resetClicked() {
        if (this.editorRef.current) {
            this.editorRef.current.innerHTML = '';
            this.editorRef.current.setAttribute('data-empty', 'true');
        }
        const firstCat = this.state.categories.length > 0 ? this.state.categories[0].categoryId : 1;
        this.setState({
            categoryId: firstCat,
            selectedRoles: this.state.roleList,
            selectedLanguage: '',
            subject: '',
            messageBody: '',
            errorMessage: '',
            successMessage: ''
        }, this.calculateRecipientCount);
    }

    render() {
        const {
            categories,
            languages,
            roleList,
            categoryId,
            selectedRoles,
            selectedLanguage,
            subject,
            messageBody,
            recipientCount,
            loadingCount,
            sending,
            successMessage,
            errorMessage,
            historyModalOpen,
            historyList,
            loadingHistory,
            selectedHistoryItem,
            historyViewModalOpen,
            lang
        } = this.state;

        const selectedCategory = categories.find(c => c.categoryId === parseInt(categoryId));
        const selectedCategoryLabel = selectedCategory
            ? (selectedCategory.label ? getLabelText(selectedCategory.label, lang) : selectedCategory.categoryName)
            : '';

        const textOnly = messageBody ? messageBody.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim() : '';

        return (
            <div className="animated fadeIn">
                <AuthenticationServiceComponent history={this.props.history} />
                <h5 className="green" id="div1">{successMessage}</h5>
                <h5 className="red" id="div2">{errorMessage}</h5>

                <Row>
                    <Col xs="12" sm="12">
                        <Card>
                            <CardHeader className="d-flex justify-content-between align-items-center">
                                <strong><i className="fa fa-bullhorn mr-2"></i>{i18n.t('static.broadcast.broadcastMessage', 'Broadcast Message')}</strong>
                                <Button
                                    color="info"
                                    size="sm"
                                    className="text-white"
                                    type="button"
                                    onClick={this.toggleHistoryModal}
                                >
                                    <i className="fa fa-history mr-1"></i> {i18n.t('static.broadcast.history', 'Broadcast History')}
                                </Button>
                            </CardHeader>

                            <Form className="needs-validation" noValidate name="broadcastForm" autoComplete="off" onSubmit={this.handleSendClick}>
                                <CardBody className="pt-2 pb-0" style={{ display: this.state.loading ? 'none' : 'block' }}>
                                    <Row>
                                        <Col md={3} sm={6}>
                                            <FormGroup>
                                                <Label htmlFor="categoryId">
                                                    {i18n.t('static.broadcast.category', 'Category')}<span className="red Reqasterisk">*</span>
                                                </Label>
                                                <Input
                                                    type="select"
                                                    id="categoryId"
                                                    name="categoryId"
                                                    bsSize="sm"
                                                    value={categoryId}
                                                    onChange={this.handleCategoryChange}
                                                >
                                                    {categories.map(c => {
                                                        const catName = c.label ? getLabelText(c.label, lang) : c.categoryName;
                                                        return (
                                                            <option key={c.categoryId} value={c.categoryId}>
                                                                {catName} {!c.allowOptOut ? `(${i18n.t('static.common.mandatory', 'Mandatory')})` : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                        <Col md={3} sm={6}>
                                            <FormGroup>
                                                <Label htmlFor="targetRoles">
                                                    {i18n.t('static.broadcast.targetAudience', 'Target Audience')}<span className="red Reqasterisk">*</span>
                                                </Label>
                                                <MultiSelect
                                                    bsSize="sm"
                                                    name="targetRoles"
                                                    id="targetRoles"
                                                    value={selectedRoles}
                                                    onChange={this.handleRoleChange}
                                                    options={roleList}
                                                    filterOptions={filterOptions}
                                                    disabled={this.state.loading}
                                                    overrideStrings={{
                                                        allItemsAreSelected: i18n.t('static.common.allitemsselected', 'All items are selected.'),
                                                        selectSomeItems: i18n.t('static.common.select')
                                                    }}
                                                />
                                            </FormGroup>
                                        </Col>
                                        <Col md={3} sm={6}>
                                            <FormGroup>
                                                <Label htmlFor="selectedLanguage">
                                                    {i18n.t('static.broadcast.preferredLanguage', 'Preferred Language')}
                                                </Label>
                                                <Input
                                                    type="select"
                                                    id="selectedLanguage"
                                                    name="selectedLanguage"
                                                    bsSize="sm"
                                                    value={selectedLanguage}
                                                    onChange={this.handleLanguageChange}
                                                >
                                                    <option value="">{i18n.t('static.common.all', 'All')}</option>
                                                    {languages.map(l => (
                                                        <option key={l.languageId} value={l.languageId}>
                                                            {l.label}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                        </Col>
                                        <Col md={3} sm={6}>
                                            <FormGroup>
                                                <Label htmlFor="estimatedRecipients">
                                                    {i18n.t('static.broadcast.estimatedRecipients', 'Estimated Recipients')}
                                                </Label>
                                                <Input
                                                    type="text"
                                                    id="estimatedRecipients"
                                                    name="estimatedRecipients"
                                                    bsSize="sm"
                                                    readOnly={true}
                                                    value={loadingCount ? i18n.t('static.common.loading', 'Loading...') : `${recipientCount} ${i18n.t('static.broadcast.activeUsers', 'Active Users')}`}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12}>
                                            <FormGroup>
                                                <Label htmlFor="subjectInput">
                                                    {i18n.t('static.broadcast.subject', 'Subject')}<span className="red Reqasterisk">*</span>
                                                </Label>
                                                <Input
                                                    type="text"
                                                    id="subjectInput"
                                                    name="subjectInput"
                                                    bsSize="sm"
                                                    maxLength={200}
                                                    value={subject}
                                                    onChange={this.handleSubjectChange}
                                                    required
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12}>
                                            <FormGroup>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <Label htmlFor="messageBody" className="mb-0">
                                                        {i18n.t('static.broadcast.body', 'Message Body')}<span className="red Reqasterisk">*</span>
                                                    </Label>
                                                    <div className="btn-group broadcast-toolbar">
                                                        <button type="button" className="btn" title="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => this.formatText('bold')}><b>B</b></button>
                                                        <button type="button" className="btn" title="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => this.formatText('italic')}><i>I</i></button>
                                                        <button type="button" className="btn" title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => this.formatText('underline')}><u>U</u></button>
                                                        <button type="button" className="btn" title="Strikethrough" onMouseDown={(e) => e.preventDefault()} onClick={() => this.formatText('strikeThrough')}><s>S</s></button>
                                                        <button type="button" className="btn" title="Heading" onMouseDown={(e) => e.preventDefault()} onClick={() => this.formatText('formatBlock', '<h3>')}><strong>H</strong></button>
                                                        <button type="button" className="btn" title="Bullet List" onMouseDown={(e) => e.preventDefault()} onClick={() => this.formatText('insertUnorderedList')}><i className="fa fa-list-ul"></i></button>
                                                        <button type="button" className="btn" title="Numbered List" onMouseDown={(e) => e.preventDefault()} onClick={() => this.formatText('insertOrderedList')}><i className="fa fa-list-ol"></i></button>
                                                        <button type="button" className="btn" title="Link" onMouseDown={(e) => e.preventDefault()} onClick={this.insertLinkPrompt}><i className="fa fa-link"></i></button>
                                                    </div>
                                                </div>
                                                <div
                                                    ref={this.editorRef}
                                                    id="messageBody"
                                                    className="form-control broadcast-editor"
                                                    contentEditable={true}
                                                    data-empty="true"
                                                    data-placeholder={i18n.t('static.broadcast.enterMessagePlaceholder', 'Write your message here...')}
                                                    onInput={this.handleBodyInput}
                                                    onBlur={this.handleBodyInput}
                                                    onKeyUp={this.handleBodyInput}
                                                    style={{ minHeight: '220px', height: 'auto', overflowY: 'auto' }}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </CardBody>

                                <div style={{ display: this.state.loading ? 'block' : 'none' }}>
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: "400px" }}>
                                        <div className="align-items-center">
                                            <div><h4><strong>{i18n.t('static.common.loading')}</strong></h4></div>
                                            <div className="spinner-border blue ml-4" role="status"></div>
                                        </div>
                                    </div>
                                </div>

                                <CardFooter>
                                    <FormGroup>
                                        <Button
                                            type="button"
                                            color="danger"
                                            className="mr-1 float-right"
                                            size="md"
                                            onClick={this.cancelClicked}
                                        >
                                            <i className="fa fa-times"></i> {i18n.t('static.common.cancel')}
                                        </Button>
                                        <Button
                                            type="reset"
                                            size="md"
                                            color="warning"
                                            className="float-right mr-1 text-white"
                                            onClick={this.resetClicked}
                                        >
                                            <i className="fa fa-refresh"></i> {i18n.t('static.common.reset')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="success"
                                            className="mr-1 float-right"
                                            size="md"
                                            disabled={sending || recipientCount === 0 || !subject.trim() || !textOnly}
                                        >
                                            <i className="fa fa-check"></i> {sending ? i18n.t('static.common.loading') : i18n.t('static.common.submit')}
                                        </Button>
                                        &nbsp;
                                    </FormGroup>
                                </CardFooter>
                            </Form>
                        </Card>
                    </Col>
                </Row>

                {/* Broadcast History Modal */}
                <Modal isOpen={historyModalOpen} toggle={this.toggleHistoryModal} className="modal-xl modal-dialog-centered">
                    <ModalHeader toggle={this.toggleHistoryModal} className="ModalHead modal-info-Headher">
                        <strong className="TextWhite">
                            <i className="fa fa-history mr-2"></i>{i18n.t('static.broadcast.history', 'Broadcast History')}
                        </strong>
                    </ModalHeader>
                    <ModalBody className="p-3">
                        {loadingHistory ? (
                            <div className="d-flex align-items-center justify-content-center" style={{ height: "300px" }}>
                                <div className="spinner-border blue" role="status"></div>
                            </div>
                        ) : historyList.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="fa fa-inbox fa-3x mb-2"></i>
                                <p>{i18n.t('static.common.noDataFound', 'No data found')}</p>
                            </div>
                        ) : (
                            <Table className="table-striped table-bordered text-center mb-0" bordered responsive size="sm">
                                <thead style={{ backgroundColor: '#e4e7ea', color: '#23282c' }}>
                                    <tr>
                                        <th style={{ width: '5%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>#</th>
                                        <th style={{ width: '12%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.common.date', 'Date')}</th>
                                        <th className="text-left" style={{ width: '32%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.subject', 'Subject')}</th>
                                        <th style={{ width: '14%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.category', 'Category')}</th>
                                        <th style={{ width: '10%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.estimatedRecipients', 'Recipients')}</th>
                                        <th style={{ width: '7%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.batches', 'Batches')}</th>
                                        <th style={{ width: '10%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.common.sentBy', 'Sent By')}</th>
                                        <th style={{ width: '10%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.common.status', 'Status')}</th>
                                        <th style={{ width: '8%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.common.action', 'Action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyList.map(item => {
                                        const catName = item.label ? getLabelText(item.label, lang) : (item.categoryName || 'Broadcast');
                                        return (
                                            <tr key={item.broadcastId}>
                                                <td className="align-middle">{item.broadcastId}</td>
                                                <td className="align-middle">{item.createdDate ? new Date(item.createdDate).toLocaleDateString() : '-'}</td>
                                                <td className="text-left align-middle font-weight-bold text-dark">{item.subject}</td>
                                                <td className="align-middle">
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '4px 10px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            borderRadius: '4px',
                                                            backgroundColor: item.categoryId === 1 ? '#e8f4fd' : (item.categoryId === 2 ? '#e2e3e5' : '#fff3cd'),
                                                            color: item.categoryId === 1 ? '#0056b3' : (item.categoryId === 2 ? '#383d41' : '#856404'),
                                                            border: `1px solid ${item.categoryId === 1 ? '#b8daff' : (item.categoryId === 2 ? '#d6d8db' : '#ffeeba')}`,
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {catName}
                                                    </span>
                                                </td>
                                                <td className="align-middle font-weight-bold text-primary">{item.totalRecipients}</td>
                                                <td className="align-middle text-muted">{item.batchCount}</td>
                                                <td className="align-middle">{item.createdBy ? item.createdBy.username : '-'}</td>
                                                <td className="align-middle">
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            padding: '4px 10px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            borderRadius: '4px',
                                                            backgroundColor: item.status === 'COMPLETED' ? '#d4edda' : (item.status === 'SAVED' || item.status === 'QUEUED' ? '#e8f4fd' : '#fff3cd'),
                                                            color: item.status === 'COMPLETED' ? '#155724' : (item.status === 'SAVED' || item.status === 'QUEUED' ? '#0056b3' : '#856404'),
                                                            border: `1px solid ${item.status === 'COMPLETED' ? '#c3e6cb' : (item.status === 'SAVED' || item.status === 'QUEUED' ? '#b8daff' : '#ffeeba')}`,
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {item.status === 'SAVED' || item.status === 'QUEUED' ? i18n.t('static.broadcast.statusQueued', 'Queued') : (item.status === 'COMPLETED' ? i18n.t('static.broadcast.statusCompleted', 'Completed') : item.status)}
                                                    </span>
                                                </td>
                                                <td className="align-middle">
                                                    <Button
                                                        color="primary"
                                                        size="sm"
                                                        style={{ padding: '3px 12px', fontSize: '12px' }}
                                                        onClick={() => this.viewHistoryDetails(item)}
                                                        title={i18n.t('static.common.view', 'View Details')}
                                                    >
                                                        <i className="fa fa-eye mr-1"></i> {i18n.t('static.common.view', 'View')}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" size="md" className="float-right mr-1 text-white" onClick={this.toggleHistoryModal}>
                            <i className="fa fa-times"></i> {i18n.t('static.common.close', 'Close')}
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* History Item View Details Modal */}
                {selectedHistoryItem && (
                    <Modal isOpen={historyViewModalOpen} toggle={this.toggleHistoryViewModal} className="modal-lg modal-dialog-centered">
                        <ModalHeader toggle={this.toggleHistoryViewModal} className="ModalHead modal-info-Headher">
                            <strong className="TextWhite">
                                <i className="fa fa-info-circle mr-2"></i>
                                {i18n.t('static.broadcast.historyDetails', 'Broadcast Details')} #{selectedHistoryItem.broadcastId}
                            </strong>
                        </ModalHeader>
                        <ModalBody className="p-3">
                            {/* Subject & Status Banner */}
                            <div className="d-flex align-items-center justify-content-between p-3 mb-3 rounded" style={{ backgroundColor: '#f0f3f5', borderLeft: '4px solid #20a8d8' }}>
                                <div>
                                    <span className="text-muted small text-uppercase font-weight-bold d-block">{i18n.t('static.broadcast.subject', 'Subject')}</span>
                                    <h5 className="mb-0 font-weight-bold text-dark mt-1">{selectedHistoryItem.subject}</h5>
                                </div>
                                <div>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            padding: '4px 12px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            borderRadius: '4px',
                                            backgroundColor: selectedHistoryItem.status === 'COMPLETED' ? '#d4edda' : (selectedHistoryItem.status === 'SAVED' || selectedHistoryItem.status === 'QUEUED' ? '#e8f4fd' : '#fff3cd'),
                                            color: selectedHistoryItem.status === 'COMPLETED' ? '#155724' : (selectedHistoryItem.status === 'SAVED' || selectedHistoryItem.status === 'QUEUED' ? '#0056b3' : '#856404'),
                                            border: `1px solid ${selectedHistoryItem.status === 'COMPLETED' ? '#c3e6cb' : (selectedHistoryItem.status === 'SAVED' || selectedHistoryItem.status === 'QUEUED' ? '#b8daff' : '#ffeeba')}`
                                        }}
                                    >
                                        {selectedHistoryItem.status === 'SAVED' || selectedHistoryItem.status === 'QUEUED' ? i18n.t('static.broadcast.statusQueued', 'Queued') : (selectedHistoryItem.status === 'COMPLETED' ? i18n.t('static.broadcast.statusCompleted', 'Completed') : selectedHistoryItem.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Metadata 4-Box Grid */}
                            <div className="row mb-3 mx-0 border rounded p-2 bg-white shadow-sm">
                                <div className="col-sm-6 col-md-3 py-1 border-right">
                                    <span className="text-muted small text-uppercase font-weight-bold d-block mb-1">{i18n.t('static.broadcast.category', 'Category')}</span>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            padding: '3px 8px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            borderRadius: '4px',
                                            backgroundColor: selectedHistoryItem.categoryId === 1 ? '#e8f4fd' : (selectedHistoryItem.categoryId === 2 ? '#e2e3e5' : '#fff3cd'),
                                            color: selectedHistoryItem.categoryId === 1 ? '#0056b3' : (selectedHistoryItem.categoryId === 2 ? '#383d41' : '#856404'),
                                            border: `1px solid ${selectedHistoryItem.categoryId === 1 ? '#b8daff' : (selectedHistoryItem.categoryId === 2 ? '#d6d8db' : '#ffeeba')}`
                                        }}
                                    >
                                        {selectedHistoryItem.label ? getLabelText(selectedHistoryItem.label, lang) : (selectedHistoryItem.categoryName || 'Broadcast')}
                                    </span>
                                </div>
                                <div className="col-sm-6 col-md-3 py-1 border-right">
                                    <span className="text-muted small text-uppercase font-weight-bold d-block mb-1">{i18n.t('static.common.date', 'Date Sent')}</span>
                                    <span className="font-weight-600 text-dark" style={{ fontSize: '13px' }}>
                                        <i className="fa fa-calendar-o text-muted mr-1"></i>
                                        {selectedHistoryItem.createdDate ? new Date(selectedHistoryItem.createdDate).toLocaleString() : '-'}
                                    </span>
                                </div>
                                <div className="col-sm-6 col-md-3 py-1 border-right">
                                    <span className="text-muted small text-uppercase font-weight-bold d-block mb-1">{i18n.t('static.broadcast.estimatedRecipients', 'Recipients')}</span>
                                    <span className="font-weight-bold text-primary" style={{ fontSize: '13px' }}>
                                        <i className="fa fa-users text-muted mr-1"></i>
                                        {selectedHistoryItem.totalRecipients}{' '}
                                        <span className="small text-muted font-weight-normal">({selectedHistoryItem.batchCount} {selectedHistoryItem.batchCount === 1 ? 'batch' : 'batches'})</span>
                                    </span>
                                </div>
                                <div className="col-sm-6 col-md-3 py-1">
                                    <span className="text-muted small text-uppercase font-weight-bold d-block mb-1">{i18n.t('static.common.sentBy', 'Sent By')}</span>
                                    <span className="font-weight-600 text-dark" style={{ fontSize: '13px' }}>
                                        <i className="fa fa-user-circle-o text-muted mr-1"></i>
                                        {selectedHistoryItem.createdBy ? selectedHistoryItem.createdBy.username : '-'}
                                    </span>
                                </div>
                            </div>

                            {/* Message Body Section */}
                            <div className="mb-1">
                                <span className="text-muted small text-uppercase font-weight-bold">
                                    <i className="fa fa-align-left mr-1"></i>
                                    {i18n.t('static.broadcast.body', 'Message Body')}
                                </span>
                            </div>
                            <div
                                className="p-3 border rounded bg-white"
                                style={{
                                    minHeight: '140px',
                                    maxHeight: '360px',
                                    overflowY: 'auto',
                                    lineHeight: '1.6',
                                    fontSize: '13.5px',
                                    color: '#212529',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedHistoryItem.bodyHtml }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button type="button" size="md" color="danger" className="mr-1 text-white" onClick={this.toggleHistoryViewModal}>
                                <i className="fa fa-times"></i> {i18n.t('static.common.close', 'Close')}
                            </Button>
                        </ModalFooter>
                    </Modal>
                )}

            </div>
        );
    }
}

export default BroadcastMessageComponent;
