odoo.define(
  "ks_curved_backend_theme_enter.ks_left_sidebar_panel",
  function (require) {
    "use strict";

     var config = require("web.config");
    // To check the device

//    var Menu = require("web.Menu");
    var Menu = require("web_enterprise.Menu");
    var AppsMenu = require("web.AppsMenu");
    var SystrayMenu = require("web.SystrayMenu");
    var UserMenu = require("web.UserMenu");
    var dom = require("web.dom");
    var session = require("web.session");
    var ksAppSidebar = require("ks_curved_backend_theme_enter.ks_app_sidebar");
    var ksBookmarks = require("ks_curved_backend_theme_enter.ks_bookmarks");
    var core = require('web.core');
    var QWeb = core.qweb;
    const HomeMenu = require("web_enterprise.HomeMenu");

    Menu.include({
      events: _.extend({}, Menu.prototype.events, {
        "click #ks_app_drawer_toggle": "_ksAppsDrawerClick",
        "click div.ks-phone-menu-list .o_menu_sections a[data-menu]":
          "_ksMobileDrawerMenu",
      }),

      custom_events: {
        ks_update_fav_icon: "_ksUpdateFavIcon",
        ks_manage_drawer: "_ksManagerDrawer",
      },

      init: function () {
        return this._super.apply(this, arguments);
      },

      willStart: function () {
        var self = this;
        var ks_fields_data = self
          ._rpc({
            model: "ks.global.config",
            method: "ks_get_value_from_scope",
            args: [
              [
                "ks_menu_bar",
                "ks_favorite_bar",
                "ks_company_logo",
                "ks_favtbar_autohide",
                "ks_favtbar_position",
                "ks_show_app_name",
                "ks_user_menu_placement",
                "ks_menubar_autohide",
              ],
            ],
          })
          .then(function (res) {
            if (res) {
              self.ks_menu_bar = res.ks_menu_bar;
              self.ks_favorite_bar = res.ks_favorite_bar;
              self.ks_favtbar_autohide = res.ks_favtbar_autohide;
              self.ks_menubar_autohide = res.ks_menubar_autohide;
              self.ks_favtbar_position = res.ks_favtbar_position;
              self.ks_company_logo = res.ks_company_logo;
              self.ks_show_app_name = res.ks_show_app_name;
              self.ks_user_menu_placement = res.ks_user_menu_placement;
            }
            if (self.ks_menu_bar == "Vertical")
              document.body.classList.add("ks_vertical_body_panel");
            if (
              self.ks_favtbar_autohide &&
              self.ks_favorite_bar &&
              self.ks_menu_bar == "Horizontal"
            )
              document.body.classList.add("ks_favtbar_autohide");
            if (self.ks_menubar_autohide && screen.width > 1024)
              document.body.classList.add("ks_menubar_autohide");
            if (
              self.ks_favtbar_position == "Bottom" &&
              self.ks_menu_bar == "Horizontal"
            )
              document.body.classList.add("ks_favtbar_bottom");
            if (
              self.ks_user_menu_placement == "Top" &&
              self.ks_menu_bar == "Vertical"
            )
              document.body.classList.add("ks_user_menu_top");
            if (!self.ks_show_app_name && self.ks_favorite_bar)
              document.body.classList.add("ks_hide_app_names");
            if (self.ks_menu_bar == "Horizontal" && !self.ks_favorite_bar)
              document.body.classList.add("ks_hide_leftpanel");
          });
        return Promise.all([
          this._super.apply(this, arguments),
          ks_fields_data,
        ]);
      },

      start: function () {
        var self = this;

        this.$menu_apps = this.$(".o_menu_apps");

        if (this.ks_menu_bar == "Horizontal") {
          this.$menu_brand_placeholder = this.$(".o_menu_brand");
          this.$section_placeholder = this.$(".o_menu_sections");

          // Remove my-profile and logout buttons for horizontal menu bar on mobile.
          var ks_my_profile = $('.ks_user_action_horizontal').find('a[data-menu="settings"]').remove();
          var ks_logout = $('.ks_user_action_horizontal').find('a[data-menu="logout"]').remove();

          // Add buttons on mobile left navigation.
           $('div.ks-phone-profile').after('<div class="ks_mobile_nav_bottom"></div>')
           $('div.ks_mobile_nav_bottom').append(ks_my_profile);
           $('div.ks_mobile_nav_bottom').append(ks_logout);

        } else if (this.ks_menu_bar == "Vertical") {
          this.$menu_brand_placeholder = $(".ks_vertical_menus")
            .find(".o_menu_brand");
          this.$section_placeholder = $(".ks_vertical_menus")
            .find(".o_menu_sections");
          this.$menu_icon = $(".ks_vertical_menus")
            .find(".ks_vertical_app_icon");

          // Vertical menu binding for mobile
          $("div.ks_left_sidebar_panel .ks_app_sidebar .inner-sidebar").on(
            "click",
            "a[data-menu]",
            self._ksMobileDrawerMenu.bind(self)
          );

          // Vertical user data append and binding.
          var ks_user_action = QWeb.render('UserMenu.Actions');
          $('div.ks_user_action').html(ks_user_action);

          // Remove my-profile and logout buttons for vertical menu bar on mobile.
          var ks_my_profile = $('.ks_user_action').find('a[data-menu="settings"]').remove();
          var ks_logout = $('.ks_user_action').find('a[data-menu="logout"]').remove();

          // Add buttons on mobile left navigation on mobile.
           $('div.ks-phone-profile').after('<div class="ks_mobile_nav_bottom"></div>')
           $('div.ks_mobile_nav_bottom').append(ks_my_profile);
           $('div.ks_mobile_nav_bottom').append(ks_logout);

          // Handle menu of user action on mobile
          $("div.ks_left_sidebar_panel .ks_app_sidebar .inner-sidebar").on(
            "click",
            ".ks-phone-menu-list .ks-phone-profile a[data-menu]",
            function (ev) {
              ev.preventDefault();
              var menu = $(this).data("menu");
              self.ksMobileUserMenu[
                "_onMenu" + menu.charAt(0).toUpperCase() + menu.slice(1)
              ]();
              self._ksCloseMobileDrawer();
            }
          );

          // Handle my profile and logout button on mobile
          $("div.ks_left_sidebar_panel .ks_app_sidebar .inner-sidebar").on(
            "click",
            ".ks-phone-menu-list .ks_mobile_nav_bottom a[data-menu]",
            function (ev) {
              ev.preventDefault();
              var menu = $(this).data("menu");
              self.ksMobileUserMenu[
                "_onMenu" + menu.charAt(0).toUpperCase() + menu.slice(1)
              ]();
              self._ksCloseMobileDrawer();
            }
          );
        }

        this._ksUpdateFavIcon();

        this._updateMenuBrand();
//        this.$right_sidebar = this.$el.siblings(".ks_right_sidebar_panel");
        this.$right_sidebar = $('div.ks_right_sidebar_panel');
        this._bookmark_bar = new ksBookmarks();
        this._bookmark_bar.appendTo(this.$right_sidebar);
        // Navbar's menus event handlers
        var on_secondary_menu_click = function (ev) {
          ev.preventDefault();
          var menu_id = $(ev.currentTarget).data("menu");
          var action_id = $(ev.currentTarget).data("action-id");
          self._on_secondary_menu_click(menu_id, action_id);
        };

        // Event handling for menus
        var menu_ids = _.keys(this.$menu_sections);
        var primary_menu_id, $section;
        for (var i = 0; i < menu_ids.length; i++) {
          primary_menu_id = menu_ids[i];
          $section = this.$menu_sections[primary_menu_id];
          $section.on(
            "click",
            "a[data-menu]",
            self,
            on_secondary_menu_click.bind(this)
          );
        }

        // Apps Menu (App-drawer)
        this._appsMenu = new AppsMenu(self, this.menu_data);
        // Add apps menu to the enterprise app drawer.
        HomeMenu.prototype.ksAppsMenu = this._appsMenu;
        if (this.ks_menu_bar == "Horizontal"){
          var appsMenuProm = this._appsMenu.appendTo(this.$menu_apps);
          if (this.ks_company_logo)
            this.$el.find('.o_menu_toggle').after(`<span class="brand_logo"><img src=data:image/png;base64,${this.ks_company_logo} class='ks_company_short_logo' alt='Company Logo' title='Company Logo'/></span>`);
        }
        else if (this.ks_menu_bar == "Vertical")
          var appDrawer = this.$el.find('.o_menu_toggle').appendTo($('.o_main_navbar'));
          var appsMenuProm = this._appsMenu
            .appendTo(
              this.$el.siblings(".ks_left_sidebar_panel").find(".o_menu_apps")
            )
            .then(function () {
              self.$el
                .siblings(".ks_left_sidebar_panel")
                .on(
                  "click",
                  "#ks_app_drawer_toggle",
                  self._ksAppsDrawerClick.bind(self)
                );
            });

        // Systray Menu
        this.systray_menu = new SystrayMenu(this);
        this.ksMobileUserMenu = new UserMenu(self);

        if (this.ks_menu_bar == "Vertical") {
          this._userMenu = new UserMenu(self);
          if (this._userMenu.className != 'o_user_menu_mobile'){
            var userMenuProm = this._userMenu.appendTo(this.$el.find(".ks_user_menu"));
          }
        }

        // Handle mobile drawer's user action.
        this.$el.on(
          "click",
          ".ks-phone-menu-list .ks-phone-profile a[data-menu]",
          function (ev) {
            ev.preventDefault();
            var menu = $(this).data("menu");
            self.ksMobileUserMenu[
              "_onMenu" + menu.charAt(0).toUpperCase() + menu.slice(1)
            ]();
            self._ksCloseMobileDrawer();
          }
        );
        return Promise.all([this._super.apply(this, arguments)]);
      },

      change_menu_section: function (primary_menu_id) {
        // Active favorite app in left sidebar.
        if (primary_menu_id && this.ks_favorite_bar)
          this._appsBar._setActiveApp(primary_menu_id);
        // Move menu brand name
        if(this.ks_menu_bar == 'Vertical'){
            this.$el.find('.o_menu_brand').addClass('ks_menubrand').appendTo($('.ks_vertical_menu_header'));
            if(primary_menu_id){
                this.$menu_sections[primary_menu_id].appendTo($('.ks_menusections'));
                this.$menu_sections[primary_menu_id].appendTo($('.o_burger_menu_app'));
            }
            $('.o_burger_menu_app').wrapInner('<ul class="o_menu_sections" role="menu"></div>');

            // Remove user menu from horizontal and append system try in vertical menu bar.
            this.$el.find('.o_menu_systray').find('li.o_user_menu').remove();
//            this.$el.find('.o_menu_systray').remove('.o_user_menu').appendTo($('.ks-menu-systray'));
            // Hide horizontal system tray.
            $('ul.ks-menu-systray').removeClass('d-none');
        }

        this._super.apply(this, arguments);
        if (primary_menu_id && this.ks_menu_bar == "Vertical") {
          var active_menu = this.menu_data.children.find(
            (x) => x.id === primary_menu_id
          );
          var $menu_icon = this.$menu_icon;
          if (active_menu) {
            $menu_icon.attr({
              alt: active_menu.name,
              title: active_menu.name,
              src: "data:image/png;base64," + active_menu.web_icon_data,
            });
          }
        }
        // For Frequency of Apps 👇
        if (primary_menu_id) {
          this._rpc({
            route: "/ks_app_frequency/update",
            params: {
              menu_id: primary_menu_id,
            },
          });
        }

        let tabContent = document.querySelectorAll(".tabContent .item");
        let ksTabs = document.querySelectorAll(".ks-tabs li");
        ksTabs.forEach((el, i) => {
          el.addEventListener("click", () => {
            ksTabs.forEach((rm) => {
              rm.classList.remove("active");
            });
            el.classList.add("active");
            tabContent.forEach((tabCont) => {
              tabCont.classList.remove("active");
            });
            tabContent[i].classList.add("active");
          });
        });
      },
      //--------------------------------------------------------------------------
      // Handlers
      //--------------------------------------------------------------------------

      /**
       * Show & hide app drawer
       *
       * @private
       * @param {MouseEvent} event
       */
      _ksAppsDrawerClick: function (event) {
        // To prevent opening default app
        event.stopPropagation();
        event.preventDefault();
        document.body.classList.toggle("ks_appsmenu_active");
        if (document.body.classList.contains("ks_appsmenu_active")) {
          document.body.classList.remove("brightness");
          this.trigger_up("ks_manage_drawer", {
            drawer_status: "open",
          });
        } else {
          document.body.classList.add("brightness");
          this.trigger_up("ks_manage_drawer", {
            drawer_status: "close",
          });
        }
        var owl = $(".owl-carousel");
        owl.owlCarousel({
          ltr: true,
          dots: true,
          dotsEach: true,
          items: 1,
          animateIn: "fadeIn",
        });
      },

      _ksUpdateFavIcon: function () {
//        if(this.ks_favorite_bar && this.ks_menu_bar == 'Vertical'){
            this._appsBar = new ksAppSidebar(this, this.menu_data);
            this.$menu_apps_sidebar = this.$el.find('.ks_left_sidebar_panel').find('.inner-sidebar');

            // Remove old favorite list.
            this.$menu_apps_sidebar.find('.ks_favt_apps').remove();
            // Add new favorite list.
            this._appsBar.prependTo(this.$menu_apps_sidebar);
//        }
//        if(this.ks_favorite_bar && this.ks_menu_bar == 'Horizontal' && $('.ks_left_sidebar_panel').find('.inner-sidebar').length){
//            this._appsBar = new ksAppSidebar(this, this.menu_data);
//            this.$menu_apps_sidebar = $('.ks_left_sidebar_panel').find('.inner-sidebar');
//
//            // Remove old favorite list.
//            $('.ks_favt_apps').remove();
//            // Add new favorite list.
//            this._appsBar.prependTo(this.$menu_apps_sidebar);
//        }
      },

      _ksManagerDrawer: function (drawer_status) {
        if (drawer_status.data && drawer_status.data.drawer_status) {
          if (drawer_status.data.drawer_status == "open") {
            if ($("html").attr("data-drawer-font-style") == "dark")
              $("html").attr("data-color-mode", "ks-dark");
            else if ($("html").attr("data-drawer-font-style") == "light")
              $("html").attr("data-color-mode", "ks-light");

            // Manage App drawer theme color.
            document.body.style.removeProperty("--body-background");
            document.body.style.removeProperty("--nav-link-color");
            document.body.style.removeProperty("--ks-over-link");

            $("ul.o_menu_systray").removeClass("ks_color_theme_dark_header");
            $('.o_main_navbar button.phone-menu-btn').removeClass("ks_color_theme_dark_header");
            $('.ks_left_sidebar_panel .ks_app_sidebar .inner-sidebar button.phone-menu-btn').removeClass("ks_color_theme_dark_header");
          }
          if (drawer_status.data.drawer_status == "close") {
            $("html").attr("data-color-mode", session.ks_current_color_mode);

            if (session.ks_current_color_mode == "ks-light") {
              // Apply Color theme back.
              document.body.style.setProperty(
                "--body-background",
                session.ks_color_theme["body-background"]
              );

              document.body.style.setProperty(
                "--nav-link-color",
                session.ks_color_theme["nav-link-color"]
              );

              document.body.style.setProperty(
                "--ks-over-link",
                session.ks_color_theme["ks-over-link"]
              );
            }

            if (session.ks_color_theme.ks_header_icon_clr) {
              $("ul.o_menu_systray").addClass("ks_color_theme_dark_header");
              $('.o_main_navbar button.phone-menu-btn').addClass("ks_color_theme_dark_header");
              $('.ks_left_sidebar_panel .ks_app_sidebar .inner-sidebar button.phone-menu-btn').addClass("ks_color_theme_dark_header");
            }
          }
        }
      },

      _ksMobileDrawerMenu: function (ev) {
        var self = this;
        ev.preventDefault();
        var menu_id = $(ev.currentTarget).data("menu");
        var action_id = $(ev.currentTarget).data("action-id");
        self._on_secondary_menu_click(menu_id, action_id);
        self._ksCloseMobileDrawer();
      },

      toggle_mode: function (home_menu, overapp) {
        this._super(home_menu, overapp);
        this.$menu_toggle.removeClass('fa-chevron-left');
      },

    });
  }
);
