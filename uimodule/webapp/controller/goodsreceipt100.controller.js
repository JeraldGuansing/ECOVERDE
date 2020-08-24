sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController"
], function(Controller) {
  "use strict";

  return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsreceipt100", {
    onInit: function(){

    },
//showNavButton="true" navButtonPress="onPressBack"
    onLogin: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("main");
    },
  });
});
