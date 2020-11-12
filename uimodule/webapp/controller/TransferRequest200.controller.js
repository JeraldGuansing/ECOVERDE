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
  return Controller.extend("com.ecoverde.ECOVERDE.controller.TransferRequest200", {
    
    onInit: function(){
      var oView = this.getView();
      oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().onDisplayItem();
            },
            onBeforeFirstShow: function(evt) {
                //This event is fired before the NavContainer shows this child control for the first time.
            },
            onBeforeHide: function(evt) {
                //This event is fired every time before the NavContainer hides this child control.
            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                oView.getController().initialize();
          
            }
        });
    },

    onDisplayItem: function(){
      
      var odta = JSON.parse(sessionStorage.getItem("TRequest"));
      this.oModel.getData().TransferRequest = odta;
      // console.log(this.oModel.getData().TransferRequest)
      this.oModel.refresh();
    },

    initialize: function(){
      
      this.oModel = new JSONModel("model/item.json");
      this.getView().setModel(this.oModel, "oModel");
  

      this.getView().byId("fromWID").setValue(localStorage.getItem("wheseNm"));
      this.getView().byId("toWID").setValue(localStorage.getItem("FromWhseNM"));

      this.getView().byId("fromWID").setEnabled(false);
      this.getView().byId("toWID").setEnabled(false);
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today =  yyyy+ mm + dd;
      this.byId("DP8").setValue(today);

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
			this.router.navTo("warehouseReport",null, true);
      },

      onPressAddI: function(){
        
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
       
      },

onGetItemReq: function(){
        this.openLoadingFragment();
          var that = this;
          var sServerName = localStorage.getItem("ServerID");
          var xsjsServer = sServerName.replace("50000", "4300");
          var sUrl = xsjsServer + "/app_xsjs/InventoryItem.xsjs?whse=" + localStorage.getItem("wheseID");
          $.ajax({
            url: sUrl,
                type: "GET",
                beforeSend: function (xhr) {
                  xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));
                  },
                crossDomain: true,
                xhrFields: {
                withCredentials: true
                },
                error: function (xhr, status, error) {
                  this.closeLoadingFragment();
                  console.log("Error Occured");
                },
                success: function (response) {
                  var OITM = [];
                  var ITM =  response;
                  var count = Object.keys(ITM).length;
                
                  for(let o = 0; o < count;o++){
                    OITM.push({
                      ItemCode: ITM[o].ItemCode,
                      ItemName: ITM[o].ItemName,
                      BarCode: ITM[o].BarCode,
                      Series: ITM[o].Series,
                      WhsCode: ITM[o].WhsCode,
                      WhsName: ITM[o].WhsName,
                      OnHand: ITM[o].OnHand,
                      IsCommited: ITM[o].OnHand,
                      OnOrder: ITM[o].OnOrder
                    });
                  }
                    that.oModel.getData().itemMaster = OITM;
                    that.oModel.refresh();
                    that.closeLoadingFragment();
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

onvalidationCode: function(){

        var StoredBar = this.oModel.getData().itemMaster;
        const vOITM = StoredBar.filter(function(OITM){
        return OITM.ItemCode == sap.ui.getCore().byId("itmID").getValue();
      })
     
        if(vOITM.length == 0){
          sap.m.MessageToast.show("Invalid Item Code");
          return;
        }else{
          this.onSelectItemCode();
        }
      },
  
onvalidationDesk: function(){
        var StoredBar = this.oModel.getData().itemMaster;
        const vOITM = StoredBar.filter(function(OITM){
        return OITM.ItemName == sap.ui.getCore().byId("itmName").getValue();
      })
  
        if(vOITM.length == 0){
          sap.m.MessageToast.show("Invalid Item Name");
          return;
        }else{
          this.onSelectItemName();
        }
  
      },
  
  
onvalidationUOM: function(){
  
        var StoredUOM = this.oModel.getData().UoMCode;
        const vUOM = StoredUOM.filter(function(UOM){
        return UOM.Code == sap.ui.getCore().byId("uomID").getValue();
      })
  
        if(vUOM.length == 0){
          sap.m.MessageToast.show("Invalid UOM");
          return;
        }else{
          this.onGetListOfUOM();
        }
  
      },

onSaveAddItem: function(){
          var that = this;
          var StoredBar = that.oModel.getData().itemMaster;
          const vOITM = StoredBar.filter(function(OITM){
          return OITM.ItemCode == sap.ui.getCore().byId("itmID").getValue();
        })
       
          if(vOITM.length == 0){
            sap.m.MessageToast.show("Invalid Item Code");
            return;
          }else{
           
            var StoredDes = that.oModel.getData().itemMaster;
            const vOITMD = StoredDes.filter(function(OITMD){
            return OITMD.ItemName == sap.ui.getCore().byId("itmName").getValue();
          })
      
            if(vOITMD.length == 0){
              sap.m.MessageToast.show("Invalid Item Name");
              return;
            }else{
      
              var StoredUOM = that.oModel.getData().UoMCode;
              const vUOM = StoredUOM.filter(function(UOM){
              return UOM.Code == sap.ui.getCore().byId("uomID").getValue();
            })
        
              if(vUOM.length == 0){
                sap.m.MessageToast.show("Invalid UOM");
                return;
              }else{

          that.openLoadingFragment();
          var sItmID = sap.ui.getCore().byId("reqtemCode").getValue();
          var sItmName = sap.ui.getCore().byId("reqItemName").getValue();
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
        }
      }
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
            "FromWarehouse": localStorage.getItem("FromWhseID"),
            "ToWarehouse": localStorage.getItem("wheseID"),  
            "DocDate": that.getView().byId("DP8").getValue(),
            "StockTransferLines": []};          
          
          var StoredItem = this.oModel.getData().TransferRequest;
          for(var i = 0;i < StoredItem.length;i++){
            if(StoredItem[i].Quantity !=0){
            oBody.StockTransferLines.push({
              "ItemCode": StoredItem[i].ItemCode,
              "Quantity": StoredItem[i].Quantity,
              "UoMEntry": StoredItem[i].AbsEntry,
              "UoMCode": StoredItem[i].UoMCode,
              "WarehouseCode": localStorage.getItem("wheseID"),
              "FromWarehouseCode": localStorage.getItem("FromWhseID")
              });
              }
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
                          
                       
                        this.oModel.refresh();
                      
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
    fitemUOMcode = boundData.ItemCode;
    that.onGetListOfAbst();
    that.onGetListOfUOM();
  
      sap.ui.getCore().byId("rptCodeID").setValue(boundData.ItemCode);
      sap.ui.getCore().byId("rptCodeName").setValue(boundData.ItemName);
      sap.ui.getCore().byId("rptuomID").setValue(boundData.UoMCode);
      sap.ui.getCore().byId("rptOldUOM").setValue(boundData.UoMCode);
      sap.ui.getCore().byId("rptuomID").setSelectedKey(boundData.AbsEntry);
      sap.ui.getCore().byId("rptQty").setValue(boundData.Quantity);
  
      sap.ui.getCore().byId('rptCodeID').setEnabled(false);
      sap.ui.getCore().byId('rptCodeName').setEnabled(false);
     
      sap.ui.getCore().byId("rptOldUOM").setVisible(false);
          
      that.closeLoadingFragment();
          
        },
      
  onPressEdit: function(){
          if (!this.rptWH) {
            this.rptWH = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.WarehouseReport.editRptWH", this);
            this.getView().addDependent(this.rptWH);
          }
          this.rptWH.open();
        },
    
  onSaveEdit: function(){
   
          var that = this;
          var editQty = sap.ui.getCore().byId("rptQty").getValue();
          var editUOM = sap.ui.getCore().byId("rptuomID").getValue();
          if(editQty == "" || editQty <= 0){
            sap.m.MessageToast.show("Please input quantity");
            return;
          }else if(editUOM == ""){
            sap.m.MessageToast.show("Please Select UoM");
            return;
          }
          this.openLoadingFragment();
          var StoredItem = that.oModel.getData().TransferRequest;
          var curItemCode = sap.ui.getCore().byId("rptCodeID").getValue();
          var curUOM = sap.ui.getCore().byId("rptOldUOM").getValue();
          var editAbs = sap.ui.getCore().byId("rptuomID").getSelectedKey();
        
          //get new barcode
          var StoredBar = that.oModel.getData().BarcodeUnit;
          const getupBarC = StoredBar.filter(function(BCD){
          return BCD.ItemNo == curItemCode && BCD.UoMEntry == editAbs;})
          
          var editBarcode;
          if(getupBarC.length != 0 ){
            editBarcode = getupBarC[0].Barcode;
          }
      
          const updelItem = StoredItem.filter(function(OIT){
          return OIT.ItemCode == curItemCode && OIT.UoMCode ==editUOM;})
      
            if(parseInt(updelItem.length) != 0){
              
              if(editUOM == curUOM){
                updelItem[0].Quantity = parseInt(editQty);
              }else{
                updelItem[0].Quantity = parseInt(updelItem[0].Quantity) + parseInt(editQty);
                StoredItem.splice(indS,1);   
              }
             
            }else{
              StoredItem[indS].Quantity = editQty;
              StoredItem[indS].UoMCode = editUOM;
              StoredItem[indS].AbsEntry = editAbs; 
            }
             
            that.oModel.refresh();
            that.closeLoadingFragment();
            that.onCloseEdit();
        },    
      
  onCloseEdit: function(){
          if(this.rptWH){
              this.rptWH.close();
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
     
  onGetListOfAbst: function(){
          var that = this;
          gitemUOMcode = fitemUOMcode;
         
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=ItemNo eq '" + gitemUOMcode + "'";
          $.ajax({
            url: sUrl,
            type: "GET",
            dataType: 'json',
            async: false,
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
        // console.log(that.oModel.getData().UoMEntry)
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
                      async: false,
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
                  // console.log(that.oModel.getData().UoMCode)
            }
    },

  });
});
