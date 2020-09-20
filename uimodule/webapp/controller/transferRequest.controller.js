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
  var listpath;
  var indS;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.transferRequest", {
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
   
      
      this.getView().byId("fromWID").setValue(localStorage.getItem("wheseID"));
      this.getView().byId("fromWID").setEnabled(false);
      this.getView().byId("toWID").setEnabled(true);
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today =  yyyy+ mm + dd;
      this.byId("DP8").setValue(today);

      this.ongetWHSEList();
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
			this.router.navTo("transferView");
      },

  ongetWHSEList: function(){
        var that = this;
        that.openLoadingFragment();
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/Warehouses?$select=WarehouseCode,WarehouseName&$filter=WarehouseCode ne '" + localStorage.getItem("wheseID") + "'";
        
        $.ajax({
          url: sUrl,
          type: "GET",
          headers: {
            'Content-Type': 'application/json'},
          crossDomain: true,
          xhrFields: {withCredentials: true},
          error: function (xhr, status, error) {
            that.closeLoadingFragment();
            sap.m.MessageToast.show("Unable to retrieve data:"  + xhr.responseJSON.error.message.value);
            },
          success: function (json) {
            that.oModel.getData().warehouses = json.value;
            that.oModel.refresh();
                  
            that.closeLoadingFragment();
                },context: this
              });
            
      },

      onPressAddI: function(){
        if(this.getView().byId("toWID").getValue() == ""){
          sap.m.MessageToast.show("Please select warehouse first");
        }else{
        if (!this.transferReq) {
          this.transferReq = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.transferRequest", this);
          this.getView().addDependent(this.transferReq);
        }
        this.openLoadingFragment();
        sap.ui.getCore().byId("reqtemCode").setValue("");
        sap.ui.getCore().byId("reqtemCode").setSelectedKey("");
        sap.ui.getCore().byId("reqItemName").setValue("");
        sap.ui.getCore().byId("reqItemName").setSelectedKey("");
        sap.ui.getCore().byId("reqUOM").setValue("");
        sap.ui.getCore().byId("reqUOM").setSelectedKey("");
        sap.ui.getCore().byId("reqQtyID").setValue("");
        this.onGetItemReq();
        this.transferReq.open();
        this.closeLoadingFragment();
       }
      },

      onGetItemReq: function(){
        
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null' or BarCode ne ''&$orderby=ItemCode";
        
        $.ajax({
          url: sUrl,
              type: "GET",
              crossDomain: true,
              xhrFields: {
              withCredentials: true
              },
              error: function (xhr, status, error) {
                this.closeLoadingFragment();
                console.log("Error Occured" +  xhr.responseJSON.error.message.value);
              },
              success: function (json) {
                this.oModel.getData().itemMaster  = json.value;
                this.oModel.refresh();
               
              },
              context: this
            })
      
        },

        onCloseAddI: function(){
          if(this.transferReq){
              this.transferReq.close();
          }
          this.closeLoadingFragment();
        
        },

      onSelectItemCode: function(){
          var itemName = sap.ui.getCore().byId("reqtemCode").getSelectedKey();
          sap.ui.getCore().byId("reqItemName").setValue(itemName);
          this.openLoadingFragment();
          fitemUOMcode = sap.ui.getCore().byId("reqtemCode").getValue();
          this.onGetListOfAbst();
          // this.onGetListOfUOM();
      },
      
      onSelectItemName: function(){
        var itemCode = sap.ui.getCore().byId("reqItemName").getSelectedKey();
        sap.ui.getCore().byId("reqtemCode").setValue(itemCode);
        
        this.openLoadingFragment();
        fitemUOMcode = sap.ui.getCore().byId("reqtemCode").getValue();
        this.onGetListOfAbst();
        // getBarcode here
      },


      onGetListOfAbst: function(){
        var that = this;
        gitemUOMcode = fitemUOMcode;
       
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=ItemNo eq '" + gitemUOMcode + "'";
        $.ajax({
          url: sUrl,
          type: "GET",
          dataType: 'json',
          crossDomain: true,
          xhrFields: {
            withCredentials: true},
          success: function(response){
            that.oModel.getData().UoMEntry = response.value;
            that.oModel.refresh();
            that.onGetListOfUOM();
          }, error: function() { 
            that.closeLoadingFragment()
            console.log("Error Occur");
          }
      })
      //Get UOMList
      
        },
    
        onGetListOfUOM: function(){
        var that = this;
      
        var sServerName = localStorage.getItem("ServerID");
        var abslist = that.oModel.getData().UoMEntry;
        var UoMContainer = [];
        for(var i = 0;i < parseInt(abslist.length);i++){ 
              var absNo = abslist[i].UoMEntry; 
              var sUrl = sServerName + "/b1s/v1/UnitOfMeasurements?$select=Code,AbsEntry&$filter=AbsEntry eq " + absNo;
              $.ajax({
                url: sUrl,
                type: "GET",
                dataType: 'json',
                crossDomain: true,
                xhrFields: {
                  withCredentials: true},
                success: function(response){
                  var getresult = response.value;
                  UoMContainer.push({
                    "Code": getresult[0].Code,
                    "AbsEntry": getresult[0].AbsEntry
                  })
                  that.oModel.getData().UoMCode = UoMContainer;
                  that.oModel.refresh();
                 that.closeLoadingFragment();
                }, error: function() { 
                  that.closeLoadingFragment()
                  console.log("Error Occur");
                }
            })
          }
        },

  onSaveAddItem: function(){
          var that = this;
          that.openLoadingFragment();
          var sItmID = sap.ui.getCore().byId("reqtemCode").getValue();
          var sItmName = sap.ui.getCore().byId("reqtemCode").getValue();
          var sQtyID = sap.ui.getCore().byId("reqQtyID").getValue();
          var sUoMID = sap.ui.getCore().byId("reqUOM").getValue();
          var AbsEntryID = sap.ui.getCore().byId("reqUOM").getSelectedKey();
          var toWhseCode = this.getView().byId("toWID").getSelectedKey();
          if(sItmID == ""){
            sap.m.MessageToast.show("Please select Item Code");
            that.closeLoadingFragment();
            return;
          }else if(sItmName == ""){
            sap.m.MessageToast.show("Please select Item Name");
            that.closeLoadingFragment();
            return;
          }else if(sUoMID == ""){
            sap.m.MessageToast.show("Please select Item UoM");
            that.closeLoadingFragment();
            return;
          }else if(sQtyID == "" || sQtyID <= 0 ){
            sap.m.MessageToast.show("Please input quantity");
            that.closeLoadingFragment();
            return;
          }else{
    
            ///>>>>>>>GetBarcode
            var StoredBarc = that.oModel.getData().BarcodeUnit; 
            var getStrBarc = "";
            if(StoredBarc.length != 0){
              getStrBarc = StoredBarc[0].Barcode;
            }
            
            var StoredItem = that.oModel.getData().TransferRequest;        
            const oITM = StoredItem.filter(function(OIT){
            return OIT.ItemCode == sItmID && OIT.BarCode == getStrBarc;
             })
          var cResult = parseInt(oITM.length);
          if(cResult == 0){
            that.oModel.getData().TransferRequest.push({
              "ItemCode": sItmID,
              "ItemName":sItmName,
              "BarCode": getStrBarc,
              "Quantity": sQtyID,
              "UoMCode": sUoMID,
              "AbsEntry":AbsEntryID,
              "WarehouseCode": toWhseCode
            });
            that.closeLoadingFragment();
          }else{
            oITM[0].Quantity = parseInt(oITM[0].Quantity) + parseInt(sQtyID);
            that.closeLoadingFragment();
          }
          that.closeLoadingFragment();

          this.getView().byId("toWID").setEnabled(false);
          that.oModel.refresh();
          that.onCloseAddI();
          }
          
        },

        onConfirmPosting: function(){
          var that = this;
        
          var itemJSON = this.oModel.getData().TransferRequest;
          if(parseInt(itemJSON.length) == 0){
            sap.m.MessageToast.show("Please Scan/Input item First");
          }
          else{
    
          MessageBox.information("Are you sure you want to [POST] this transaction?", {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            title: "Transfer Request",
            icon: MessageBox.Icon.QUESTION,
            styleClass:"sapUiSizeCompact",
            onClose: function (sButton) {
              if(sButton === "YES"){
                that.onPostingGR();
              }}
          });
          }
        },
        
  onPostingGR: function(){
        
          var that = this;
          that.openLoadingFragment();
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/InventoryTransferRequests";
          var oBody = {
            "FromWarehouse":  localStorage.getItem("wheseID"),
            "ToWarehouse": that.getView().byId("toWID").getSelectedKey(),  
            "DocDate": that.getView().byId("DP8").getValue(),
            "StockTransferLines": []};          
          
          var StoredItem = this.oModel.getData().TransferRequest;
          for(var i = 0;i < StoredItem.length;i++){
            oBody.StockTransferLines.push({
              "ItemCode": StoredItem[i].ItemCode,
              "Quantity": StoredItem[i].Quantity,
              "UoMEntry": StoredItem[i].AbsEntry,
              "UoMCode": StoredItem[i].UoMCode,
              "WarehouseCode": that.getView().byId("toWID").getSelectedKey(),
              "FromWarehouseCode": localStorage.getItem("wheseID")
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
                  sap.m.MessageToast.show("Unable to post the Item: " + xhr.responseJSON.error.message.value);
                  },
                success: function (json) {
                 
                        MessageBox.information("Transfer Request success,\nNew Doc Number Created:" + json.DocNum, {
                          actions: [MessageBox.Action.OK],
                          title: "Transfer Request",
                          icon: MessageBox.Icon.INFORMATION,
                          styleClass:"sapUiSizeCompact"
                        });
                          this.oModel.setData({UoMCode:[]});
                          this.oModel.updateBindings(true);
                          this.oModel = new JSONModel("model/item.json");
                          this.getView().setModel(this.oModel, "oModel");
    
                        this.oModel.refresh();
                        this.getView().byId("toWID").setEnabled(true);
                        that.closeLoadingFragment();
                      },context: this
                    });
                  
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
          
         
          sap.ui.getCore().byId("reqEItemC").setValue(boundData.ItemCode);
          sap.ui.getCore().byId("reqEItemN").setValue(boundData.ItemName);
          sap.ui.getCore().byId("reqEItemU").setValue(boundData.UoMCode);
          sap.ui.getCore().byId("reqEItemQ").setValue(boundData.Quantity);
      
          sap.ui.getCore().byId('reqEItemC').setEnabled(false);
          sap.ui.getCore().byId('reqEItemN').setEnabled(false);
          sap.ui.getCore().byId('reqEItemU').setEnabled(false);
       
          this.closeLoadingFragment();
          
        },
      
      
      onSaveEdit: function(){
        var StoredItem = this.oModel.getData().TransferRequest; 
        StoredItem[indS].Quantity = sap.ui.getCore().byId("reqEItemQ").getValue();
        this.oModel.refresh();
        this.closeLoadingFragment();
        this.onCloseEdit()
      },
      
        onPressEdit: function(){
          if (!this.onEditReq) {
            this.onEditReq = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.onEditRequest", this);
            this.getView().addDependent(this.onEditReq);
          }
          this.onEditReq.open();
        },
      
        onCloseEdit: function(){
          if(this.onEditReq){
              this.onEditReq.close();
          }
        },
      
        onDeleteItem(){
          var that = this;
          var StoredItem = that.oModel.getData().TransferRequest;
        
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
         
  });
});
