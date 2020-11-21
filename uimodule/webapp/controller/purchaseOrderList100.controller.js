sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment"
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
      this.oModel = new JSONModel("model/item.json");
      this.getView().setModel(this.oModel, "oModel");
      this.onGetPurchaseList();
      // this.oModel.refresh();
    },

    onGetPurchaseList: function(){
      this.openLoadingFragment();
      var that = this;
      var oView = that.getView();
     
      var sServerName = localStorage.getItem("ServerID");
      var xsjsServer = sServerName.replace("50000", "4300");
      var sUrl = xsjsServer + "/app_xsjs/PurchaseOrder.xsjs?whse=" + localStorage.getItem("wheseID") + "&crcode=" + localStorage.getItem("VendorCode");
    
      $.ajax({
        url: sUrl,
        type: "GET",
        crossDomain: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));
        },
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          this.closeLoadingFragment();
          console.log("Error Occured:" + error);
          // sap.m.MessageToast.show("Error: " + xhr.responseJSON.error.message.value);
        },
        success: function (response) {
       
        var OPOR = [];
        var opor1 =  response;
        var count = Object.keys(opor1).length;
        //
        for(let o =0; o < count;o++){
          OPOR.push({
            "DocNum": opor1[o].DocNum,
            "DocEntry": opor1[o].DocEntry,
            "CardCode": opor1[o].CardCode,
            "CardName":  opor1[o].CardName,
            "NumAtCard": opor1[o].NumAtCard,
            "DocDate":  opor1[o].DocDate,
            "Comments":  opor1[o].Comments,
            "DocDueDate": opor1[o].DocDueDate,
            "TaxDate":  opor1[o].TaxDate
          });
        }
    
        this.oModel.getData().value = OPOR;
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
      var sUrl = sServerName + "/b1s/v1/PurchaseOrders?$select=DocNum,DocEntry,CardCode,CardName,NumAtCard,DocDueDate,DocDate,TaxDate&$filter=DocNum eq " + searchF + " and DocumentStatus eq 'bost_Open'";
  
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
          this.OnMiltipleSelect();
         }
		},

  onReceivedItem: function(evt) {
        
        localStorage.setItem("DocNo", "");
        localStorage.setItem("VendorCode", "");
        localStorage.setItem("VendorName", "");
        
        var i = this.byId("tblID").getSelectedIndices();
        var oList =  this.oModel.getData().value;
        // console.log(oList[i]);
        var str = oList[i].CardName;
        var res = str.substring(0, 18);
        
        localStorage.setItem("DocNo", oList[i].DocNum);
        localStorage.setItem("VendorCode", oList[i].CardCode);
        localStorage.setItem("NumAtCard", oList[i].NumAtCard);
        localStorage.setItem("Comments", oList[i].Comments);
        localStorage.setItem("VendorName", res);
        localStorage.setItem("DocEntry", oList[i].DocEntry);
             
        this.clearSelection();
        this.onGotoReceived();
      },

  OnMiltipleSelect: function(){
    var docE = [];
    sessionStorage.clear();
    var i = this.byId("tblID").getSelectedIndices();
    var oList =  this.oModel.getData().value;
   
    for(let x=0;x < i.length;x++){
      var a = i[x];
      var str = oList[a].CardName;
      var res = str.substring(0, 18);
      docE.push({
        "DocEntry": oList[a].DocEntry,
        "DocNo": oList[a].DocNum,
        "VendorCode": oList[a].CardCode,
        "NumAtCard": oList[a].NumAtCard,
        "Comments": oList[a].Comments,
        "VendorName": res
      });  
    }    
    // console.log(oList);
    sessionStorage.setItem('GRPO',JSON.stringify(docE));
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
