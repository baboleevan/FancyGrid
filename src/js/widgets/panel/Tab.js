/**
 * @class Fancy.panel.Tab
 */
(function () {
  //SHORTCUTS
  var F = Fancy;

  //CONSTANTS
  var PANEL_BODY_INNER_CLS = F.PANEL_BODY_INNER_CLS;
  var PANEL_GRID_INSIDE_CLS = F.PANEL_GRID_INSIDE_CLS;
  var TAB_WRAPPER_CLS = F.TAB_WRAPPER_CLS;
  var TAB_ACTIVE_WRAPPER_CLS = F.TAB_ACTIVE_WRAPPER_CLS;
  var TAB_TBAR_ACTIVE_CLS = F.TAB_TBAR_ACTIVE_CLS;
  var PANEL_TAB_CLS = F.PANEL_TAB_CLS;

  F.define(['Fancy.panel.Tab', 'Fancy.Tab', 'FancyTab'], {
    extend: F.Panel,
    /*
     * @constructor
     * @param config
     * @param scope
     */
    constructor: function (config, scope) {
      this.prepareConfigTheme(config);
      this.Super('const', arguments);
    },
    /*
     *
     */
    init: function () {
      var me = this;

      me.prepareTabs();
      me.Super('init', arguments);

      me.setActiveTab(me.activeTab);
    },
    activeTab: 0,
    theme: 'default',
    /*
     *
     */
    render: function () {
      var me = this;

      me.Super('render', arguments);

      me.panelBodyEl = me.el.select('.' + PANEL_BODY_INNER_CLS).item(0);

      me.setPanelBodySize();

      me.renderTabWrappers();

      if (!me.wrapped) {
        me.el.addCls(PANEL_GRID_INSIDE_CLS);
      }
      me.el.addCls(PANEL_TAB_CLS);

      me.rendered = true;
    },
    setPanelBodySize: function () {
      var me = this,
        height = me.height,
        panelBodyBorders = me.panelBodyBorders;

      if (me.title) {
        height -= me.titleHeight;
      }

      if (me.subTitle) {
        height -= me.subTitleHeight;
        height += panelBodyBorders[2];
      }

      if (me.bbar) {
        height -= me.barHeight;
      }

      if (me.tbar) {
        height -= me.barHeight;
      }

      if (me.subTBar) {
        height -= me.barHeight;
      }

      if (me.buttons) {
        height -= me.barHeight;
      }

      if (me.footer) {
        height -= me.barHeight;
      }

      height -= panelBodyBorders[0] + panelBodyBorders[2];

      me.panelBodyEl.css({
        height: height
      });

      me.panelBodyHeight = height;
      me.panelBodyWidth = me.width - panelBodyBorders[1] - panelBodyBorders[3];
      //me.panelBodyWidth = me.width;
    },
    prepareConfigTheme: function (config) {
      var me = this,
        themeName = config.theme || me.theme,
        themeConfig = F.getTheme(themeName).config,
        wrapped = me.wrapped || config.wrapped;

      if (wrapped) {
        config.panelBodyBorders = [0, 0, 0, 0];
        me.panelBodyBorders = [0, 0, 0, 0];
      }

      F.applyIf(config, themeConfig);
      F.apply(me, config);
    },
    prepareTabs: function () {
      var me = this,
        tabs = [],
        i = 0,
        iL = me.items.length;

      for (; i < iL; i++) {
        var item = me.items[i],
          tabConfig = {
            type: 'tab'
          };

        if (item.tabTitle) {
          tabConfig.text = item.tabTitle;
        }
        else if (item.title) {
          tabConfig.text = item.title;
          delete item.title;
        }

        tabConfig.handler = (function (i) {
          return function () {
            me.setActiveTab(i);
          }
        })(i);

        tabs.push(tabConfig);
      }

      me.tbar = tabs;
      me.tabs = tabs;
    },
    renderTabWrappers: function () {
      var me = this;

      F.each(me.items, function (item) {
        var el = F.get(document.createElement('div'));

        el.addCls(TAB_WRAPPER_CLS);

        item.renderTo = me.panelBodyEl.dom.appendChild(el.dom);
      });
    },
    setActiveTab: function (newActiveTab) {
      var me = this,
        tabs = me.el.select('.' + TAB_WRAPPER_CLS),
        oldActiveTab = me.activeTab;

      if (me.items.length === 0) {
        return;
      }

      tabs.item(me.activeTab).removeCls(TAB_ACTIVE_WRAPPER_CLS);
      me.activeTab = newActiveTab;

      tabs.item(me.activeTab).addCls(TAB_ACTIVE_WRAPPER_CLS);

      var item = me.items[me.activeTab];

      item.theme = me.theme;
      item.wrapped = true;

      item.width = me.panelBodyWidth;
      item.height = me.panelBodyHeight;

      if (!item.rendered) {
        switch (item.type) {
          case 'form':
            me.items[me.activeTab] = new FancyForm(item);
            break;
          case 'grid':
            me.items[me.activeTab] = new FancyGrid(item);
            break;
          case 'tab':
            me.items[me.activeTab] = new FancyTab(item);
            break;
        }
      }
      else {
        me.setActiveItemWidth();
        me.setActiveItemHeight();
      }

      if (me.tabs) {
        me.tbar[oldActiveTab].removeCls(TAB_TBAR_ACTIVE_CLS);
        me.tbar[me.activeTab].addCls(TAB_TBAR_ACTIVE_CLS);
      }
    },
    /*
     * @param {String} value
     */
    setWidth: function (value) {
      var me = this;

      me.width = value;

      me.css('width', value);
      me.setPanelBodySize();

      me.setActiveItemWidth();
    },
    /*
     * @param {Number} value
     */
    setHeight: function (value) {
      var me = this;

      me.height = value;

      me.css('height', value);
      me.setPanelBodySize();

      me.setActiveItemHeight();
    },
    setActiveItemWidth: function () {
      var me = this;

      me.items[me.activeTab].setWidth(me.panelBodyWidth);
    },
    setActiveItemHeight: function () {
      var me = this;

      me.items[me.activeTab].setHeight(me.panelBodyHeight, false);
    }
  });

  FancyTab.get = function (id) {
    var tabId = F.get(id).select('.' + PANEL_TAB_CLS).dom.id;

    return F.getWidget(tabId);
  };

  if (!F.nojQuery && F.$) {
    F.$.fn.FancyTab = function (o) {
      o.renderTo = $(this.selector)[0].id;

      return new FancyTab(o);
    };
  }

})();