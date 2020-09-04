sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox,Fragment) {
  "use strict";
	var iTimeoutId;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.purchaseOrderList100", {

    onInit: function(){
      var that = this;
	    var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
            },
            onBeforeFirstShow: function(evt) {
                //This event is fired before the NavContainer shows this child control for the first time.
            },
            onBeforeHide: function(evt) {
                //This event is fired every time before the NavContainer hides this child control.
            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                that.initialize(evt.data);
            }
        });
      
    },

    initialize: function(){
      this.oModel = new JSONModel("model/POlist.json");
      this.getView().setModel(this.oModel, "oModel");
      this.onGetPurchaseList();
      this.oModel.refresh();
    },

    onGetPurchaseList: function(){
      this.openLoadingFragment();
      var that = this;
      var oView = that.getView();
     
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/PurchaseDeliveryNotes?$select=DocNum,CardCode,CardName,NumAtCard,DocDueDate,DocDate,TaxDate&$filter=DocumentStatus eq 'bost_Open'";
  
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

    onSearchDoc: function(){
      this.openLoadingFragment();
      var searchF = this.getView().byId("sField").getValue()
      var that = this;
      var oView = that.getView();
     
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/PurchaseDeliveryNotes?$select=DocNum,CardCode,CardName,NumAtCard,DocDueDate,DocDate,TaxDate&$filter=DocNum eq " + searchF + " and DocumentStatus eq 'bost_Open'";
  
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


    closeLoadingFragment : function(){
      if(this.oDialog){
        this.oDialog.close();
      }
    },


    getContextByIndex: function(evt) {
			var oTable = this.byId("tblID");
			var iIndex = oTable.getSelectedIndex();
			if (iIndex < 0) {
				MessageToast.show("Please Select Item first");
			} else {
          this.onReceivedItem();
         }
		},

      onReceivedItem: function(evt) {
        
        localStorage.setItem("DocNo", "");
        localStorage.setItem("VendorCode", "");
        localStorage.setItem("VendorName", "");
        
        var i = this.byId("tblID").getSelectedIndices();
        var oList =  this.oModel.getData().value;
       
        localStorage.setItem("DocNo", oList[i].DocNum);
        localStorage.setItem("VendorCode", oList[i].CardCode);
        localStorage.setItem("VendorName", oList[i].CardName);
             
        this.clearSelection();
        this.onGotoReceived();
      },

      clearSelection: function(evt) {
        this.byId("tblID").clearSelection();
      },
  
      onGotoReceived: function(){
        this.router = this.getOwnerComponent().getRouter();
        this.router.navTo("GRwReference");
        },
      
  });
});
