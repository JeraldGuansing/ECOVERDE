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

  return Controller.extend("com.ecoverde.ECOVERDE.controller.inventoryTransfer", {
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
   
      
      this.getView().byId("whseID").setValue(localStorage.getItem("wheseID"));
      this.getView().byId("whseID").setEnabled(false);
      this.getView().byId("whseNM").setValue(localStorage.getItem("wheseNm"));
      this.getView().byId("whseNM").setEnabled(false);
     
      this.onGetTransferReq();
    },

    onGetTransferReq: function(){
      this.openLoadingFragment();
      var that = this;
     
      var sServerName = localStorage.getItem("ServerID");
 //     var sUrl = sServerName + "/b1s/v1/InventoryTransferRequests?$select=DocNum,DocEntry,FromWarehouse,DocDate&$filter=DocumentStatus eq 'bost_Open' and ToWarehouse eq '" +  localStorage.getItem("wheseID") +"'";
      var sUrl = sServerName + "/b1s/v1/$crossjoin(InventoryTransferRequests,Warehouses)?$expand=InventoryTransferRequests($select=DocNum,DocEntry,FromWarehouse,DocDate,Reference1),Warehouses($select=WarehouseName)&$filter=InventoryTransferRequests/FromWarehouse eq Warehouses/WarehouseCode and InventoryTransferRequests/DocumentStatus eq 'bost_Open' and InventoryTransferRequests/ToWarehouse eq '" +  localStorage.getItem("wheseID") +"'";
  
      $.ajax({
        url: sUrl,
        type: "GET",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          this.closeLoadingFragment();
          console.log(xhr.responseJSON.error.message.value);
        },
        success: function (json) {
        this.oModel.getData().InventoryTransfer = json.value;
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

    getContextByIndex: function(evt) {
      var oTable = this.byId("tblID");
      var iIndex = oTable.getSelectedIndex();
      if (iIndex < 0) {
        MessageToast.show("Please Select Item first");
      } else {
          this.onCopyReq();
         }
    },

onCopyReq: function(evt) {  
      localStorage.setItem("DocNo", "");
      var i = this.byId("tblID").getSelectedIndices();
      var oList =  this.oModel.getData().InventoryTransfer;
     
      localStorage.setItem("DocNo", oList[i].InventoryTransferRequests.DocNum);
      localStorage.setItem("DocEntry", oList[i].InventoryTransferRequests.DocEntry);
      localStorage.setItem("FromWhseID", oList[i].InventoryTransferRequests.FromWarehouse);
      localStorage.setItem("Reference1", oList[i].InventoryTransferRequests.Reference1);
      localStorage.setItem("FromWhseNM", oList[i].Warehouses.WarehouseName);
      this.clearSelection();
      this.onCopyRequest();
    },

clearSelection: function(evt) {
      this.byId("tblID").clearSelection();
    },

    onPressNavback: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("transferView");
      },
      
      onCopyRequest: function(){
        this.router = this.getOwnerComponent().getRouter();
        this.router.navTo("InventoryPost");
        },


  });
});
