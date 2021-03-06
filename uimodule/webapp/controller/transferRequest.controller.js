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
  var WddCode;
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
      this.oModel.setSizeLimit(1500);
      this.getView().setModel(this.oModel, "oModel");
   
      this.getView().byId("toWID").setValue(localStorage.getItem("wheseNm"));
      this.getView().byId("toWID").setEnabled(false);
      this.getView().byId("fromWID").setEnabled(true);
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today =  yyyy+ mm + dd;
      this.byId("DP8").setValue(today);

      this.ongetWHSEList();
      this.onOriginator();
    },

    onOriginator: function(){
      var that = this
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/ApprovalTemplates?$select=IsActive,ApprovalTemplateUsers&$filter=Code eq " + localStorage.getItem("Appv_TR");
     
      $.ajax({
          url: sUrl,
          type: "GET",
          crossDomain: true,
          xhrFields: {
          withCredentials: true},
          error: function (xhr, status, error) {
            that.closeLoadingFragment();
            console.log(error)
          },success: function (json) {
            var resultH = json.value[0].IsActive;
            if(resultH == "tYES"){
              var resultB = json.value[0].ApprovalTemplateUsers;
              const oApv = resultB.filter(function(apv){
              return apv.UserID == localStorage.getItem("UserKeyID")
              })

              that.closeLoadingFragment();
              if(parseInt(oApv.length) == 0 ){
                MessageBox.information("Your User is not authorized to use this transaction,\nPlease contact your administrator to include your\nUser in Originator of this approval template", {
                  actions: [MessageBox.Action.OK],
                  title: localStorage.getItem("TRName"),
                  icon: MessageBox.Icon.INFORMATION,
                  styleClass:"sapUiSizeCompact",
                  onClose: function () {
                    that.onPressNavback();
                  }
                  });
                }
              }
              that.closeLoadingFragment();
            }
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
			this.router.navTo("transferView",null, true);
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
        if(this.getView().byId("fromWID").getValue() == ""){
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
    this.openLoadingFragment();
      var that = this;
    
      var sServerName = localStorage.getItem("ServerID");
      var xsjsServer = sServerName.replace("50000", "4300");
      var sUrl = xsjsServer + "/app_xsjs/InventoryTransfer.xsjs?whsefrom=" + that.getView().byId("fromWID").getSelectedKey() + "&whseto=" + localStorage.getItem("wheseID");
    
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
                if(ITM[o].FROMWHSE != 0 && ITM[o].TOWHSE){
                  OITM.push({
                    "ItemCode": ITM[o].ItemCode,
                    "ItemName": ITM[o].ItemName,
                    "WhseInv": "(" + ITM[o].FROMWHSE + ") / (" + ITM[o].TOWHSE + ")"
                  });
                }
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
          this.closeLoadingFragment();
          // this.onGetListOfUOM();
      },
      
      onSelectItemName: function(){
        var itemCode = sap.ui.getCore().byId("reqItemName").getSelectedKey();
        sap.ui.getCore().byId("reqtemCode").setValue(itemCode);
        
        this.openLoadingFragment();
        fitemUOMcode = sap.ui.getCore().byId("reqtemCode").getValue();
        this.onGetListOfAbst();
        this.closeLoadingFragment();
        // getBarcode here
      },

      onvalidationCode: function(){

        var StoredBar = this.oModel.getData().itemMaster;
        const vOITM = StoredBar.filter(function(OITM){
        return OITM.ItemCode == sap.ui.getCore().byId("reqtemCode").getValue();
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
        return OITM.ItemName == sap.ui.getCore().byId("reqItemName").getValue();
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
        return UOM.Code == sap.ui.getCore().byId("reqUOM").getValue();
      })
  
        if(vUOM.length == 0){
          sap.m.MessageToast.show("Invalid UOM");
          return;
        }else{
          this.onGetListOfUOM();
        }
  
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
              
                }, error: function() { 
                  that.closeLoadingFragment()
                  console.log("Error Occur");
                }
            })
          }
        },

  onSaveAddItem: function(){
          var that = this;

          var StoredBar = that.oModel.getData().itemMaster;
          const vOITM = StoredBar.filter(function(OITM){
          return OITM.ItemCode == sap.ui.getCore().byId("reqtemCode").getValue();
        })
       
          if(vOITM.length == 0){
            sap.m.MessageToast.show("Invalid Item Code");
            return;
          }else{
           
            var StoredDes = that.oModel.getData().itemMaster;
            const vOITMD = StoredDes.filter(function(OITMD){
            return OITMD.ItemName == sap.ui.getCore().byId("reqItemName").getValue();
          })
      
            if(vOITMD.length == 0){
              sap.m.MessageToast.show("Invalid Item Name");
              return;
            }else{
      
              var StoredUOM = that.oModel.getData().UoMCode;
              const vUOM = StoredUOM.filter(function(UOM){
              return UOM.Code == sap.ui.getCore().byId("reqUOM").getValue();
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
            title: "Transfer Request Confirmation",
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
            "FromWarehouse": that.getView().byId("fromWID").getSelectedKey(),
            "ToWarehouse": localStorage.getItem("wheseID"),
            "JournalMemo": that.getView().byId("remarksTR").getValue(),  
            "DocDate": that.getView().byId("DP8").getValue(),
            "U_App_WhseFrom": that.getView().byId("fromWID").getSelectedKey(),
            "StockTransfer_ApprovalRequests": [
              {
                  "ApprovalTemplatesID": localStorage.getItem("Appv_TR"),
                  "Remarks": sap.ui.getCore().byId("TRremarksID").getValue()
              }
            ],
            "StockTransferLines": []
          };          
          
          var StoredItem = this.oModel.getData().TransferRequest;
          for(var i = 0;i < StoredItem.length;i++){
            oBody.StockTransferLines.push({
              "ItemCode": StoredItem[i].ItemCode,
              "Quantity": StoredItem[i].Quantity,
              "UoMEntry": StoredItem[i].AbsEntry,
              "UoMCode": StoredItem[i].UoMCode,
              "WarehouseCode": localStorage.getItem("wheseID"),
              "FromWarehouseCode": that.getView().byId("fromWID").getSelectedKey()
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
                  // sap.m.MessageToast.show("Unable to post the Item: " + xhr.responseJSON.error.message.value);
                  MessageBox.information("This transaction is for approval", {
                    actions: [MessageBox.Action.OK],
                    title: "Transfer Request",
                    icon: MessageBox.Icon.INFORMATION,
                    styleClass:"sapUiSizeCompact"
                  });
                  that.oModel.getData().TransferRequest = [];
                  that.oModel.refresh();
                  that.getView().byId("fromWID").setEnabled(true);
                  that.OnSelectWddCode()
                  that.onCloseApproval();  
                  },
                success: function (json) {
                        that.closeLoadingFragment();
                        that.onCloseApproval();
                      },context: this
                  });
                 
         },

onConfirmPosting1: function(){
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
                that.onPostingGR1();
              }}
          });
          }
        },
        
onPostingGR1: function(){
          var that = this;
          that.openLoadingFragment();
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/InventoryTransferRequests";
          var oBody = {
            "FromWarehouse": that.getView().byId("fromWID").getSelectedKey(),
            "ToWarehouse": localStorage.getItem("wheseID"),
            "JournalMemo": that.getView().byId("remarksTR").getValue(),    
            "DocDate": that.getView().byId("DP8").getValue(),
            "U_App_WhseFrom": that.getView().byId("fromWID").getSelectedKey(),
            "StockTransferLines": []
          };          
          
          var StoredItem = this.oModel.getData().TransferRequest;
          for(var i = 0;i < StoredItem.length;i++){
            oBody.StockTransferLines.push({
              "ItemCode": StoredItem[i].ItemCode,
              "Quantity": StoredItem[i].Quantity,
              "UoMEntry": StoredItem[i].AbsEntry,
              "UoMCode": StoredItem[i].UoMCode,
              "WarehouseCode": localStorage.getItem("wheseID"),
              "FromWarehouseCode": that.getView().byId("fromWID").getSelectedKey()
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
                        this.oModel.getData().TransferRequest = [];
                        this.oModel.refresh();
                        this.getView().byId("fromWID").setEnabled(true);
                        that.closeLoadingFragment();
                      },context: this
                    });
                  
         },

onShowApproval: function(){
          var itemJSON = this.oModel.getData().TransferRequest;
          if(parseInt(itemJSON.length) == 0){
            sap.m.MessageToast.show("Please Input item First");
          }
          else{
          if (!this.GRapprv) {
            this.GRapprv = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.Approvals.TRApproval", this);
            this.getView().addDependent(this.GRapprv);
            this.oModel.refresh();
          }
          sap.ui.getCore().byId("TRremarksID").setValue("");
          this.GRapprv.open();
          }
        
        },
        
onCloseApproval: function(){
          if(this.GRapprv){
              this.GRapprv.close();
          }
        },
        
onCheckPost: function(){
          var that = this;
          var itemJSON = that.oModel.getData().TransferRequest;
          if(parseInt(itemJSON.length) == 0){
            sap.m.MessageToast.show("Please Input item First");
          }
          else{
          var x = [];
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/ApprovalTemplates?$filter=Name eq '" + localStorage.getItem("TRName") + "' and IsActive eq 'tYES'";
          $.ajax({
            url: sUrl,
                type: "GET",
                dataType: 'json',
                async: false,
                crossDomain: true,
                xhrFields: {
                withCredentials: true
                },
                error: function (xhr, status, error) {
                  that.closeLoadingFragment();
                  console.log("Error Occured" + xhr.responseJSON.error.message.value);
                  //sap.m.MessageToast.show("Please check approval template setup for  [GI Approval]");
                  // return;
                },
                success: function (json) {
                  x  = json.value;
                  that.closeLoadingFragment();
                },
                context: that
              })
              if(x.length !=0){
                that.onShowApproval();
              }else{
                that.onConfirmPosting1();
              }
            }
        },

OnSelectWddCode: function(){
  var that = this;
    var sServerName = localStorage.getItem("ServerID");
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/SelectTR.xsjs?uid="+ localStorage.getItem("UserKeyID") + "&tmplc=" + localStorage.getItem("Appv_TR");
    
    $.ajax({
      url: sUrl,
      type: "GET",
      dataType: 'json',
      crossDomain: true,
      beforeSend: function (xhr) {
        xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));
      },
      xhrFields: {
        withCredentials: true},
      success: function(response){
        var OTRN = [];
        var ITR =  response;
        var count = Object.keys(ITR).length;
       
        for(let o = 0; o < count;o++){
          OTRN.push({
            "WddCode": ITR[o].WddCode
          });
        }
          WddCode = OTRN[0].WddCode;
          console.log(WddCode)
          that.onUpdateRemarks();
      }, error: function() { 
        that.closeLoadingFragment()
        console.log("Error Occur");
      }
  })
},

onUpdateRemarks: function(){
  var sServerName = localStorage.getItem("ServerID");
  var xsjsServer = sServerName.replace("50000", "4300");
  var sUrl = xsjsServer + "/app_xsjs/UpdateTR.xsjs?rmks=" + sap.ui.getCore().byId("TRremarksID").getValue() +"&intCode=" + WddCode;
  
  $.ajax({
    url: sUrl,
        type: "POST",
        beforeSend: function (xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:" + localStorage.getItem("XSPass")));    
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
          // console.log(response)
          this.closeLoadingFragment();
        },
        context: this
      })
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
