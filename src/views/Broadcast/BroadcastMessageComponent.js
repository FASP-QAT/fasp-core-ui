import React, { Component } from 'react';
import moment from 'moment';
import { MultiSelect } from 'react-multi-select-component';
import jexcel from 'jspreadsheet';
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
    InputGroup,
    InputGroupAddon,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row,
    Table
} from 'reactstrap';
import "../../../node_modules/jspreadsheet/dist/jspreadsheet.css";
import "../../../node_modules/jsuites/dist/jsuites.css";
import { jExcelLoadedFunction, onOpenFilter } from '../../CommonComponent/JExcelCommonFunctions.js';
import { DATE_FORMAT_CAP, JEXCEL_PAGINATION_OPTION, JEXCEL_PRO_KEY } from '../../Constants';
import BroadcastService from '../../api/BroadcastService';
import LanguageService from '../../api/LanguageService';
import UserService from '../../api/UserService';
import getLabelText from '../../CommonComponent/getLabelText';
import { filterOptions, hideSecondComponent } from '../../CommonComponent/JavascriptCommonFunctions';
import i18n from '../../i18n';
import AuthenticationServiceComponent from '../Common/AuthenticationServiceComponent';
import AuthenticationService from '../Common/AuthenticationService.js';

class BroadcastMessageComponent extends Component {
    constructor(props) {
        super(props);
        this.editorRef = React.createRef();
        this.imageInputRef = React.createRef();
        this.state = {
            viewMode: 'list', // 'list' (default) or 'compose'
            editingBroadcastId: null,
            categories: [],
            languages: [],
            roleList: [],
            categoryId: 1,
            selectedRoles: [],
            selectedLanguages: [],
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
            searchText: '',
            recipientSearchText: '',
            showTextColorMenu: false,
            showHighlightColorMenu: false,
            lang: localStorage.getItem('lang') || 'en'
        };

        this.cancelClicked = this.cancelClicked.bind(this);
        this.resetClicked = this.resetClicked.bind(this);
    }

    componentDidMount() {
        this.loadInitialData();
        window.addEventListener('popstate', this.handlePopState);
        document.addEventListener('click', this.handleDocumentClick);

        window.viewBroadcastRecipients = (id) => {
            const item = this.state.historyList.find(b => b.broadcastId === id);
            if (item) this.openRecipientsModal(item);
        };
        window.editBroadcastDraft = (id) => {
            const item = this.state.historyList.find(b => b.broadcastId === id);
            if (item) this.editDraft(item);
        };
        window.viewBroadcastDetails = (id) => {
            const item = this.state.historyList.find(b => b.broadcastId === id);
            if (item) this.viewHistoryDetails(item);
        };
    }

    componentWillUnmount() {
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleDocumentClick);
        delete window.viewBroadcastRecipients;
        delete window.editBroadcastDraft;
        delete window.viewBroadcastDetails;
        try {
            const tableDiv = document.getElementById("tableDiv");
            if (tableDiv) {
                jexcel.destroy(tableDiv, true);
            }
        } catch (e) {}
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.viewMode !== this.state.viewMode && this.state.viewMode === 'list') {
            setTimeout(() => {
                this.buildJExcel();
            }, 50);
        }
    }

    loaded = function (instance) {
        try {
            jExcelLoadedFunction(instance);
        } catch (e) {}
    }.bind(this);

    selected = function () {
        // Row click disabled per client request - button click only
    }.bind(this);

    getRolesFormatted = (targetRoles, targetRoleList) => {
        if (targetRoleList && targetRoleList.length > 0) {
            return targetRoleList.map(r => getLabelText(r.label, this.state.lang) || (r.label && r.label.label_en) || r.roleId).join(', ');
        }
        if (!targetRoles || targetRoles.length === 0) {
            return i18n.t('static.broadcast.allRoles', 'All Roles');
        }
        const { roleList } = this.state;
        if (roleList && roleList.length > 0 && targetRoles.length === roleList.length) {
            return i18n.t('static.broadcast.allRoles', 'All Roles');
        }
        const roleArr = Array.isArray(targetRoles) ? targetRoles : [targetRoles];
        return roleArr.map(rId => {
            const r = roleList ? roleList.find(role => String(role.value) === String(rId)) : null;
            return (r && r.label) ? r.label : rId;
        }).join(', ');
    };

    getLanguagesFormatted = (targetLanguages, targetLanguageList) => {
        if (targetLanguageList && targetLanguageList.length > 0) {
            return targetLanguageList.map(l => getLabelText(l.label, this.state.lang) || (l.label && l.label.label_en) || l.languageCode).join(', ');
        }
        if (!targetLanguages || targetLanguages.length === 0) {
            return i18n.t('static.broadcast.allLanguages', 'All Languages');
        }
        const { languages } = this.state;
        if (languages && languages.length > 0 && targetLanguages.length === languages.length) {
            return i18n.t('static.broadcast.allLanguages', 'All Languages');
        }
        const langArr = Array.isArray(targetLanguages) ? targetLanguages : [targetLanguages];
        return langArr.map(lId => {
            const l = languages ? languages.find(lng => String(lng.value) === String(lId)) : null;
            return l ? l.label : lId;
        }).join(', ');
    };

    buildJExcel = () => {
        const tableDiv = document.getElementById("tableDiv");
        if (!tableDiv) {
            return;
        }
        const { historyList, lang } = this.state;
        let historyArray = [];
        let count = 0;
        for (let j = 0; j < historyList.length; j++) {
            const item = historyList[j];
            const data = [];
            data[0] = item.broadcastId;
            data[1] = item.createdDate ? moment(item.createdDate).format(`${DATE_FORMAT_CAP} hh:mm A`) : '-';
            const safeSubject = (item.subject || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            const draftLabel = i18n.t('static.broadcast.draft', 'draft').toLowerCase();
            data[2] = item.status === 'DRAFT'
                ? `<span style="font-style:italic;color:#73818f;margin-right:6px;">(${draftLabel})</span>${safeSubject}`
                : `${safeSubject}`;
            data[3] = item.label ? getLabelText(item.label, lang) : (item.categoryName || 'Broadcast');
            data[4] = this.getRolesFormatted(item.targetRoles, item.targetRoleList);
            data[5] = this.getLanguagesFormatted(item.targetLanguages, item.targetLanguageList);
            data[6] = `<a href="javascript:void(0);" style="color:#20a8d8;text-decoration:underline;" onclick="window.viewBroadcastRecipients(${item.broadcastId});">${item.totalRecipients}</a>`;
            data[7] = item.batchCount;
            data[8] = item.createdBy ? item.createdBy.username : '-';

            let statusHtml = '';
            if (item.status === 'DRAFT') {
                statusHtml = `<span class="badge badge-warning text-white" style="padding:4px 8px;">${i18n.t('static.broadcast.draft', 'Draft')}</span>`;
            } else if (item.status === 'SAVED' || item.status === 'QUEUED') {
                statusHtml = `<span class="badge badge-primary text-white" style="padding:4px 8px;">${i18n.t('static.broadcast.statusQueued', 'Queued')}</span>`;
            } else if (item.status === 'COMPLETED') {
                statusHtml = `<span class="badge badge-success text-white" style="padding:4px 8px;">${i18n.t('static.broadcast.statusCompleted', 'Completed')}</span>`;
            } else {
                statusHtml = item.status;
            }
            data[9] = statusHtml;

            let actionHtml = '';
            if (item.status === 'DRAFT') {
                actionHtml = `<button type="button" class="btn btn-warning btn-sm text-white" style="padding:2px 10px;white-space:nowrap;" onclick="window.editBroadcastDraft(${item.broadcastId});"><i class="fa fa-pencil mr-1 text-white"></i><span style="color:#ffffff;">${i18n.t('static.broadcast.editDraft', 'Edit Draft')}</span></button>`;
            } else {
                actionHtml = `<button type="button" class="btn btn-info btn-sm text-white" style="padding:2px 10px;white-space:nowrap;" onclick="window.viewBroadcastDetails(${item.broadcastId});"><i class="fa fa-eye mr-1 text-white"></i><span style="color:#ffffff;">${i18n.t('static.common.view', 'View')}</span></button>`;
            }
            data[10] = actionHtml;
            const plainBody = (item.bodyHtml || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
            data[11] = plainBody;

            historyArray[count] = data;
            count++;
        }

        try {
            this.el = jexcel(tableDiv, '');
            jexcel.destroy(tableDiv, true);
        } catch (e) {}

        const options = {
            data: historyArray,
            columnDrag: false,
            colWidths: [0, 150, 420, 130, 130, 110, 85, 65, 95, 85, 95, 0],
            colHeaderClasses: ["Reqasterisk"],
            columns: [
                { title: 'broadcastId', type: 'hidden' },
                { title: i18n.t('static.broadcast.messageQueuedTime', 'Message queued time'), type: 'text', width: 150 },
                { title: i18n.t('static.broadcast.subject', 'Subject'), type: 'html', width: 420 },
                { title: i18n.t('static.broadcast.category', 'Category'), type: 'text', width: 130 },
                { title: i18n.t('static.broadcast.targetRoles', 'Roles'), type: 'text', width: 130 },
                { title: i18n.t('static.broadcast.targetLanguages', 'Languages'), type: 'text', width: 110 },
                { title: i18n.t('static.broadcast.recipients', 'Recipients'), type: 'html', width: 85 },
                { title: i18n.t('static.broadcast.batches', 'Batches'), type: 'text', width: 65 },
                { title: i18n.t('static.common.sentBy', 'Sent By'), type: 'text', width: 95 },
                { title: i18n.t('static.common.status', 'Status'), type: 'html', width: 85 },
                { title: i18n.t('static.common.action', 'Action'), type: 'html', width: 95 },
                { title: 'body', type: 'hidden' }
            ],
            editable: false,
            onload: this.loaded,
            pagination: localStorage.getItem("sesRecordCount"),
            search: true,
            columnSorting: true,
            wordWrap: true,
            allowInsertColumn: false,
            allowManualInsertColumn: false,
            allowDeleteRow: false,
            copyCompatibility: true,
            allowExport: false,
            paginationOptions: JEXCEL_PAGINATION_OPTION,
            position: 'top',
            filters: true,
            license: JEXCEL_PRO_KEY,
            onopenfilter: onOpenFilter,
            allowRenameColumn: false,
            contextMenu: function () { return false; }
        };
        const tableEl = jexcel(tableDiv, options);
        this.el = tableEl;
    };

    handleDocumentClick = (e) => {
        if (this.state.showTextColorMenu || this.state.showHighlightColorMenu) {
            if (!e.target.closest || !e.target.closest('.color-picker-dropdown')) {
                this.setState({ showTextColorMenu: false, showHighlightColorMenu: false });
            }
        }
    };

    handlePopState = () => {
        if (this.state.viewMode === 'compose') {
            this.switchToList();
        }
    };

    loadInitialData = () => {
        this.setState({ loading: true, loadingHistory: true });
        Promise.all([
            BroadcastService.getCategories(),
            UserService.getRoleList(),
            LanguageService.getLanguageListActive()
        ])
            .then(([catRes, roleRes, langRes]) => {
                const cats = catRes.data || [];
                let roles = [];
                if (roleRes.status === 200 && roleRes.data) {
                    roles = roleRes.data.map(r => ({
                        value: r.roleId,
                        label: getLabelText(r.label, this.state.lang) || (r.label && r.label.label_en) || r.roleId
                    }));
                    roles.sort((a, b) => {
                        const itemA = a.label ? a.label.toUpperCase() : '';
                        const itemB = b.label ? b.label.toUpperCase() : '';
                        return itemA.localeCompare(itemB);
                    });
                }
                let langs = [];
                if (langRes.status === 200 && langRes.data) {
                    langs = langRes.data.map(l => ({
                        value: l.languageId,
                        label: getLabelText(l.label, this.state.lang) || (l.label && l.label.label_en) || l.languageCode
                    }));
                    langs.sort((a, b) => {
                        const itemA = a.label ? a.label.toUpperCase() : '';
                        const itemB = b.label ? b.label.toUpperCase() : '';
                        return itemA.localeCompare(itemB);
                    });
                }
                this.setState({
                    categories: cats,
                    categoryId: cats.length > 0 ? cats[0].categoryId : 1,
                    roleList: roles,
                    selectedRoles: roles,
                    languages: langs,
                    selectedLanguages: langs,
                    loading: false
                }, () => {
                    this.loadHistory();
                });
            })
            .catch(err => {
                console.error('Failed to load initial metadata', err);
                this.setState({ loading: false });
                this.loadHistory();
            });
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
                        label: getLabelText(r.label, this.state.lang) || (r.label && r.label.label_en) || r.roleId
                    }));
                    roles.sort((a, b) => {
                        const itemA = a.label ? a.label.toUpperCase() : '';
                        const itemB = b.label ? b.label.toUpperCase() : '';
                        return itemA.localeCompare(itemB);
                    });
                    this.setState({
                        roleList: roles,
                        selectedRoles: roles
                    }, () => {
                        if (this.state.viewMode === 'list' && this.state.historyList.length > 0) {
                            this.buildJExcel();
                        }
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
                        value: l.languageId,
                        label: getLabelText(l.label, this.state.lang) || (l.label && l.label.label_en) || l.languageCode
                    }));
                    list.sort((a, b) => {
                        const itemA = a.label ? a.label.toUpperCase() : '';
                        const itemB = b.label ? b.label.toUpperCase() : '';
                        return itemA.localeCompare(itemB);
                    });
                    this.setState({
                        languages: list,
                        selectedLanguages: list
                    }, () => {
                        if (this.state.viewMode === 'list' && this.state.historyList.length > 0) {
                            this.buildJExcel();
                        }
                    });
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
                }, () => {
                    if (this.state.viewMode === 'list') {
                        this.buildJExcel();
                    }
                });
            })
            .catch(err => {
                console.error('Failed to load broadcast history', err);
                this.setState({ loadingHistory: false });
            });
    };

    calculateRecipientCount = () => {
        const { categoryId, selectedRoles, roleList, selectedLanguages, languages } = this.state;
        if (!selectedRoles || selectedRoles.length === 0 || !selectedLanguages || selectedLanguages.length === 0) {
            this.setState({ recipientCount: 0, loadingCount: false });
            return;
        }
        const isAllRoles = selectedRoles.length === roleList.length;
        const targetRoles = isAllRoles ? [] : selectedRoles.map(r => r.value);
        const isAllLanguages = selectedLanguages.length === languages.length;
        const targetLanguages = isAllLanguages ? [] : selectedLanguages.map(l => l.value);

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

    previewCurrentRecipients = () => {
        const { categoryId, selectedRoles, roleList, selectedLanguages, languages, subject } = this.state;
        const isAllRoles = !selectedRoles || selectedRoles.length === 0 || selectedRoles.length === roleList.length;
        const targetRoles = isAllRoles ? [] : selectedRoles.map(r => r.value);
        const isAllLanguages = !selectedLanguages || selectedLanguages.length === 0 || selectedLanguages.length === languages.length;
        const targetLanguages = isAllLanguages ? [] : selectedLanguages.map(l => l.value);

        this.setState({
            recipientsModalOpen: true,
            selectedRecipientsBroadcast: {
                subject: subject || i18n.t('static.broadcast.previewRecipientsTitle', 'Target Recipients Preview'),
                categoryId: parseInt(categoryId),
                categoryName: ''
            },
            selectedRecipientsList: [],
            recipientSearchText: '',
            loadingRecipients: true
        });

        BroadcastService.previewRecipients({
            categoryId: parseInt(categoryId),
            targetRoles: targetRoles,
            targetLanguages: targetLanguages
        })
            .then(res => {
                this.setState({
                    selectedRecipientsList: res.data || [],
                    loadingRecipients: false
                });
            })
            .catch(err => {
                console.error('Failed to preview recipients', err);
                this.setState({ loadingRecipients: false });
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
            selectedLanguages: this.state.languages,
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

        const matchedLanguages = [];
        if (item.targetLanguages && item.targetLanguages.length > 0) {
            item.targetLanguages.forEach(lId => {
                const found = this.state.languages.find(l => l.value === lId);
                if (found) matchedLanguages.push(found);
            });
        } else {
            matchedLanguages.push(...this.state.languages);
        }

        const normalizedHtml = this.normalizeEditorHtml(item.bodyHtml || '');

        this.setState({
            viewMode: 'compose',
            editingBroadcastId: item.broadcastId,
            categoryId: item.categoryId || 1,
            selectedRoles: matchedRoles,
            selectedLanguages: matchedLanguages,
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

    handleLanguageChange = (selected) => {
        this.setState({ selectedLanguages: selected || [] }, this.calculateRecipientCount);
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
            const hasImg = this.editorRef.current.querySelector('img') !== null;
            const isEmpty = textOnly.trim() === '' && !hasImg;
            if (isEmpty) {
                this.editorRef.current.setAttribute('data-empty', 'true');
                this.setState({ messageBody: '' });
            } else {
                this.editorRef.current.removeAttribute('data-empty');
                this.setState({ messageBody: this.editorRef.current.innerHTML });
            }
        }
    };

    handleEditorPaste = (e) => {
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;
        const items = clipboardData.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64Data = event.target.result;
                        document.execCommand('insertHTML', false, `<p><img src="${base64Data}" style="max-width: 100%; height: auto; border: 1px solid #ddd; margin: 8px 0; border-radius: 4px;" /></p>`);
                        this.handleBodyInput();
                    };
                    reader.readAsDataURL(file);
                    return;
                }
            }
        }
    };

    handleImageFileSelect = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Data = event.target.result;
                if (this.editorRef.current) {
                    this.editorRef.current.focus();
                }
                document.execCommand('insertHTML', false, `<p><img src="${base64Data}" style="max-width: 100%; height: auto; border: 1px solid #ddd; margin: 8px 0; border-radius: 4px;" /></p>`);
                this.handleBodyInput();
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
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
                document.execCommand('removeFormat', false, null);
            }
        } else {
            // Block-level heading vs paragraph
            if (type === 'heading') {
                if (block && /^H[1-6]$/i.test(block.nodeName)) {
                    const p = document.createElement('p');
                    p.innerHTML = block.innerHTML;
                    block.parentNode.replaceChild(p, block);
                } else {
                    document.execCommand('formatBlock', false, '<h3>');
                }
            } else {
                if (block && /^H[1-6]$/i.test(block.nodeName)) {
                    const p = document.createElement('p');
                    p.innerHTML = block.innerHTML;
                    block.parentNode.replaceChild(p, block);
                    const newRange = document.createRange();
                    newRange.selectNodeContents(p);
                    newRange.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    document.execCommand('formatBlock', false, '<p>');
                }
                document.execCommand('fontSize', false, '3');
                if (document.queryCommandState('bold')) {
                    document.execCommand('bold', false, null);
                }
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
        const { subject, messageBody, selectedRoles, categoryId, roleList, selectedLanguages, languages, editingBroadcastId } = this.state;
        if (!subject || subject.trim() === '') {
            this.setState({ errorMessage: i18n.t('static.broadcast.subjectRequired', 'Subject line is required to save a draft.') }, () => {
                hideSecondComponent();
            });
            return;
        }

        this.setState({ savingDraft: true, successMessage: '', errorMessage: '' });

        const isAllRoles = !selectedRoles || selectedRoles.length === 0 || selectedRoles.length === roleList.length;
        const targetRoles = isAllRoles ? [] : selectedRoles.map(r => r.value);
        const isAllLanguages = !selectedLanguages || selectedLanguages.length === 0 || selectedLanguages.length === languages.length;
        const targetLanguages = isAllLanguages ? [] : selectedLanguages.map(l => l.value);

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
        const { subject, messageBody, selectedRoles, editingBroadcastId, categoryId, roleList, selectedLanguages, languages } = this.state;
        if (!selectedRoles || selectedRoles.length === 0) {
            this.setState({ errorMessage: i18n.t('static.broadcast.roleRequired', 'Please select at least one role in Target Audience.') }, () => {
                hideSecondComponent();
            });
            return;
        }
        if (!selectedLanguages || selectedLanguages.length === 0) {
            this.setState({ errorMessage: i18n.t('static.broadcast.languageRequired', 'Please select at least one language.') }, () => {
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
        const hasImg = this.editorRef.current && this.editorRef.current.querySelector('img') !== null;
        const textOnly = messageBody ? messageBody.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim() : '';
        if (!textOnly && !hasImg) {
            this.setState({ errorMessage: i18n.t('static.broadcast.bodyRequired', 'Message body cannot be empty.') }, () => {
                hideSecondComponent();
            });
            return;
        }

        this.setState({ sending: true, successMessage: '', errorMessage: '' });

        const isAllRoles = selectedRoles.length === roleList.length;
        const targetRoles = isAllRoles ? [] : selectedRoles.map(r => r.value);
        const isAllLanguages = selectedLanguages.length === languages.length;
        const targetLanguages = isAllLanguages ? [] : selectedLanguages.map(l => l.value);

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
                    successMessage: i18n.t('static.broadcast.queuedSuccess', 'Successfully queued for delivery'),
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
            recipientSearchText: '',
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
            selectedRecipientsList: [],
            recipientSearchText: ''
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
            selectedLanguages: this.state.languages,
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
            selectedLanguages,
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
            searchText,
            recipientSearchText,
            showTextColorMenu,
            showHighlightColorMenu,
            lang
        } = this.state;

        const filteredRecipients = selectedRecipientsList.filter(rec => {
            if (!recipientSearchText || recipientSearchText.trim() === '') return true;
            const q = recipientSearchText.toLowerCase();
            return (rec.username && rec.username.toLowerCase().includes(q)) ||
                   (rec.emailId && rec.emailId.toLowerCase().includes(q));
        });

        const selectedCategory = categories.find(c => c.categoryId === parseInt(categoryId));
        const selectedCategoryLabel = selectedCategory
            ? (selectedCategory.label ? getLabelText(selectedCategory.label, lang) : selectedCategory.categoryName)
            : '';

        const textOnly = messageBody ? messageBody.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim() : '';

        jexcel.setDictionary({
            Show: " ",
            entries: " ",
        });

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

                                <CardBody className="pt-md-1 pb-md-1 table-responsive">
                                    <style>{`
                                        #tableDiv .jss {
                                            font-family: Arial, Helvetica, sans-serif !important;
                                            font-size: 0.775rem !important;
                                            min-width: 1350px !important;
                                        }
                                        #tableDiv .jss>tbody>tr>td {
                                            font-family: Arial, Helvetica, sans-serif !important;
                                            font-size: 0.775rem !important;
                                        }
                                        #tableDiv .jss>thead>tr>td {
                                            font-family: Arial, Helvetica, sans-serif !important;
                                        }
                                        #tableDiv .jss_search {
                                            font-family: Arial, Helvetica, sans-serif !important;
                                        }
                                    `}</style>
                                    <div className='consumptionDataEntryTable'>
                                        <div id="tableDiv" className="jexcelremoveReadonlybackground" style={{ display: loadingHistory ? "none" : "block" }}>
                                        </div>
                                    </div>
                                    <div style={{ display: loadingHistory ? "block" : "none" }}>
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: "300px" }}>
                                            <div className="align-items-center text-center">
                                                <div><h4><strong>{i18n.t('static.common.loading', 'Loading...')}</strong></h4></div>
                                                <div className="spinner-border blue ml-4" role="status"></div>
                                            </div>
                                        </div>
                                    </div>
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
                                                    <Label htmlFor="targetLanguages">
                                                        {i18n.t('static.broadcast.preferredLanguage', 'Preferred Language')}
                                                    </Label>
                                                    <MultiSelect
                                                        bsSize="sm"
                                                        name="targetLanguages"
                                                        id="targetLanguages"
                                                        value={selectedLanguages}
                                                        onChange={this.handleLanguageChange}
                                                        options={languages}
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
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <Label htmlFor="recipientCount" className="mb-0">
                                                            {i18n.t('static.broadcast.recipients', 'Recipients')}
                                                        </Label>
                                                        {recipientCount > 0 && (
                                                            <Button
                                                                color="link"
                                                                size="sm"
                                                                className="p-0 text-primary"
                                                                style={{ fontSize: '11px', textDecoration: 'underline' }}
                                                                type="button"
                                                                onClick={this.previewCurrentRecipients}
                                                                title={i18n.t('static.broadcast.previewRecipients', 'Preview Recipients')}
                                                            >
                                                                <i className="fa fa-users mr-1"></i>{i18n.t('static.broadcast.previewRecipients', 'Preview')}
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        id="recipientCount"
                                                        name="recipientCount"
                                                        bsSize="sm"
                                                        readOnly
                                                        className="form-control-readonly mt-1"
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

                                                            {/* Text Color with Presets */}
                                                            <div className="btn-group mr-1 color-picker-dropdown" style={{ position: 'relative' }}>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    size="sm"
                                                                    className="border"
                                                                    style={{ padding: '3px 7px', fontSize: '12px' }}
                                                                    onClick={() => this.setState({ showTextColorMenu: !showTextColorMenu, showHighlightColorMenu: false })}
                                                                    title={i18n.t('static.broadcast.textColor', 'Text Color')}
                                                                >
                                                                    <i className="fa fa-font" style={{ color: '#d9534f' }}></i>
                                                                    <i className="fa fa-caret-down ml-1 text-muted" style={{ fontSize: '9px' }}></i>
                                                                </Button>
                                                                {showTextColorMenu && (
                                                                    <div
                                                                        className="shadow-sm border rounded p-2 bg-white"
                                                                        style={{
                                                                            position: 'absolute',
                                                                            top: '100%',
                                                                            left: 0,
                                                                            zIndex: 1050,
                                                                            minWidth: '150px'
                                                                        }}
                                                                    >
                                                                        <div className="small font-weight-bold mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                                            {i18n.t('static.broadcast.presetColors', 'Preset Colors')}
                                                                        </div>
                                                                        <div className="d-flex flex-wrap mb-2" style={{ width: '130px', gap: '4px' }}>
                                                                            {['#000000', '#495057', '#6c757d', '#0056b3', '#28a745', '#d9534f', '#f0ad4e', '#6f42c1', '#17a2b8', '#e83e8c'].map(col => (
                                                                                <div
                                                                                    key={col}
                                                                                    onMouseDown={(e) => {
                                                                                        e.preventDefault();
                                                                                        this.formatText('foreColor', col);
                                                                                        this.setState({ showTextColorMenu: false });
                                                                                    }}
                                                                                    style={{
                                                                                        backgroundColor: col,
                                                                                        width: '20px',
                                                                                        height: '20px',
                                                                                        borderRadius: '3px',
                                                                                        cursor: 'pointer',
                                                                                        border: '1px solid #ced4da'
                                                                                    }}
                                                                                    title={col}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                        <div className="d-flex align-items-center pt-1 border-top">
                                                                            <span className="small text-muted mr-2" style={{ fontSize: '11px' }}>{i18n.t('static.broadcast.customColor', 'Custom')}:</span>
                                                                            <input
                                                                                type="color"
                                                                                defaultValue="#000000"
                                                                                style={{ width: '28px', height: '22px', cursor: 'pointer', padding: 0, border: 'none' }}
                                                                                onChange={(e) => {
                                                                                    this.formatText('foreColor', e.target.value);
                                                                                    this.setState({ showTextColorMenu: false });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Highlight Color with Presets */}
                                                            <div className="btn-group mr-1 color-picker-dropdown" style={{ position: 'relative' }}>
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    size="sm"
                                                                    className="border"
                                                                    style={{ padding: '3px 7px', fontSize: '12px' }}
                                                                    onClick={() => this.setState({ showHighlightColorMenu: !showHighlightColorMenu, showTextColorMenu: false })}
                                                                    title={i18n.t('static.broadcast.highlightColor', 'Highlight Color')}
                                                                >
                                                                    <i className="fa fa-pencil" style={{ color: '#eab308' }}></i>
                                                                    <i className="fa fa-caret-down ml-1 text-muted" style={{ fontSize: '9px' }}></i>
                                                                </Button>
                                                                {showHighlightColorMenu && (
                                                                    <div
                                                                        className="shadow-sm border rounded p-2 bg-white"
                                                                        style={{
                                                                            position: 'absolute',
                                                                            top: '100%',
                                                                            left: 0,
                                                                            zIndex: 1050,
                                                                            minWidth: '150px'
                                                                        }}
                                                                    >
                                                                        <div className="small font-weight-bold mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                                            {i18n.t('static.broadcast.presetColors', 'Preset Colors')}
                                                                        </div>
                                                                        <div className="d-flex flex-wrap mb-2" style={{ width: '130px', gap: '4px' }}>
                                                                            {['#ffffff', '#fff3cd', '#d4edda', '#d1ecf1', '#ffeeba', '#f8d7da', '#e2e3e5', '#e0cffc'].map(col => (
                                                                                <div
                                                                                    key={col}
                                                                                    onMouseDown={(e) => {
                                                                                        e.preventDefault();
                                                                                        this.formatText('hiliteColor', col);
                                                                                        this.setState({ showHighlightColorMenu: false });
                                                                                    }}
                                                                                    style={{
                                                                                        backgroundColor: col,
                                                                                        width: '20px',
                                                                                        height: '20px',
                                                                                        borderRadius: '3px',
                                                                                        cursor: 'pointer',
                                                                                        border: '1px solid #ced4da'
                                                                                    }}
                                                                                    title={col}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                        <div className="d-flex align-items-center pt-1 border-top">
                                                                            <span className="small text-muted mr-2" style={{ fontSize: '11px' }}>{i18n.t('static.broadcast.customColor', 'Custom')}:</span>
                                                                            <input
                                                                                type="color"
                                                                                defaultValue="#ffff00"
                                                                                style={{ width: '28px', height: '22px', cursor: 'pointer', padding: 0, border: 'none' }}
                                                                                onChange={(e) => {
                                                                                    this.formatText('hiliteColor', e.target.value);
                                                                                    this.setState({ showHighlightColorMenu: false });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

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
                                                                <Button
                                                                    type="button"
                                                                    color="light"
                                                                    className="border"
                                                                    style={{ fontSize: '11px', padding: '3px 7px' }}
                                                                    onMouseDown={(e) => { e.preventDefault(); if (this.imageInputRef.current) this.imageInputRef.current.click(); }}
                                                                    title={i18n.t('static.broadcast.insertImage', 'Attach / Insert Image')}
                                                                >
                                                                    <i className="fa fa-picture-o"></i>
                                                                </Button>
                                                            </ButtonGroup>
                                                            <input
                                                                type="file"
                                                                ref={this.imageInputRef}
                                                                accept="image/*"
                                                                style={{ display: 'none' }}
                                                                onChange={this.handleImageFileSelect}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Editable content area */}
                                                    <div
                                                        ref={this.editorRef}
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        onFocus={this.handleEditorFocus}
                                                        onInput={this.handleBodyInput}
                                                        onPaste={this.handleEditorPaste}
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
                        <ModalBody className="p-3" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            <Table bordered size="sm" className="mb-3" style={{ fontSize: '0.775rem' }}>
                                <tbody>
                                    <tr>
                                        <th style={{ width: '18%', backgroundColor: '#f0f3f5', verticalAlign: 'middle' }}>{i18n.t('static.broadcast.subject', 'Subject')}</th>
                                        <td colSpan="3" style={{ verticalAlign: 'middle' }}><strong>{selectedHistoryItem.subject}</strong></td>
                                    </tr>
                                    <tr>
                                        <th style={{ width: '18%', backgroundColor: '#f0f3f5', verticalAlign: 'middle' }}>{i18n.t('static.broadcast.category', 'Category')}</th>
                                        <td style={{ width: '32%', verticalAlign: 'middle' }}>{selectedHistoryItem.label ? getLabelText(selectedHistoryItem.label, lang) : (selectedHistoryItem.categoryName || 'Broadcast')}</td>
                                        <th style={{ width: '18%', backgroundColor: '#f0f3f5', verticalAlign: 'middle' }}>{i18n.t('static.common.status', 'Status')}</th>
                                        <td style={{ width: '32%', verticalAlign: 'middle' }}>
                                            <span className={`badge ${selectedHistoryItem.status === 'COMPLETED' ? 'badge-success' : (selectedHistoryItem.status === 'DRAFT' ? 'badge-warning' : 'badge-primary')} text-white`} style={{ padding: '4px 8px' }}>
                                                {selectedHistoryItem.status === 'DRAFT' ? i18n.t('static.broadcast.draft', 'Draft') : (selectedHistoryItem.status === 'SAVED' || selectedHistoryItem.status === 'QUEUED' ? i18n.t('static.broadcast.statusQueued', 'Queued') : (selectedHistoryItem.status === 'COMPLETED' ? i18n.t('static.broadcast.statusCompleted', 'Completed') : selectedHistoryItem.status))}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th style={{ backgroundColor: '#f0f3f5', verticalAlign: 'middle' }}>{i18n.t('static.broadcast.messageQueuedTime', 'Message queued time')}</th>
                                        <td style={{ verticalAlign: 'middle' }}>{selectedHistoryItem.createdDate ? moment(selectedHistoryItem.createdDate).format(`${DATE_FORMAT_CAP} hh:mm A`) : '-'}</td>
                                        <th style={{ backgroundColor: '#f0f3f5', verticalAlign: 'middle' }}>{i18n.t('static.common.sentBy', 'Sent By')}</th>
                                        <td style={{ verticalAlign: 'middle' }}>{selectedHistoryItem.createdBy ? selectedHistoryItem.createdBy.username : '-'}</td>
                                    </tr>
                                    <tr>
                                        <th style={{ backgroundColor: '#f0f3f5', verticalAlign: 'middle' }}>{i18n.t('static.broadcast.targetRoles', 'Roles')}</th>
                                        <td style={{ verticalAlign: 'middle' }}>{this.getRolesFormatted(selectedHistoryItem.targetRoles, selectedHistoryItem.targetRoleList)}</td>
                                        <th style={{ backgroundColor: '#f0f3f5', verticalAlign: 'middle' }}>{i18n.t('static.broadcast.targetLanguages', 'Languages')}</th>
                                        <td style={{ verticalAlign: 'middle' }}>{this.getLanguagesFormatted(selectedHistoryItem.targetLanguages, selectedHistoryItem.targetLanguageList)}</td>
                                    </tr>
                                    <tr>
                                        <th style={{ backgroundColor: '#f0f3f5', verticalAlign: 'middle' }}>{i18n.t('static.broadcast.recipients', 'Recipients')}</th>
                                        <td colSpan="3" style={{ verticalAlign: 'middle' }}>
                                            <span className="text-primary font-weight-bold">{selectedHistoryItem.totalRecipients}</span>
                                            <span className="text-muted ml-2">({selectedHistoryItem.batchCount} {selectedHistoryItem.batchCount === 1 ? 'batch' : 'batches'})</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <FormGroup className="mb-0">
                                <Label><strong>{i18n.t('static.broadcast.body', 'Message Body')}</strong></Label>
                                <div
                                    className="p-3 border rounded bg-white"
                                    style={{
                                        minHeight: '140px',
                                        maxHeight: '360px',
                                        overflowY: 'auto',
                                        lineHeight: '1.5',
                                        fontSize: '0.775rem'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: selectedHistoryItem.bodyHtml }}
                                />
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            {selectedHistoryItem.status === 'DRAFT' && (
                                <Button
                                    type="button"
                                    size="md"
                                    color="warning"
                                    className="mr-1 text-white font-weight-bold"
                                    style={{ backgroundColor: '#f8b115', borderColor: '#f8b115' }}
                                    onClick={() => {
                                        const itemToEdit = selectedHistoryItem;
                                        this.toggleHistoryViewModal();
                                        this.editDraft(itemToEdit);
                                    }}
                                >
                                    <i className="fa fa-pencil mr-1"></i> {i18n.t('static.broadcast.editDraft', 'Edit Draft')}
                                </Button>
                            )}
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
                        <ModalBody className="p-3" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            {AuthenticationService.getLoggedInUserRoleBusinessFunctionArray().includes('ROLE_BF_BROADCAST_BOUNCEBACK_INFO') && (
                                <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center" role="alert" style={{ fontSize: '0.825rem' }}>
                                    <i className="fa fa-info-circle mr-2" style={{ fontSize: '1.2rem', minWidth: '20px' }}></i>
                                    <span>{i18n.t('static.broadcast.bouncebackNotice', 'Bouncebacks are not tracked in QAT. Please check the noreply@quantificationanalytics.org email inbox for bounceback emails where delivery failed and update users accordingly.')}</span>
                                </div>
                            )}
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

                            {selectedRecipientsList.length > 0 && (
                                <InputGroup size="sm" className="mb-3">
                                    <Input
                                        type="text"
                                        placeholder={i18n.t('static.common.search', 'Search') + '...'}
                                        value={recipientSearchText}
                                        onChange={(e) => this.setState({ recipientSearchText: e.target.value })}
                                    />
                                    {recipientSearchText && (
                                        <InputGroupAddon addonType="append">
                                            <Button color="secondary" size="sm" onClick={() => this.setState({ recipientSearchText: '' })}>
                                                <i className="fa fa-times"></i>
                                            </Button>
                                        </InputGroupAddon>
                                    )}
                                </InputGroup>
                            )}

                            {loadingRecipients ? (
                                <div className="d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                                    <div className="spinner-border blue" role="status"></div>
                                </div>
                            ) : selectedRecipientsList.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="fa fa-user-times fa-2x mb-2"></i>
                                    <p>{i18n.t('static.common.noDataFound', 'No recipients found')}</p>
                                </div>
                            ) : filteredRecipients.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="fa fa-search fa-2x mb-2"></i>
                                    <p>{i18n.t('static.common.noDataFound', 'No matching recipients found')}</p>
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
                                            {filteredRecipients.map((rec, idx) => (
                                                <tr key={rec.userId || idx}>
                                                    <td className="align-middle">{idx + 1}</td>
                                                    <td className="text-left align-middle text-dark">
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
