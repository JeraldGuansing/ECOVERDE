sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/Device"
], function(Controller,MessageToast,Device) {
  "use strict";

  return Controller.extend("com.ecoverde.ECOVERDE.controller.settings", {
    onInit: function () {
    var oView = this.getView();
		
		//host address
 		oView.byId("inputServer").setValue(localStorage.getItem("ServerID"));
 		oView.byId("inputDBName").setValue(localStorage.getItem("dbName"));
		
    },
    

    onPressSave: function(){
      var oView = this.getView();
      var sServer = this.getView().byId("inputServer").getValue();
      var sDbName = this.getView().byId("inputDBName").getValue();
      
      if(sServer ===""){
        sap.m.MessageToast.show("Please Input Server");
        return;
      }else if(sDbName ===""){
        sap.m.MessageToast.show("Please Input Database");
        return;
      }else{

        localStorage.setItem("ServerID", oView.byId("inputServer").getValue());
        localStorage.setItem("dbName", oView.byId("inputDBName").getValue());
  
        sap.m.MessageToast.show("Server and Database successfully save.");
   
        this.onPressNavBackButton();
      }      
    },

    onPressNavBackButton: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("login");
    },
  });
});
