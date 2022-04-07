odoo.define('ks_curved_backend_theme_enter.KsWebClient', function (require) {
"use strict";

    const WebClient = require('web.WebClient');
    const KsWebClient = require('web_studio.WebClient');
    const session = require('web.session');
    WebClient.include({
        _openStudio: async function () {
            this._super();
            // Hide Un-necessary element when studio is opened.
            $('body').addClass('ks_favtbar_autohide');
            $('body').removeClass('ks_vertical_body_panel');
            $('.ks_left_sidebar_panel').addClass('d-none');
            $('.ks_right_sidebar_panel').addClass('d-none');
        },

        toggleHomeMenu: async function (display){
            if(display){
                this._ksManagerDrawer('open');
                $('body').removeClass('ks_menubar_autohide')
            }
            else{
                this._ksManagerDrawer('close');
                if(session.ks_curved_backend_theme_enter_data && session.ks_curved_backend_theme_enter_data.ks_menubar_autohide)
                  $('body').addClass('ks_menubar_autohide')
            }
            this._super(display);
        },

        _ksManagerDrawer: function (drawer_status) {
          if (drawer_status == "open") {
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
          if (drawer_status == "close") {
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
      },
    });
});