odoo.define("ks_curved_backend_theme_enter.StudioHomeMenu", function (require) {
    "use strict";

    const StudioHomeMenu = require("web_studio.StudioHomeMenu");
    const patchMixin = require('web.patchMixin');
    const HomeMenuPatched = patchMixin(StudioHomeMenu);


    const { patch } = require('web.utils');
    const HomeMenu = require("web_enterprise.HomeMenu");
    patch(HomeMenu, 'ks_curved_backend_theme_enter.HomeMenu', {
        async willStart() {
            // Get Favorite app list.
//            const ks_fav_apps = await this.env.services.rpc({
//                route: "/ks_curved_theme/get_fav_icons",
//                params: { ks_app_icons: this.props.apps },
//            });

            // Get Frequent Apps.
//            const ks_frequent_apps_prom = await this.env.services.rpc({
//                route: "/ks_app_frequency/render",
//            });
            this._ks_frequent_apps = [];
//            ks_fav_apps.forEach((app)=>{
//                if(ks_frequent_apps_prom.includes(app.id))
//                    this._ks_frequent_apps.push(app);
//            });
//            this.props.apps = ks_fav_apps;
//            this.availableApps = ks_fav_apps;
        },

        _ksHideFavIcons(ev) {
            ev.preventDefault();
            var self = this;
            document.body.classList.remove("ks_appsmenu_edit");

            $("div.ks_appdrawer_inner_app_div")
                .find("span.ks_fav_icon")
                .addClass("d-none");
            $("div.o_home_menu")
                .find("div.ks-app-drawer-close")
                .addClass("d-none");
        },

        async _onFavoriteClick(app){
            if($(event.currentTarget).hasClass('ks_add_fav')){
                // Add app to favorite app.
                event.preventDefault();
                var ev = event;
                const result = await this.env.services.rpc({
                    route: "/ks_curved_theme/set_fav_icons",
                    params: {
                        ks_app_id: app.id
                    },
                });
                if (result) {
                    this._ksAddToFav(ev);
                    this.ksAppsMenu._ksUpdateFavIcons();
                }
            }
            else{
                // Remove app from favorite app.
                event.preventDefault();
                var ev = event;
                const result = await this.env.services.rpc({
                    route: "/ks_curved_theme/rmv_fav_icons",
                    params: {
                         ks_app_id: app.id
                    },
                });
                if (result) {
                    this._ksRemFromFav(ev);
                    this.ksAppsMenu._ksUpdateFavIcons();
                }
            }
        },

        _ksAddToFav: function(ev) {
            // Change Class.
            $(ev.target).parent().removeClass("ks_add_fav");
            $(ev.target).parent().addClass("ks_rmv_fav");

            // Change icon
            $(ev.target).parent()
                .find("img")
                .attr("src", "ks_curved_backend_theme_enter/static/src/images/fav_ic.svg");
        },

        _ksRemFromFav: function(ev) {
            // Change Class.
            $(ev.target).parent().removeClass("ks_rmv_fav");
            $(ev.target).parent().addClass("ks_add_fav");

            // Change icon
            $(ev.target).parent()
                .find("img")
                .attr("src", "ks_curved_backend_theme_enter/static/src/images/star.svg");
        },

        _getFrequentApps() {
            return this._ks_frequent_apps;
        },
    });
});