'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactstrap = require('reactstrap');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactPerfectScrollbar = require('react-perfect-scrollbar');

var _reactPerfectScrollbar2 = _interopRequireDefault(_reactPerfectScrollbar);

require('react-perfect-scrollbar/dist/css/styles.css');

require('../css/scrollbar.css');

var _layout = require('./Shared/layout/layout');

var _layout2 = _interopRequireDefault(_layout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes = {
  children: _propTypes2.default.node,
  className: _propTypes2.default.string,
  navConfig: _propTypes2.default.any,
  navFunc: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.string]),
  isOpen: _propTypes2.default.bool,
  staticContext: _propTypes2.default.any,
  tag: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.string]),
  router: _propTypes2.default.any,
  props: _propTypes2.default.any
};

var defaultProps = {
  tag: 'nav',
  navConfig: {
    items: [{
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
      badge: { variant: 'info', text: 'NEW' }
    }]
  },
  isOpen: false,
  router: { RsNavLink: _reactstrap.NavLink }
};

var AppSidebarNav2 = function (_Component) {
  _inherits(AppSidebarNav2, _Component);

  function AppSidebarNav2(props) {
    _classCallCheck(this, AppSidebarNav2);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this._scrollBarRef = null;


    _this.handleClick = _this.handleClick.bind(_this);
    _this.activeRoute = _this.activeRoute.bind(_this);
    _this.hideMobile = _this.hideMobile.bind(_this);

    _this.changes = null;
    _this.state = { sidebarMinimized: false };
    return _this;
  }

  AppSidebarNav2.prototype.handleClick = function handleClick(e, item) {
    if (item.attributes && typeof item.attributes.onClick === 'function' && !this.isActiveRoute(item.url, this.props)) {
      item.attributes.onClick(e, item);
    } else {
      e.preventDefault();
    }
    e.currentTarget.parentElement.classList.toggle('open');
  };

  AppSidebarNav2.prototype.isActiveRoute = function isActiveRoute(routeName, props) {
    return props.location.pathname.indexOf(routeName) > -1;
  };

  AppSidebarNav2.prototype.activeRoute = function activeRoute(routeName, props) {
    return this.isActiveRoute(routeName, props) ? 'nav-item nav-dropdown open' : 'nav-item nav-dropdown';
  };

  AppSidebarNav2.prototype.hideMobile = function hideMobile() {
    if (document.body.classList.contains('sidebar-show')) {
      document.body.classList.toggle('sidebar-show');
    }
  };

  AppSidebarNav2.prototype.getAttribs = function getAttribs(attributes) {
    return _extends({}, attributes);
  };

  // nav list


  AppSidebarNav2.prototype.navList = function navList(items) {
    var _this2 = this;

    return items.map(function (item, index) {
      return _this2.navType(item, index);
    });
  };

  // nav type


  AppSidebarNav2.prototype.navType = function navType(item, idx) {
    return item.title ? this.navTitle(item, idx) : item.divider ? this.navDivider(item, idx) : item.label ? this.navLabel(item, idx) : item.children ? this.navDropdown(item, idx) : this.navItem(item, idx);
  };

  // nav list section title


  AppSidebarNav2.prototype.navTitle = function navTitle(title, key) {
    var classes = (0, _classnames2.default)('nav-title', title.class, title.className);
    return _react2.default.createElement(
      'li',
      { key: key, className: classes },
      this.navWrapper(title),
      ' '
    );
  };

  // simple wrapper for nav-title item


  AppSidebarNav2.prototype.navWrapper = function navWrapper(item) {
    return item.wrapper && item.wrapper.element ? _react2.default.createElement(item.wrapper.element, item.wrapper.attributes, item.name) : item.name;
  };

  // nav list divider


  AppSidebarNav2.prototype.navDivider = function navDivider(divider, key) {
    var classes = (0, _classnames2.default)('divider', divider.class, divider.className);
    return _react2.default.createElement('li', { key: key, className: classes });
  };

  // nav label with nav link


  AppSidebarNav2.prototype.navLabel = function navLabel(item, key) {
    var classes = {
      item: (0, _classnames2.default)('hidden-cn', item.class),
      link: (0, _classnames2.default)('nav-label', item.class ? item.class : ''),
      icon: (0, _classnames2.default)('nav-icon', !item.icon ? 'fa fa-circle' : item.icon, item.label.variant ? 'text-' + item.label.variant : '', item.label.class ? item.label.class : '')
    };
    return this.navLink(item, key, classes);
  };

  // nav dropdown


  AppSidebarNav2.prototype.navDropdown = function navDropdown(item, key) {
    var _this3 = this;

    var itemIcon = this.navIcon(item);
    var attributes = this.getAttribs(item.attributes);
    var classes = (0, _classnames2.default)('nav-link', 'nav-dropdown-toggle', item.class, attributes.class, attributes.className);
    delete attributes.class;
    delete attributes.className;
    var itemAttr = this.getAttribs(item.itemAttr);
    var liClasses = (0, _classnames2.default)('nav-item', 'nav-dropdown', itemAttr.class, itemAttr.className);
    delete itemAttr.class;
    delete itemAttr.className;
    var NavLink = this.props.router.NavLink || _reactstrap.NavLink;

    return _react2.default.createElement(
      'li',
      _extends({ key: key, className: (0, _classnames2.default)(liClasses, { 'open': this.isActiveRoute(item.url, this.props) }) }, itemAttr),
      _react2.default.createElement(
        NavLink,
        _extends({ activeClassName: 'open',
          className: classes,
          to: item.url || ''
        }, attributes, {
          onClick: function onClick(e) {
            return _this3.handleClick(e, item);
          } }),
        itemIcon,
        item.name,
        this.navBadge(item.badge)
      ),
      _react2.default.createElement(
        'ul',
        { className: 'nav-dropdown-items' },
        this.navList(item.children)
      )
    );
  };

  // nav item with nav link


  AppSidebarNav2.prototype.navItem = function navItem(item, key) {
    var classes = {
      item: (0, _classnames2.default)(item.class),
      link: (0, _classnames2.default)('nav-link', item.variant ? 'nav-link-' + item.variant : ''),
      icon: (0, _classnames2.default)('nav-icon', item.icon)
    };
    return this.navLink(item, key, classes);
  };

  AppSidebarNav2.prototype.navIcon = function navIcon(item) {
    var icon = item.icon;
    var iconObject = (typeof icon === 'undefined' ? 'undefined' : _typeof(icon)) === 'object' && icon !== null ? _extends({ iconClass: icon.class, iconClassName: icon.className }, icon) : { iconClass: icon };
    var iconClass = iconObject.iconClass,
        iconClassName = iconObject.iconClassName,
        innerText = iconObject.innerText,
        img = iconObject.img,
        attributes = iconObject.attributes;

    var iconAttr = _extends({}, attributes);
    delete iconAttr.class;
    delete iconAttr.className;
    delete iconAttr.img;
    var iconImg = img && img.src ? img : null;
    var iconInner = innerText || null;
    var classIcon = (0, _classnames2.default)('nav-icon', iconClass, iconClassName);
    var iconComponent = iconImg ? _react2.default.createElement('img', _extends({}, iconAttr, { className: classIcon, src: iconImg.src })) : _react2.default.createElement(
      'i',
      _extends({}, iconAttr, { className: classIcon }),
      iconInner
    );
    return iconComponent;
  };

  // nav link


  AppSidebarNav2.prototype.navLink = function navLink(item, key, classes) {
    var _this4 = this;

    var ref = _react2.default.createRef();
    var url = item.url || '';
    var itemIcon = this.navIcon(item);
    var itemBadge = this.navBadge(item.badge);
    var attributes = this.getAttribs(item.attributes);
    classes.link = (0, _classnames2.default)(classes.link, attributes.class, attributes.className);
    delete attributes.class;
    delete attributes.className;
    var itemAttr = this.getAttribs(item.itemAttr);
    classes.item = (0, _classnames2.default)(classes.item, itemAttr.class, itemAttr.className);
    delete itemAttr.class;
    delete itemAttr.className;
    var NavLink = this.props.router.NavLink || _reactstrap.NavLink;
    return _react2.default.createElement(
      _reactstrap.NavItem,
      _extends({ key: key, className: classes.item }, itemAttr),
      attributes.disabled ? _react2.default.createElement(
        _reactstrap.NavLink,
        _extends({ href: '', className: classes.link }, attributes),
        itemIcon,
        item.name,
        itemBadge
      ) : this.isExternal(url, this.props) || NavLink === _reactstrap.NavLink ? _react2.default.createElement(
        _reactstrap.NavLink,
        _extends({ href: url, className: classes.link, active: true }, attributes),
        itemIcon,
        item.name,
        itemBadge
      ) : _react2.default.createElement(
        NavLink,
        _extends({ to: url, className: classes.link, activeClassName: 'active', onClick: function onClick() {
            return _this4.hideMobile(ref);
          }, ref: ref }, attributes),
        itemIcon,
        item.name,
        itemBadge
      )
    );
  };

  // badge addon to NavItem


  AppSidebarNav2.prototype.navBadge = function navBadge(badge) {
    if (badge) {
      var classes = (0, _classnames2.default)(badge.class, badge.className);
      return _react2.default.createElement(
        _reactstrap.Badge,
        { className: classes, color: badge.variant },
        badge.text
      );
    }
    return null;
  };

  AppSidebarNav2.prototype.isExternal = function isExternal(url, props) {
    var linkType = typeof url === 'undefined' ? 'undefined' : _typeof(url);
    var link = linkType === 'string' ? url : linkType === 'object' && url.pathname ? url.pathname : linkType === 'function' && typeof url(props.location) === 'string' ? url(props.location) : linkType === 'function' && _typeof(url(props.location)) === 'object' ? url(props.location).pathname : '';
    return link.substring(0, 4) === 'http';
  };

  AppSidebarNav2.prototype.observeDomMutations = function observeDomMutations() {
    var _this5 = this;

    if (window.MutationObserver) {

      // eslint-disable-next-line
      this.changes = new MutationObserver(function (mutations) {

        var isSidebarMinimized = document.body.classList.contains('sidebar-minimized') || false;
        _this5.setState({ sidebarMinimized: isSidebarMinimized });

        _layout2.default.sidebarPSToggle(!isSidebarMinimized);
      });
      var element = document.body;
      this.changes.observe(element, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    window.addEventListener('resize', this.onResize);
  };

  AppSidebarNav2.prototype.onResize = function onResize() {
    _layout2.default.sidebarPSToggle(true);
  };

  AppSidebarNav2.prototype.componentDidMount = function componentDidMount() {
    this.observeDomMutations();
  };

  AppSidebarNav2.prototype.componentWillUnmount = function componentWillUnmount() {
    try {
      this.changes.disconnect();
      window.removeEventListener('resize', this.onResize);
    } catch (ignore) {
      // eslint-disable-next-line
      console.warn('CoreUI SidebarNav failed to disconnect from MutationObserver', ignore);
    }
  };

  AppSidebarNav2.prototype.render = function render() {
    var _this6 = this;

    var _props = this.props,
        className = _props.className,
        children = _props.children,
        navConfig = _props.navConfig,
        attributes = _objectWithoutProperties(_props, ['className', 'children', 'navConfig']);

    delete attributes.isOpen;
    delete attributes.staticContext;
    delete attributes.Tag;
    delete attributes.router;

    var navClasses = (0, _classnames2.default)(className, 'sidebar-nav');

    var options = Object.assign({}, { suppressScrollX: true, suppressScrollY: this.state.sidebarMinimized });

    // sidebar-nav root
    return _react2.default.createElement(
      _reactPerfectScrollbar2.default,
      _extends({ className: navClasses }, attributes, { options: options, ref: function ref(_ref) {
          _this6._scrollBarRef = _ref;
        } }),
      _react2.default.createElement(
        _reactstrap.Nav,
        null,
        children || this.navList(navConfig.items)
      )
    );
  };

  return AppSidebarNav2;
}(_react.Component);

AppSidebarNav2.propTypes = process.env.NODE_ENV !== "production" ? propTypes : {};
AppSidebarNav2.defaultProps = defaultProps;

exports.default = AppSidebarNav2;
module.exports = exports['default'];