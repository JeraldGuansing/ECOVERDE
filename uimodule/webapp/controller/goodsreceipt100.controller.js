sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/Token",
  "sap/m/MessageBox"
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox) {
  "use strict";
 
  return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsreceipt100", {
    onInit: function(){

    },


      //showNavButton="true" navButtonPress="onPressBack"
    onGotoScanview: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("BarcodeScanning");
    },
  });
});
