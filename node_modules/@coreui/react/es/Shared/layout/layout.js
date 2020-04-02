var _class, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LayoutHelper = (_temp = _class = function () {
  function LayoutHelper() {
    _classCallCheck(this, LayoutHelper);
  }

  LayoutHelper.sidebarToggle = function sidebarToggle(toggle) {
    var minimize = arguments.length ? toggle : !this.elClassList.contains('sidebar-minimized');
    this.sidebarMinimize(minimize);
    this.brandMinimize(minimize);
    this.sidebarPSToggle(!minimize); /*remove PS on sidebar minimized*/
  };

  LayoutHelper.sidebarMinimize = function sidebarMinimize(force) {
    return this.toggleClass('sidebar-minimized', force);
  };

  LayoutHelper.brandMinimize = function brandMinimize(force) {
    this.toggleClass('brand-minimized', force);
  };

  //  sidebar perfect scrollbar ugly hack


  LayoutHelper.sidebarPSToggle = function sidebarPSToggle(toggle) {

    if (this.isOnMobile()) {
      toggle = true;
    } else {
      var isSidebarMinimized = document.body.classList.contains('sidebar-minimized') || false;
      toggle = !isSidebarMinimized;
    }

    var ps = { y: { rail: {}, thumb: {} } };
    var isRtl = getComputedStyle(document.documentElement).direction === 'rtl';
    var sidebar = document.querySelector('.sidebar-nav');
    ps.y.rail.on = document.querySelector('.sidebar-nav .ps__rail-y');
    ps.y.rail.off = document.querySelector('.sidebar-nav .ps__rail-y-off');
    ps.y.thumb.on = document.querySelector('.sidebar-nav .ps__thumb-y');
    ps.y.thumb.off = document.querySelector('.sidebar-nav .ps__thumb-y-off');
    if (sidebar) {
      if (toggle) {
        sidebar.classList.add('ps');
        sidebar.classList.add('ps-container');
        sidebar.classList.add('ps--active-y');
        if (ps.y.rail.off) {
          ps.y.rail.off.classList.add('ps__rail-y');
          ps.y.rail.off.removeAttribute('style');
          ps.y.rail.off.style.left = isRtl ? '0px' : 'unset';
          ps.y.rail.off.style.right = isRtl ? 'unset' : '0px';
          ps.y.rail.off.classList.remove('ps__rail-y-off');
        }
        if (ps.y.thumb.off) {
          ps.y.thumb.off.removeAttribute('style');
          ps.y.thumb.off.classList.add('ps__thumb-y');
          ps.y.thumb.off.classList.remove('ps__thumb-y-off');
        }
      } else {
        if (ps.y.rail.on) {
          ps.y.rail.on.classList.add('ps__rail-y-off');
          ps.y.rail.on.removeAttribute('style');
          ps.y.rail.on.classList.remove('ps__rail-y');
        }
        if (ps.y.thumb.on) {
          ps.y.thumb.on.classList.add('ps__thumb-y-off');
          ps.y.thumb.on.removeAttribute('style');
          ps.y.thumb.on.classList.remove('ps__thumb-y');
        }
        sidebar.classList.remove('ps');
        sidebar.classList.remove('ps-container');
        sidebar.classList.remove('ps--active-y');
      }
    }
  };

  LayoutHelper.toggleClass = function toggleClass(className, force) {

    if (force === true) {
      this.elClassList.add(className);
    } else if (force === false) {
      this.elClassList.remove(className);
    } else {
      this.elClassList.toggle(className);
    }
    return this.elClassList.contains(className);
  };

  LayoutHelper.isOnMobile = function isOnMobile() {
    var onMobile = false;
    try {
      var minimizerElement = document.querySelector('.sidebar-minimizer');
      if (minimizerElement) {
        onMobile = getComputedStyle(minimizerElement).getPropertyValue('display') === 'none';
      } else {
        var sidebarElement = document.querySelector('.sidebar .sidebar-nav');
        sidebarElement && (onMobile = getComputedStyle(sidebarElement).getPropertyValue('overflow-y') === 'auto');
      }
    } catch (ignore) {
      // eslint-disable-next-line
      console.warn('CoreUI isOnMobile failed to getComputedStyle', ignore);
    }
    return onMobile;
  };

  return LayoutHelper;
}(), _class.elClassList = document.body.classList, _temp);


export default LayoutHelper;