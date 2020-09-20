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
  var gitemUOMcode;
  var fitemUOMcode;
  var itmBar;
  var uomntry;
  var listpath;
  var indS;
  var iBarc;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.InventoryPosting", {

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
   
      this.getView().byId("docIDs").setText(localStorage.getItem("DocNo"));
      this.getView().byId("fWhseID").setText(localStorage.getItem("FromWhseID") + "-" + localStorage.getItem("FromWhseNM"));

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today =  yyyy + mm + dd;
      this.byId("DP8").setValue(today);

      this.onReqList();
    },

  onReqList: function(){
      var that = this;
      that.openLoadingFragment();
      var docID = localStorage.getItem("DocNo");
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/InventoryTransferRequests?$select=StockTransferLines&$filter=DocNum eq " + docID;
    
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
         try {
          that.oModel.getData().InventoryTransfer = response.value[0].StockTransferLines
          //console.log(that.oModel.getData())
        }
        catch(err) {
          that.initialize();
          
        }
         that.oModel.refresh();
         that.closeLoadingFragment();
        }, error: function (xhr, status, error) {
          that.closeLoadingFragment();
          console.log(xhr.responseJSON.error.message.value);
        },
    })
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

  onPressNavback: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("InventoryTransfer");
      },

  onShowEdit: function(oEvent){
        var that = this;
        that.openLoadingFragment();
      
        that.onPressEdit();
        
        var myInputControl = oEvent.getSource(); // e.g. the first item
        var boundData = myInputControl.getBindingContext('oModel').getObject();
        listpath = myInputControl.getBindingContext('oModel').getPath();
        var indexItem = listpath.split("/");
        indS =indexItem[2];
       
        sap.ui.getCore().byId("invItemC").setValue(boundData.ItemCode);
        sap.ui.getCore().byId("invItemN").setValue(boundData.ItemDescription);
        sap.ui.getCore().byId("invItemU").setValue(boundData.UoMCode);
        sap.ui.getCore().byId("invItemQ").setValue(boundData.Quantity);
    
        sap.ui.getCore().byId('invItemC').setEnabled(false);
        sap.ui.getCore().byId('invItemN').setEnabled(false);
        sap.ui.getCore().byId('invItemU').setEnabled(false);
     
        this.closeLoadingFragment();
        
      },
    
    
  onSaveEdit: function(){
      var StoredItem = this.oModel.getData().InventoryTransfer; 
      StoredItem[indS].Quantity = sap.ui.getCore().byId("invItemQ").getValue();
      this.oModel.refresh();
      this.closeLoadingFragment();
      this.onCloseEdit()
    },
    
  onPressEdit: function(){
        if (!this.editPosting) {
          this.editPosting = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.onEditInventoryTransfer", this);
          this.getView().addDependent(this.editPosting);
          this.oModel.refresh();
        }
        this.editPosting.open();
      },
    
  onCloseEdit: function(){
        if(this.editPosting){
            this.editPosting.close();
        }
      },
    
  onDeleteItem(){
        var that = this;
        var StoredItem = that.oModel.getData().InventoryTransfer;
      
        MessageBox.information("Are you sure you want to delete this Item??", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          title: "Delete Item",
          icon: MessageBox.Icon.QUESTION,
          styleClass:"sapUiSizeCompact",
          onClose: function (sButton) {
            if(sButton == "YES"){
              StoredItem.splice(indS,1);
              that.oModel.refresh();
            }
          }
        });
        this.onCloseEdit();
      },

      onConfirmPosting: function(){
        var itemJSON = this.oModel.getData().InventoryTransfer;
        if(parseInt(itemJSON.length) == 0){
          sap.m.MessageToast.show("Please Input item First");
        }
        else{
        var that = this;
        MessageBox.information("Are you sure you want to [POST] this transaction?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          title: "POST Inventory Transfer Stock",
          icon: MessageBox.Icon.QUESTION,
          styleClass:"sapUiSizeCompact",
          onClose: function (sButton) {
            if(sButton === "YES"){
              that.onPostinven();
            }}
        });
      }
        },
      
  onPostinven: function(){
      
          var that = this;
          that.openLoadingFragment();
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/StockTransfers";
          var oBody = {
            "Reference1": localStorage.getItem("Reference1"),
            "FromWarehouse":  localStorage.getItem("FromWhseID"),
            "ToWarehouse":localStorage.getItem("wheseID"), 
            "DocDate": that.getView().byId("DP8").getValue(),
            "StockTransferLines": []
          }
          var posItem = this.oModel.getData().InventoryTransfer;
          var x = posItem.length;
          for(var i = 0; i < x; i++){
          oBody.StockTransferLines.push({
            "ItemCode":posItem[i].ItemCode,
            "Quantity":posItem[i].Quantity,
            "UoMEntry":posItem[i].UoMEntry,
            "UoMCode": posItem[i].UoMCode,
            "BaseEntry": localStorage.getItem("DocEntry"),
            "BaseLine": posItem[i].LineNum,
            "BaseType": "InventoryTransferRequest",
            "WarehouseCode": localStorage.getItem("wheseID"),
            "FromWarehouseCode": localStorage.getItem("FromWhseID")
            });
          }
          // console.log(oBody);
          oBody = JSON.stringify(oBody);
          $.ajax({
            url: sUrl,
            type: "POST",
            data: oBody,
            headers: {
              'Content-Type': 'application/json'},
            crossDomain: true,
            xhrFields: {withCredentials: true},
            error: function (xhr, status, error) {
              that.closeLoadingFragment();
              sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
              },
            success: function (json) {
             
                    MessageBox.information("Transfer Stock successfully POSTED,\nDoc Number Created:" + json.DocNum, {
                      actions: [MessageBox.Action.OK],
                      title: "Inventory Transfer Stocks",
                      icon: MessageBox.Icon.INFORMATION,
                      styleClass:"sapUiSizeCompact"
                    });
                      that.closeLoadingFragment();
                      this.oModel.setData({InventoryTransfer:[]});
                      this.oModel.updateBindings(true);
                     this.onPressNavback();
                    this.oModel.refresh();
                    
                  },context: this
                });
      
        
      },   

  });
});
