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
    
    // onSelectKey : function (){
    //   var ids = this.getView().byId('statusID').getSelectedKey();
    //   localStorage.setItem("inbStat",ids);
    // },
  


    onLogin: function(oEvent){
      var oView = this.getView();
              
            localStorage.setItem("wheseID", "");
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
              var sWarehouse = this.getView().byId("whsID").getValue();
              var sUsername = this.getView().byId("Username").getValue();
              var sPassword = this.getView().byId("Password").getValue();
            
              if(sWarehouse === ""){
                sap.m.MessageToast.show("Please Select Warehouse");
                return;
              }else if(sUsername === ""){
                sap.m.MessageToast.show("Please Input UserName");
                return;
              }else if(sPassword === ""){
                sap.m.MessageToast.show("Please Input Password");
                return;
              }
              else{

                //API
                
                localStorage.setItem("wheseID", oView.byId("whsID").getValue());
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
                    sap.m.MessageToast.show("Incorrect UserName/Password");
                  },
                  success: function (json) {
                    sap.m.MessageToast.show("Welcome");
                    this.router = this.getOwnerComponent().getRouter();
                    this.router.navTo("main");
                  },
                  context: this
                }).done(function (results) {
                
                });
          
              }
    },

    onWhseList: function(){
      var oView = this.getView();
      var oModel = new sap.ui.model.json.JSONModel();
     
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
          
        },
        success: function (json) {
          var sUrl1 = sServerName + "/b1s/v1/Warehouses";
                
          $.ajax({
            url: sUrl1,
            type: "GET",
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
              withCredentials: true},
            success: function(response){
            
              oModel.setData(response);
              oView.setModel(oModel);
            }, error: function(response) { 
            sap.m.MessageToast.show(response.statusText);}
            })


        },
        context: this
      })

	
    },


    onSetting: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("settings");
    },

  });
});
