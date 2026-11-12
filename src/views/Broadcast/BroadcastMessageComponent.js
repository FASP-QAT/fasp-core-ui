import React, { Component } from 'react';
import moment from 'moment';
import { MultiSelect } from 'react-multi-select-component';
import {
    Badge,
    Button,
    ButtonGroup,
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
import { DATE_FORMAT_CAP } from '../../Constants';
import getLabelText from '../../CommonComponent/getLabelText';
import { filterOptions, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';

class BroadcastMessageComponent extends Component {
    constructor(props) {
        super(props);
        this.editorRef = React.createRef();
        this.state = {
            viewMode: 'list', // 'list' (default) or 'compose'
            editingBroadcastId: null,
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
            savingDraft: false,
            loading: true,
            successMessage: '',
            errorMessage: '',
            historyList: [],
            loadingHistory: false,
            selectedHistoryItem: null,
            historyViewModalOpen: false,
            recipientsModalOpen: false,
            selectedRecipientsList: [],
            loadingRecipients: false,
            selectedRecipientsBroadcast: null,
            lang: localStorage.getItem('lang') || 'en'
        };

        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }

    componentDidMount() {
        this.loadCategories();
        this.loadRoles();
        this.loadLanguages();
        this.loadHistory();
        window.addEventListener('popstate', this.handlePopState);
    }

    componentWillUnmount() {
        window.removeEventListener('popstate', this.handlePopState);
    }

    handlePopState = () => {
        if (this.state.viewMode === 'compose') {
            this.switchToList();
        }
    };

    loadCategories = () => {
        BroadcastService.getCategories()
            .then(res => {
                const cats = res.data || [];
                this.setState({
                    categories: cats,
                    categoryId: cats.length > 0 ? cats[0].categoryId : 1,
                    loading: false
                });
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
                    });
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

    openNewMessage = () => {
        try {
            window.history.pushState({ broadcastView: 'compose' }, '');
        } catch (e) {}
        const firstCat = this.state.categories.length > 0 ? this.state.categories[0].categoryId : 1;
        this.setState({
            viewMode: 'compose',
            editingBroadcastId: null,
            categoryId: firstCat,
            selectedRoles: this.state.roleList,
            selectedLanguage: '',
            subject: '',
            messageBody: '',
            errorMessage: '',
            successMessage: ''
        }, () => {
            if (this.editorRef.current) {
                this.editorRef.current.innerHTML = '<p><br></p>';
                this.editorRef.current.setAttribute('data-empty', 'true');
            }
            this.calculateRecipientCount();
        });
    };

    switchToList = () => {
        if (this.editorRef.current) {
            this.editorRef.current.innerHTML = '<p><br></p>';
            this.editorRef.current.setAttribute('data-empty', 'true');
        }
        try {
            if (window.history.state && window.history.state.broadcastView === 'compose') {
                window.history.replaceState(null, '');
            }
        } catch (e) {}
        this.setState({
            viewMode: 'list',
            editingBroadcastId: null,
            subject: '',
            messageBody: '',
            errorMessage: ''
        }, () => {
            this.loadHistory();
        });
    };

    normalizeEditorHtml = (html) => {
        if (!html || html.trim() === '') return '<p><br></p>';
        if (!/<(p|h[1-6]|ul|ol|table|blockquote|div)[\s>]/i.test(html)) {
            const lines = html.split(/<br\s*[\/]?>/i);
            return lines.map(line => `<p>${line || '<br>'}</p>`).join('');
        }
        return html;
    };

    editDraft = (item) => {
        try {
            window.history.pushState({ broadcastView: 'compose' }, '');
        } catch (e) {}
        const matchedRoles = [];
        if (item.targetRoles && item.targetRoles.length > 0) {
            item.targetRoles.forEach(rId => {
                const found = this.state.roleList.find(r => r.value === rId);
                if (found) matchedRoles.push(found);
            });
        } else {
            matchedRoles.push(...this.state.roleList);
        }

        const selLang = (item.targetLanguages && item.targetLanguages.length > 0) ? String(item.targetLanguages[0]) : '';
        const normalizedHtml = this.normalizeEditorHtml(item.bodyHtml || '');

        this.setState({
            viewMode: 'compose',
            editingBroadcastId: item.broadcastId,
            categoryId: item.categoryId || 1,
            selectedRoles: matchedRoles,
            selectedLanguage: selLang,
            subject: item.subject || '',
            messageBody: item.bodyHtml || '',
            errorMessage: '',
            successMessage: ''
        }, () => {
            if (this.editorRef.current) {
                this.editorRef.current.innerHTML = normalizedHtml;
                if (item.bodyHtml && item.bodyHtml.trim() !== '') {
                    this.editorRef.current.removeAttribute('data-empty');
                } else {
                    this.editorRef.current.setAttribute('data-empty', 'true');
                }
            }
            this.calculateRecipientCount();
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

    handleEditorFocus = () => {
        try {
            document.execCommand('defaultParagraphSeparator', false, 'p');
        } catch (e) {}
        if (this.editorRef.current) {
            const html = this.editorRef.current.innerHTML;
            if (!html || html.trim() === '' || html === '<br>') {
                this.editorRef.current.innerHTML = '<p><br></p>';
            }
        }
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

    applyHeadingOrNormal = (type) => {
        if (this.editorRef.current) {
            this.editorRef.current.focus();
        }
        try {
            document.execCommand('defaultParagraphSeparator', false, 'p');
        } catch (e) {}

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }

        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();

        // Find enclosing block element within the editor
        let block = range.commonAncestorContainer;
        if (block && block.nodeType === 3) {
            block = block.parentNode;
        }

        while (block && block !== this.editorRef.current && !/^(P|H[1-6]|LI|DIV|BLOCKQUOTE)$/i.test(block.nodeName)) {
            block = block.parentNode;
        }

        // Inside a list item (LI): avoid formatBlock because it breaks the list structure
        const isInsideList = block && block.nodeName === 'LI';

        // Check if user selected partial inline text inside a block
        let isInline = false;
        if (!selection.isCollapsed && selectedText.trim().length > 0 && block && block !== this.editorRef.current) {
            const blockText = (block.innerText || block.textContent || '').trim();
            if (selectedText.trim() !== blockText) {
                isInline = true;
            }
        }

        if (isInsideList || isInline) {
            // Apply inline heading or normal styling to selected text
            if (type === 'heading') {
                document.execCommand('fontSize', false, '4');
                document.execCommand('bold', false, null);
            } else {
                document.execCommand('fontSize', false, '3');
                if (document.queryCommandState('bold')) {
                    document.execCommand('bold', false, null);
                }
            }
        } else {
            // Block-level heading vs paragraph
            if (type === 'heading') {
                if (block && /^H[1-6]$/i.test(block.nodeName)) {
                    document.execCommand('formatBlock', false, '<p>');
                } else {
                    document.execCommand('formatBlock', false, '<h3>');
                }
            } else {
                document.execCommand('formatBlock', false, '<p>');
                document.execCommand('fontSize', false, '3');
            }
        }

        this.handleBodyInput();
    };

    handleFormatBlock = (tag) => {
        if (this.editorRef.current) {
            this.editorRef.current.focus();
        }
        document.execCommand('formatBlock', false, tag);
        this.handleBodyInput();
    };

    clearAllFormatting = () => {
        if (this.editorRef.current) {
            this.editorRef.current.focus();
        }
        document.execCommand('removeFormat', false, null);
        document.execCommand('formatBlock', false, '<p>');
        this.handleBodyInput();
    };

    insertLinkPrompt = () => {
        const url = prompt(i18n.t('static.broadcast.enterUrl', 'Enter URL (e.g. https://www.example.com):'), 'https://');
        if (url && url.trim() !== '' && url !== 'https://') {
            this.formatText('createLink', url.trim());
        }
    };

    handleSaveDraft = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        const { subject, messageBody, selectedRoles, categoryId, roleList, selectedLanguage, editingBroadcastId } = this.state;
        if (!subject || subject.trim() === '') {
            this.setState({ errorMessage: i18n.t('static.broadcast.subjectRequired', 'Subject line is required to save a draft.') }, () => {
                hideSecondComponent();
            });
            return;
        }

        this.setState({ savingDraft: true, successMessage: '', errorMessage: '' });

        const isAllRoles = !selectedRoles || selectedRoles.length === 0 || selectedRoles.length === roleList.length;
        const targetRoles = isAllRoles ? [] : selectedRoles.map(r => r.value);
        const targetLanguages = selectedLanguage ? [parseInt(selectedLanguage)] : [];

        BroadcastService.saveDraft({
            broadcastId: editingBroadcastId || 0,
            categoryId: parseInt(categoryId),
            targetRoles: targetRoles,
            targetLanguages: targetLanguages,
            subject: subject.trim(),
            bodyHtml: messageBody || ''
        })
            .then(res => {
                try {
                    if (window.history.state && window.history.state.broadcastView === 'compose') {
                        window.history.replaceState(null, '');
                    }
                } catch (e) {}
                this.setState({
                    savingDraft: false,
                    viewMode: 'list',
                    editingBroadcastId: null,
                    successMessage: i18n.t('static.broadcast.draftSaved', 'Broadcast message saved as draft.'),
                    subject: '',
                    messageBody: ''
                }, () => {
                    hideSecondComponent();
                    this.loadHistory();
                });
            })
            .catch(err => {
                console.error('Save broadcast draft failed', err);
                const msg = err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to save broadcast draft. Please try again.';
                this.setState({
                    savingDraft: false,
                    errorMessage: msg
                }, () => {
                    hideSecondComponent();
                });
            });
    };

    handleSendClick = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        const { subject, messageBody, selectedRoles, editingBroadcastId, categoryId, roleList, selectedLanguage } = this.state;
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

        const isAllRoles = !selectedRoles || selectedRoles.length === 0 || selectedRoles.length === roleList.length;
        const targetRoles = isAllRoles ? [] : selectedRoles.map(r => r.value);
        const targetLanguages = selectedLanguage ? [parseInt(selectedLanguage)] : [];

        BroadcastService.sendBroadcast({
            broadcastId: editingBroadcastId || 0,
            categoryId: parseInt(categoryId),
            targetRoles: targetRoles,
            targetLanguages: targetLanguages,
            subject: subject.trim(),
            bodyHtml: messageBody
        })
            .then(res => {
                try {
                    if (window.history.state && window.history.state.broadcastView === 'compose') {
                        window.history.replaceState(null, '');
                    }
                } catch (e) {}
                if (this.editorRef.current) {
                    this.editorRef.current.innerHTML = '';
                    this.editorRef.current.setAttribute('data-empty', 'true');
                }
                this.setState({
                    sending: false,
                    viewMode: 'list',
                    editingBroadcastId: null,
                    successMessage: i18n.t('static.broadcast.sentSuccess', 'Broadcast message sent successfully'),
                    subject: '',
                    messageBody: ''
                }, () => {
                    hideSecondComponent();
                    this.loadHistory();
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

    openRecipientsModal = (item) => {
        this.setState({
            recipientsModalOpen: true,
            selectedRecipientsBroadcast: item,
            selectedRecipientsList: [],
            loadingRecipients: true
        });
        BroadcastService.getRecipientsByBroadcastId(item.broadcastId)
            .then(res => {
                this.setState({
                    selectedRecipientsList: res.data || [],
                    loadingRecipients: false
                });
            })
            .catch(err => {
                console.error('Failed to load recipients for broadcast', err);
                this.setState({ loadingRecipients: false });
            });
    };

    toggleRecipientsModal = () => {
        this.setState({
            recipientsModalOpen: !this.state.recipientsModalOpen,
            selectedRecipientsBroadcast: null,
            selectedRecipientsList: []
        });
    };

    cancelClicked() {
        this.switchToList();
    }

    resetClicked() {
        if (this.editorRef.current) {
            this.editorRef.current.innerHTML = '<p><br></p>';
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
            viewMode,
            editingBroadcastId,
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
            savingDraft,
            successMessage,
            errorMessage,
            historyList,
            loadingHistory,
            selectedHistoryItem,
            historyViewModalOpen,
            recipientsModalOpen,
            selectedRecipientsList,
            loadingRecipients,
            selectedRecipientsBroadcast,
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

                {viewMode === 'list' ? (
                    /* ------------------------------------------------------------- */
                    /* LIST VIEW (Main Landing Screen)                               */
                    /* ------------------------------------------------------------- */
                    <Row>
                        <Col xs="12" sm="12">
                            <Card>
                                <CardHeader className="d-flex justify-content-between align-items-center">
                                    <strong><i className="fa fa-bullhorn mr-2"></i>{i18n.t('static.broadcast.broadcastMessage', 'Broadcast Message')}</strong>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        type="button"
                                        className="btn-primary text-white"
                                        style={{
                                            whiteSpace: 'nowrap',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                            backgroundColor: '#20a8d8',
                                            borderColor: '#20a8d8',
                                            padding: '4px 12px',
                                            fontSize: '12px'
                                        }}
                                        onClick={this.openNewMessage}
                                    >
                                        <i className="fa fa-plus mr-1" style={{ color: '#ffffff' }}></i>
                                        <span style={{ color: '#ffffff', whiteSpace: 'nowrap' }}>{i18n.t('static.broadcast.newMessage', 'New Message')}</span>
                                    </Button>
                                </CardHeader>

                                <CardBody className="p-3">
                                    {loadingHistory ? (
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: "300px" }}>
                                            <div className="spinner-border blue" role="status"></div>
                                        </div>
                                    ) : historyList.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <i className="fa fa-inbox fa-3x mb-2"></i>
                                            <p>{i18n.t('static.common.noDataFound', 'No data found')}</p>
                                            <Button
                                                color="primary"
                                                size="sm"
                                                type="button"
                                                className="btn-primary text-white"
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#ffffff',
                                                    backgroundColor: '#20a8d8',
                                                    borderColor: '#20a8d8',
                                                    padding: '4px 12px',
                                                    fontSize: '12px'
                                                }}
                                                onClick={this.openNewMessage}
                                            >
                                                <i className="fa fa-plus mr-1" style={{ color: '#ffffff' }}></i>
                                                <span style={{ color: '#ffffff', whiteSpace: 'nowrap' }}>{i18n.t('static.broadcast.newMessage', 'New Message')}</span>
                                            </Button>
                                        </div>
                                    ) : (
                                        <Table className="table-striped table-bordered text-center mb-0" bordered responsive size="sm">
                                            <thead style={{ backgroundColor: '#e4e7ea', color: '#23282c' }}>
                                                <tr>
                                                    <th style={{ width: '4%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>#</th>
                                                    <th style={{ width: '10%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.common.date', 'Date')}</th>
                                                    <th style={{ width: '8%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.time', 'Time')}</th>
                                                    <th className="text-left" style={{ width: '30%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.subject', 'Subject')}</th>
                                                    <th style={{ width: '13%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.category', 'Category')}</th>
                                                    <th style={{ width: '9%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.estimatedRecipients', 'Recipients')}</th>
                                                    <th style={{ width: '6%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.broadcast.batches', 'Batches')}</th>
                                                    <th style={{ width: '10%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.common.sentBy', 'Sent By')}</th>
                                                    <th style={{ width: '8%', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.common.status', 'Status')}</th>
                                                    <th style={{ width: '8%', minWidth: '90px', whiteSpace: 'nowrap', verticalAlign: 'middle', borderBottom: '2px solid #c8ced3' }}>{i18n.t('static.common.action', 'Action')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {historyList.map(item => {
                                                    const catName = item.label ? getLabelText(item.label, lang) : (item.categoryName || 'Broadcast');
                                                    const isDraft = item.status === 'DRAFT';
                                                    const dateFormatted = item.createdDate ? moment(item.createdDate).format(DATE_FORMAT_CAP) : '-';
                                                    const timeFormatted = item.createdDate ? moment(item.createdDate).format('hh:mm A') : '-';

                                                    return (
                                                        <tr
                                                            key={item.broadcastId}
                                                            style={{ cursor: isDraft ? 'pointer' : 'default' }}
                                                            onClick={() => {
                                                                if (isDraft) {
                                                                    this.editDraft(item);
                                                                }
                                                            }}
                                                            title={isDraft ? i18n.t('static.broadcast.editDraft', 'Edit Draft') : ''}
                                                        >
                                                            <td className="align-middle">{item.broadcastId}</td>
                                                            <td className="align-middle">{dateFormatted}</td>
                                                            <td className="align-middle text-muted" style={{ fontSize: '12px' }}>{timeFormatted}</td>
                                                            <td className="text-left align-middle">
                                                                {isDraft ? (
                                                                    <span style={{ fontStyle: 'italic', color: '#0056b3', fontWeight: '600' }}>
                                                                        <i className="fa fa-file-text-o mr-1"></i>(draft) {item.subject}
                                                                    </span>
                                                                ) : (
                                                                    <span className="font-weight-bold text-dark">{item.subject}</span>
                                                                )}
                                                            </td>
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
                                                            <td className="align-middle" onClick={(e) => e.stopPropagation()}>
                                                                <Button
                                                                    color="link"
                                                                    className="p-0 font-weight-bold"
                                                                    style={{ color: '#0284c7', textDecoration: 'none', fontSize: '13px' }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        this.openRecipientsModal(item);
                                                                    }}
                                                                    title={i18n.t('static.broadcast.viewRecipientsTooltip', 'Click to view recipients list')}
                                                                >
                                                                    {item.totalRecipients}
                                                                </Button>
                                                            </td>
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
                                                                        backgroundColor: item.status === 'COMPLETED' ? '#d4edda' : (item.status === 'QUEUED' || item.status === 'SAVED' ? '#e8f4fd' : '#fff3cd'),
                                                                        color: item.status === 'COMPLETED' ? '#155724' : (item.status === 'QUEUED' || item.status === 'SAVED' ? '#0056b3' : '#856404'),
                                                                        border: `1px solid ${item.status === 'COMPLETED' ? '#c3e6cb' : (item.status === 'QUEUED' || item.status === 'SAVED' ? '#b8daff' : '#ffeeba')}`,
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {isDraft ? i18n.t('static.broadcast.draft', 'Draft') : (item.status === 'SAVED' || item.status === 'QUEUED' ? i18n.t('static.broadcast.statusQueued', 'Queued') : (item.status === 'COMPLETED' ? i18n.t('static.broadcast.statusCompleted', 'Completed') : item.status))}
                                                                </span>
                                                            </td>
                                                            <td className="align-middle text-nowrap" style={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                                                                <Button
                                                                    color="info"
                                                                    size="sm"
                                                                    className="btn-info text-white"
                                                                    style={{
                                                                        whiteSpace: 'nowrap',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: '#ffffff',
                                                                        backgroundColor: '#20a8d8',
                                                                        borderColor: '#20a8d8',
                                                                        padding: '4px 12px',
                                                                        fontSize: '12px'
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        this.viewHistoryDetails(item);
                                                                    }}
                                                                    title={i18n.t('static.common.view', 'View Details')}
                                                                >
                                                                    <i className="fa fa-eye mr-1" style={{ color: '#ffffff' }}></i>
                                                                    <span style={{ color: '#ffffff', whiteSpace: 'nowrap' }}>{i18n.t('static.common.view', 'View')}</span>
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    /* ------------------------------------------------------------- */
                    /* COMPOSE VIEW (New Message / Edit Draft)                       */
                    /* ------------------------------------------------------------- */
                    <Row>
                        <Col xs="12" sm="12">
                            <Card>
                                <CardHeader className="d-flex justify-content-between align-items-center">
                                    <strong>
                                        <i className="fa fa-pencil-square-o mr-2"></i>
                                        {editingBroadcastId ? i18n.t('static.broadcast.editDraft', 'Edit Draft') : i18n.t('static.broadcast.newMessage', 'New Message')}
                                    </strong>
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        type="button"
                                        className="btn-secondary text-white"
                                        style={{
                                            whiteSpace: 'nowrap',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                            padding: '4px 12px',
                                            fontSize: '12px'
                                        }}
                                        onClick={this.switchToList}
                                    >
                                        <i className="fa fa-arrow-left mr-1" style={{ color: '#ffffff' }}></i>
                                        <span style={{ color: '#ffffff', whiteSpace: 'nowrap' }}>{i18n.t('static.broadcast.backToList', 'Back to Messages')}</span>
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
                                                    <Label htmlFor="recipientCount">
                                                        {i18n.t('static.broadcast.estimatedRecipients', 'Estimated Recipients')}
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        id="recipientCount"
                                                        name="recipientCount"
                                                        bsSize="sm"
                                                        readOnly
                                                        className="form-control-readonly"
                                                        value={loadingCount ? i18n.t('static.common.loading', 'Loading...') : `${recipientCount} ${i18n.t('static.broadcast.activeUsers', 'Active Users')}`}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* Subject Line */}
                                        <Row>
                                            <Col xs="12">
                                                <FormGroup>
                                                    <Label htmlFor="subject">
                                                        {i18n.t('static.broadcast.subject', 'Subject')}<span className="red Reqasterisk">*</span>
                                                    </Label>
                                                    <Input
                                                        type="text"
                                                        id="subject"
                                                        name="subject"
                                                        bsSize="sm"
                                                        maxLength={255}
                                                        value={subject}
                                                        onChange={this.handleSubjectChange}
                                                        placeholder={i18n.t('static.broadcast.subjectPlaceholder', 'Enter message subject line...')}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        {/* WYSIWYG Message Body with Expanded Ribbon */}
                                        <Row>
                                            <Col xs="12">
                                                <FormGroup>
                                                    <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap">
                                                        <Label className="mb-0">
                                                            {i18n.t('static.broadcast.body', 'Message Body')}<span className="red Reqasterisk">*</span>
                                                        </Label>

                                                        {/* Rich Text Toolbar matching Ribbon */}
                                                        <div className="d-flex align-items-center flex-wrap" style={{ gap: '4px' }}>
                                                            {/* Normal Text vs Heading */}
                                                            <ButtonGroup size="sm" className="mr-1">
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border font-weight-bold"
                                                                    style={{ fontSize: '11px', padding: '3px 8px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.applyHeadingOrNormal('normal'); }}
                                                                    title={i18n.t('static.broadcast.normalText', 'Normal Text (Paragraph)')}
                                                                >
                                                                    {i18n.t('static.broadcast.normalText', 'Normal')}
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border font-weight-bold"
                                                                    style={{ fontSize: '11px', padding: '3px 8px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.applyHeadingOrNormal('heading'); }}
                                                                    title={i18n.t('static.broadcast.heading', 'Heading')}
                                                                >
                                                                    H
                                                                </Button>
                                                            </ButtonGroup>

                                                            {/* Basic Text Formatting: B, I, U, S */}
                                                            <ButtonGroup size="sm" className="mr-1">
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border font-weight-bold"
                                                                    style={{ fontSize: '12px', padding: '3px 8px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('bold'); }}
                                                                    title="Bold (Ctrl+B)"
                                                                >
                                                                    B
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border font-italic"
                                                                    style={{ fontSize: '12px', padding: '3px 8px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('italic'); }}
                                                                    title="Italic (Ctrl+I)"
                                                                >
                                                                    I
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ textDecoration: 'underline', fontSize: '12px', padding: '3px 8px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('underline'); }}
                                                                    title="Underline (Ctrl+U)"
                                                                >
                                                                    U
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ textDecoration: 'line-through', fontSize: '12px', padding: '3px 8px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('strikeThrough'); }}
                                                                    title="Strikethrough"
                                                                >
                                                                    S
                                                                </Button>
                                                            </ButtonGroup>

                                                            {/* Color & Highlight */}
                                                            <label
                                                                className="btn btn-sm btn-light border mb-0 mr-1"
                                                                style={{ cursor: 'pointer', padding: '3px 7px', fontSize: '12px', position: 'relative' }}
                                                                title={i18n.t('static.broadcast.textColor', 'Text Color')}
                                                            >
                                                                <i className="fa fa-font" style={{ color: '#d9534f' }}></i>
                                                                <input
                                                                    type="color"
                                                                    defaultValue="#000000"
                                                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                                                    onChange={(e) => this.formatText('foreColor', e.target.value)}
                                                                />
                                                            </label>

                                                            <label
                                                                className="btn btn-sm btn-light border mb-0 mr-1"
                                                                style={{ cursor: 'pointer', padding: '3px 7px', fontSize: '12px', position: 'relative' }}
                                                                title={i18n.t('static.broadcast.highlightColor', 'Highlight Color')}
                                                            >
                                                                <i className="fa fa-pencil" style={{ color: '#eab308' }}></i>
                                                                <input
                                                                    type="color"
                                                                    defaultValue="#ffff00"
                                                                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                                                                    onChange={(e) => this.formatText('hiliteColor', e.target.value)}
                                                                />
                                                            </label>

                                                            {/* Increase / Decrease Text Size */}
                                                            <ButtonGroup size="sm" className="mr-1">
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('fontSize', '4'); }}
                                                                    title="Increase Font Size"
                                                                >
                                                                    <i className="fa fa-font" style={{ fontSize: '12px' }}></i>
                                                                    <i className="fa fa-caret-up ml-1" style={{ fontSize: '9px' }}></i>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('fontSize', '2'); }}
                                                                    title="Decrease Font Size"
                                                                >
                                                                    <i className="fa fa-font" style={{ fontSize: '10px' }}></i>
                                                                    <i className="fa fa-caret-down ml-1" style={{ fontSize: '9px' }}></i>
                                                                </Button>
                                                            </ButtonGroup>

                                                            {/* Bullets, Numbering, Indent, Outdent */}
                                                            <ButtonGroup size="sm" className="mr-1">
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('insertUnorderedList'); }}
                                                                    title="Bullet List"
                                                                >
                                                                    <i className="fa fa-list-ul"></i>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('insertOrderedList'); }}
                                                                    title="Numbered List"
                                                                >
                                                                    <i className="fa fa-list-ol"></i>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('outdent'); }}
                                                                    title={i18n.t('static.broadcast.outdent', 'Outdent / Decrease Indent')}
                                                                >
                                                                    <i className="fa fa-outdent"></i>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('indent'); }}
                                                                    title={i18n.t('static.broadcast.indent', 'Indent / Sub-bullet')}
                                                                >
                                                                    <i className="fa fa-indent"></i>
                                                                </Button>
                                                            </ButtonGroup>

                                                            {/* Alignment */}
                                                            <ButtonGroup size="sm" className="mr-1">
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('justifyLeft'); }}
                                                                    title={i18n.t('static.broadcast.alignLeft', 'Align Left')}
                                                                >
                                                                    <i className="fa fa-align-left"></i>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('justifyCenter'); }}
                                                                    title={i18n.t('static.broadcast.alignCenter', 'Center')}
                                                                >
                                                                    <i className="fa fa-align-center"></i>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('justifyRight'); }}
                                                                    title={i18n.t('static.broadcast.alignRight', 'Align Right')}
                                                                >
                                                                    <i className="fa fa-align-right"></i>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.formatText('justifyFull'); }}
                                                                    title={i18n.t('static.broadcast.alignJustify', 'Justify')}
                                                                >
                                                                    <i className="fa fa-align-justify"></i>
                                                                </Button>
                                                            </ButtonGroup>

                                                            {/* Clear Formatting & Link */}
                                                            <ButtonGroup size="sm">
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.clearAllFormatting(); }}
                                                                    title={i18n.t('static.broadcast.clearFormatting', 'Clear Formatting')}
                                                                >
                                                                    <i className="fa fa-eraser"></i>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); this.insertLinkPrompt(); }}
                                                                    title="Insert Link"
                                                                >
                                                                    <i className="fa fa-link"></i>
                                                                </Button>
                                                            </ButtonGroup>
                                                        </div>
                                                    </div>

                                                    {/* Editable content area */}
                                                    <div
                                                        ref={this.editorRef}
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        onFocus={this.handleEditorFocus}
                                                        onInput={this.handleBodyInput}
                                                        data-placeholder={i18n.t('static.broadcast.bodyPlaceholder', 'Compose your announcement message here...')}
                                                        className="form-control"
                                                        style={{
                                                            minHeight: '260px',
                                                            maxHeight: '480px',
                                                            height: 'auto',
                                                            overflowY: 'auto',
                                                            lineHeight: '1.6',
                                                            fontSize: '14px',
                                                            padding: '12px 14px',
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #ced4da',
                                                            borderRadius: '0.25rem'
                                                        }}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </CardBody>

                                    <CardFooter>
                                        <FormGroup>
                                            <Button
                                                type="button"
                                                size="md"
                                                color="danger"
                                                className="float-right mr-1 text-white"
                                                onClick={this.cancelClicked}
                                            >
                                                <i className="fa fa-times"></i> {i18n.t('static.common.cancel', 'Cancel')}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="md"
                                                color="warning"
                                                className="float-right mr-1 text-white"
                                                onClick={this.resetClicked}
                                            >
                                                <i className="fa fa-refresh"></i> {i18n.t('static.common.reset', 'Reset')}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="md"
                                                color="primary"
                                                className="float-right mr-1 text-white"
                                                onClick={this.handleSaveDraft}
                                                disabled={sending || savingDraft || !subject.trim()}
                                            >
                                                <i className="fa fa-save mr-1"></i> {savingDraft ? i18n.t('static.common.loading', 'Loading...') : i18n.t('static.broadcast.saveDraft', 'Save as Draft')}
                                            </Button>
                                            <Button
                                                type="submit"
                                                color="success"
                                                className="mr-1 float-right"
                                                size="md"
                                                disabled={sending || savingDraft || recipientCount === 0 || !subject.trim() || !textOnly}
                                            >
                                                <i className="fa fa-paper-plane mr-1"></i> {sending ? i18n.t('static.common.loading') : i18n.t('static.broadcast.send', 'Send Broadcast')}
                                            </Button>
                                            &nbsp;
                                        </FormGroup>
                                    </CardFooter>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                )}

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
                                        {selectedHistoryItem.status === 'DRAFT' ? i18n.t('static.broadcast.draft', 'Draft') : (selectedHistoryItem.status === 'SAVED' || selectedHistoryItem.status === 'QUEUED' ? i18n.t('static.broadcast.statusQueued', 'Queued') : (selectedHistoryItem.status === 'COMPLETED' ? i18n.t('static.broadcast.statusCompleted', 'Completed') : selectedHistoryItem.status))}
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
                                        {selectedHistoryItem.createdDate ? moment(selectedHistoryItem.createdDate).format(`${DATE_FORMAT_CAP} hh:mm A`) : '-'}
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

                {/* Interactive Recipients List Modal */}
                {recipientsModalOpen && (
                    <Modal isOpen={recipientsModalOpen} toggle={this.toggleRecipientsModal} className="modal-lg modal-dialog-centered">
                        <ModalHeader toggle={this.toggleRecipientsModal} className="ModalHead modal-info-Headher">
                            <strong className="TextWhite">
                                <i className="fa fa-users mr-2"></i>
                                {i18n.t('static.broadcast.recipientsList', 'Recipients List')}
                                {selectedRecipientsBroadcast ? ` - ${selectedRecipientsBroadcast.subject}` : ''}
                            </strong>
                        </ModalHeader>
                        <ModalBody className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded border">
                                <div>
                                    <span className="text-muted small font-weight-bold text-uppercase">{i18n.t('static.broadcast.category', 'Category')}: </span>
                                    <span className="font-weight-bold text-dark">
                                        {selectedRecipientsBroadcast && selectedRecipientsBroadcast.label
                                            ? getLabelText(selectedRecipientsBroadcast.label, lang)
                                            : (selectedRecipientsBroadcast && selectedRecipientsBroadcast.categoryName)}
                                    </span>
                                </div>
                                <div>
                                    <Badge color="primary" pill style={{ fontSize: '13px', padding: '6px 12px' }}>
                                        {selectedRecipientsList.length} {i18n.t('static.broadcast.activeUsers', 'Active Users')}
                                    </Badge>
                                </div>
                            </div>

                            {loadingRecipients ? (
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                                    <div className="spinner-border blue" role="status"></div>
                                </div>
                            ) : selectedRecipientsList.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="fa fa-user-times fa-2x mb-2"></i>
                                    <p>{i18n.t('static.common.noDataFound', 'No recipients found')}</p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                    <Table className="table-striped table-bordered text-center mb-0" bordered size="sm">
                                        <thead style={{ backgroundColor: '#e4e7ea', color: '#23282c', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ width: '8%', verticalAlign: 'middle' }}>#</th>
                                                <th className="text-left" style={{ width: '42%', verticalAlign: 'middle' }}>{i18n.t('static.user.username', 'Username')}</th>
                                                <th className="text-left" style={{ width: '50%', verticalAlign: 'middle' }}>{i18n.t('static.user.emailId', 'Email ID')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRecipientsList.map((rec, idx) => (
                                                <tr key={rec.userId || idx}>
                                                    <td className="align-middle">{idx + 1}</td>
                                                    <td className="text-left align-middle font-weight-600 text-dark">
                                                        <i className="fa fa-user text-muted mr-2"></i>{rec.username}
                                                    </td>
                                                    <td className="text-left align-middle text-muted">
                                                        <i className="fa fa-envelope-o mr-2"></i>{rec.emailId}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button type="button" size="md" color="danger" className="mr-1 text-white" onClick={this.toggleRecipientsModal}>
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
