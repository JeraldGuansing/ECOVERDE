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

  return Controller.extend("com.ecoverde.ECOVERDE.controller.warehouseReport", {
    
    onInit: function () {
  
      this.onWhseList();
    },

    onWhseList: function(){
      var oView = this.getView();
		  var oModel = new sap.ui.model.json.JSONModel();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Warehouses";

      $.ajax({
        url: sUrl,
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
     
  });
});
