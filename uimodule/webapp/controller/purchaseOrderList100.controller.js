sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox,Fragment,syncStyleClass) {
  "use strict";
	var iTimeoutId;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.purchaseOrderList100", {

    onInit: function(){
     
      this.oModel = new JSONModel("model/POlist.json");
      this.getView().setModel(this.oModel, "oModel");
      
      this.onGetPurchaseList();
    },


    onGetPurchaseList: function(){
      this.openLoadingFragment();
      var that = this;
      var oView = that.getView();
     
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/PurchaseDeliveryNotes?$select=DocNum,CardCode,CardName,NumAtCard,DocDueDate,DocDate,TaxDate";
  
      $.ajax({
        url: sUrl,
        type: "GET",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          this.closeLoadingFragment();
          console.log("Error Occured");
        },
        success: function (json) {
       
        this.oModel.getData().value = json.value;
        this.oModel.refresh();
        this.closeLoadingFragment();
        },
        context: this
      });
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

  });
});
