sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/Device",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/Token",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function(Controller,MessageToast,Device,Filter,FilterOperator,Token,MessageBox,JSONModel) {
  "use strict";

  return Controller.extend("com.ecoverde.ECOVERDE.controller.login", {
    
    onInit: function () {
      if(!localStorage.ServerID || !localStorage.dbName){
        this.onSetting();
        return;
      }
     
    },
    
    // onDisable: function(){
    //   this.getView().byId('whsID').setEnabled(false);
    // },

    // onEnable: function(){
    //   this.getView().byId('whsID').setEnabled(true);
    // },

    // onSelectKey : function (){
    //   var whsid = this.getView().byId('whsID').getSelectedKey();
    //   localStorage.setItem("wheseID",whsid);
    // },

    onLogin: function(oEvent){
      var that = this;
      var oView = this.getView();
              
            localStorage.setItem("userName", "");
            localStorage.setItem("password", "");


            if(!localStorage.ServerID){
              sap.m.MessageToast.show("Input server in settings");
              return;
            }
            
            if(!localStorage.dbName){
              sap.m.MessageToast.show("Input database in settings");
              return;
            }
              // var sWarehouse = this.getView().byId("whsID").getValue();
              var sUsername = this.getView().byId("Username").getValue();
              var sPassword = this.getView().byId("Password").getValue();
            
             if(sUsername === ""){
                sap.m.MessageToast.show("Please Input UserName");
                return;
              }else if(sPassword === ""){
                sap.m.MessageToast.show("Please Input Password");
                return;
              }
              else{

                //API
                this.openLoadingFragment();
                // localStorage.setItem("wheseID", oView.byId("whsID").getValue());
                localStorage.setItem("userName", oView.byId("Username").getValue());
                localStorage.setItem("password", oView.byId("Password").getValue());
                
                var sServerName = localStorage.getItem("ServerID");
                var sDatabaseName = localStorage.getItem("dbName");
                // var sWhseID = localStorage.getItem("wheseID");
                var sUserName = localStorage.getItem("userName");
                var sPassw = localStorage.getItem("password");
                var sUrl = sServerName + "/b1s/v1/Login";

                var oBody = {};
                oBody.CompanyDB = sDatabaseName;
                oBody.UserName = sUserName;
                oBody.Password = sPassw;
              
                oBody = JSON.stringify(oBody);
              
                $.ajax({
                  url: sUrl,
                  type: "POST",
                  data: oBody,
                  headers: {
                    'Content-Type': 'application/json'},
                  crossDomain: true,
                  xhrFields: {
                    withCredentials: true
                  },
                  error: function (xhr, status, error) {
                    that.closeLoadingFragment();
                    sap.m.MessageToast.show("Incorrect UserName/Password");
                  },
                  success: function (json) {
                    that.closeLoadingFragment();
                    that.router = that.getOwnerComponent().getRouter();
                    that.router.navTo("main");
                    sap.m.MessageToast.show("Welcome");
                  },
                  context: that
                });
          
              }
    },

    openLoadingFragment: function(){
      if (! this.oDialog) {
            this.oDialog = sap.ui.xmlfragment("busyLogin","com.ecoverde.ECOVERDE.view.fragment.BusyDialog", this);   
       }
      this.oDialog.open();
    },

    closeLoadingFragment : function(){
      if(this.oDialog){
        this.oDialog.close();
      }
    },

    onSetting: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("settings");
    },

  });
});
