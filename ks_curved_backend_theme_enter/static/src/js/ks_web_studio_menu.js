odoo.define('ks_curved_backend_theme_enter.Menu', function (require) {
"use strict";

var Menu = require('web_enterprise.Menu');
var StudioMenu = require('web_studio.Menu');
Menu.include({
  /*
  * @Override this function to reload webpage when the user leave the studio mode, to patch wrong design header
  * issues for vertical header.
  */
  switchMode: function (mode) {
    if(!mode){
        var ksRedirectURL = location.href;
        if(location.href.includes('studio=app_creator')){
            ksRedirectURL = location.href.split('studio=app_creator');
        }
        else{
            ksRedirectURL = location.href.split('studio=main');
        }
        $('header').addClass('d-none');
        location.href = ksRedirectURL[0] + ksRedirectURL[1];
    }
    else{
        this._super(mode);
    }
  },
});

});