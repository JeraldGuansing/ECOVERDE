sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
  "sap/ui/core/Core"
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox,Fragment,Core) {
  "use strict";
  var gitemUOMcode;
  var fitemUOMcode;
  var listpath;
  var indS;
 
  return Controller.extend("com.ecoverde.ECOVERDE.controller.GRScan", {
  onInit: function(){            
      this.oModel = new JSONModel("model/item.json");
      this.oModel.setSizeLimit(1500);
      this.getView().setModel(this.oModel, "oModel");
      var that = this;
	    var oView = this.getView();

        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().onGetTransactionType();
            },
            onBeforeFirstShow: function(evt) {
                //This event is fired before the NavContainer shows this child control for the first time.
            },
            onBeforeHide: function(evt) {
              
            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                that.initialize(evt.data);
            }
        });

      },


  initialize: function(vFromId){

        this.oModel.setData({UoMCode:[]});
        this.oModel.setSizeLimit(1500);
        this.oModel.updateBindings(true);
        this.oModel = new JSONModel("model/item.json");
        this.getView().setModel(this.oModel, "oModel");

        this.getView().byId("TransactionID").setValue("");
        
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today =  yyyy+ mm + dd;
        this.byId("DP8").setValue(today);
    
        this.onGetTransactionType();
        this.onGetListProject();
        this.onOriginator();
    },

    onScan: function() {
       var that = this;
         cordova.plugins.barcodeScanner.scan(
              function (result) {
                var sBarcode = result.text;
                localStorage.setItem("sBarcode", sBarcode);
               
                that.openLoadingFragment();
                that.onScanBarcode();
              },
              function (error) {
        });
    },

    onScanBarcode: function(){
      var that = this;

      var sServerName = localStorage.getItem("ServerID");
      var vBarcode = localStorage.getItem("sBarcode");
      var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=Barcode eq '" + vBarcode + "'";
  
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          that.oModel.getData().Barcode = response.value;
          that.oModel.refresh();

          that.onGetBarcodeItem();
          that.closeLoadingFragment();
         
        }, error: function() { 
          sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the Scanning Barcode!");
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
    })
        that.closeLoadingFragment()
    },

    onGetBarcodeItem: function(){
      var that = this;
      var vBarcode = localStorage.getItem("sBarcode");
      var gotBarcode = that.oModel.getData().Barcode;
      const oITM = gotBarcode.filter(function(OIT){
      return OIT.Barcode == vBarcode;
      })
      var barItemCode = "";
        if(oITM.length != 0){
        barItemCode = oITM[0].ItemNo;
      }
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=ItemCode eq '" + barItemCode + "'";
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          that.oModel.getData().itemMaster = response.value;
          //UOMDetails
          that.onGetBarcodeUOM();
        }, error: function() { 
          sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the Getting barcode Details!");
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
    })
    },

    onGetBarcodeUOM: function(){
      var that = this;
      var vBarcode = localStorage.getItem("sBarcode");
      var gotBarcode = that.oModel.getData().Barcode;
      const BITM = gotBarcode.filter(function(BIT){
      return BIT.Barcode == vBarcode;
      })
      var barItemCode = "";
      var AbsEntry = "";
       if(gotBarcode.length != 0){ 
      barItemCode = BITM[0].ItemNo;
      AbsEntry = BITM[0].UoMEntry;
      }

      var gotItemDT = that.oModel.getData().itemMaster;
      const oITM = gotItemDT.filter(function(OIT){
      return OIT.ItemCode == barItemCode;
      })
      var ItemName = "";
      if(gotItemDT.length != 0){
      ItemName = oITM[0].ItemName;
      }else{
        sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the Getting barcode details in the system!");
        return;
      }

      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/UnitOfMeasurements?$select=Code,AbsEntry&$filter=AbsEntry eq " + AbsEntry;
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          that.oModel.getData().UoMCode = response.value;
          
          var UoMDetail = that.oModel.getData().UoMCode;
         
          const oUoM = UoMDetail.filter(function(UOM){
          return UOM.AbsEntry == AbsEntry;
          })

          var gUoMCode = oUoM[0].Code;

          var saveData = that.oModel.getData().value;
          const svd = saveData.filter(function(SAVD){
            return SAVD.ItemCode === barItemCode && SAVD.BarCode === vBarcode;
            })
          fitemUOMcode = barItemCode;
          that.onGetPrice();
          var sResult = parseInt(svd.length);
         
          if(sResult === 0){
            that.oModel.getData().value.push({
              "ItemCode":barItemCode, 
              "ItemName": ItemName,
              "BarCode": vBarcode,
              "Price":  "",
              "Quantity": 1,
              "UoMCode": gUoMCode,
              "AbsEntry":AbsEntry
            });
          }else{
            svd[0].Quantity = parseInt(svd[0].Quantity) + 1;
           } 

           //console.log(that.oModel.getData().value);
           that.oModel.refresh();
        }, error: function() { 
          sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the getting UOM Details!");
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
    })

    },

    onConfirmPosting: function(){
      var that = this;
    
      var itemJSON = this.oModel.getData().value;
      if(parseInt(itemJSON.length) == 0){
        sap.m.MessageToast.show("Please Scan/Input item First");
      }
      else{

      MessageBox.information("Are you sure you want to [POST] this transaction?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        title: "POST Goods Receipt w/out PO",
        icon: MessageBox.Icon.QUESTION,
        styleClass:"sapUiSizeCompact",
        onClose: function (sButton) {
          if(sButton === "YES"){
            that.onPostingGR();
            that.onCloseApproval();
          }}
      });
      }
    },
    // ItemGroup
    onPostingGR: function(){
    
      var that = this;
      that.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/InventoryGenEntries";
      var StoredItem = that.oModel.getData().value;

      const OITM = StoredItem.filter(function(ITM){
        return ITM.ItemGroup == 100 || ITM.ItemGroup == 101 || ITM.ItemGroup == 102 || ITM.ItemGroup == 103 || ITM.ItemGroup == 104;
      })
      // console.log(OITM)
      var oBody = {
        "DocDate": that.getView().byId("DP8").getValue(),
        "U_App_GRTransType": that.getView().byId('TransactionID').getValue(),
        "Document_ApprovalRequests": [
          {
              "ApprovalTemplatesID": localStorage.getItem("Appv_GR"),
              "Remarks": sap.ui.getCore().byId("GRremarksID").getValue()
          }
        ],
        "DocumentLines": []
      };          
    
      
      for(var i = 0;i < OITM.length;i++){
        oBody.DocumentLines.push({
          "ItemCode": OITM[i].ItemCode,
          "Quantity": OITM[i].Quantity,
          "UoMEntry": OITM[i].AbsEntry,
          "ProjectCode": this.getView().byId('proj').getSelectedKey(),
          "CostingCode": OITM[i].CostingCode,
          "UoMCode": OITM[i].UoMCode,
          "WarehouseCode": localStorage.getItem("wheseID")
          });
        }
        // console.log(oBody)
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
            },
            success: function (json) { 
              that.closeLoadingFragment();
           
            },context: this
          });
     
          const NITM = StoredItem.filter(function(NTM){
            return NTM.ItemGroup == 105 || NTM.ItemGroup == 106 || NTM.ItemGroup == 107;
          })
          // console.log(NITM)
          var oBody2 = {
            "DocDate": that.getView().byId("DP8").getValue(),
            "U_App_GRTransType": that.getView().byId('TransactionID').getValue(),
            "DocumentLines": []
          };          
        
        if(NITM.length !=0){
          for(var i = 0;i < NITM.length;i++){
            oBody2.DocumentLines.push({
              "ItemCode": NITM[i].ItemCode,
              "Quantity": NITM[i].Quantity,
              "UoMEntry": NITM[i].AbsEntry,
              "UoMCode": NITM[i].UoMCode,
              "ProjectCode": this.getView().byId('proj').getSelectedKey(),
              "WarehouseCode": localStorage.getItem("wheseID")
              });
            }
            // console.log(oBody)
          oBody2 = JSON.stringify(oBody2);       
              $.ajax({
                url: sUrl,
                type: "POST",
                data: oBody2,
                headers: {
                  'Content-Type': 'application/json'},
                crossDomain: true,
                xhrFields: {withCredentials: true},
                error: function (xhr, status, error) {
                  that.closeLoadingFragment();
                },
                success: function (json) { 
                  that.closeLoadingFragment();
                },context: this
            });
        }
            MessageBox.information("Item received successfully: " + NITM.length + "\n" + "Item received for Approval: " + OITM.length, {
              actions: [MessageBox.Action.OK],
              title: "Goods Receipt",
              icon: MessageBox.Icon.INFORMATION,
              styleClass:"sapUiSizeCompact",
              onClose: function () {
                  that.oModel.getData().value = [];
                  that.oModel.refresh();
              }
            })
    },

    onConfirmPosting1: function(){
      var that = this;
    
      var itemJSON = this.oModel.getData().value;
      if(parseInt(itemJSON.length) == 0){
        sap.m.MessageToast.show("Please Scan/Input item First");
      }
      else{

      MessageBox.information("Are you sure you want to [POST] this transaction?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        title: "POST Goods Receipt w/out PO",
        icon: MessageBox.Icon.QUESTION,
        styleClass:"sapUiSizeCompact",
        onClose: function (sButton) {
          if(sButton === "YES"){
            that.onPostingGR1();
            that.onCloseApproval();
          }}
      });
      }
    },
    
    onPostingGR1: function(){
    
      var that = this;
      that.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/InventoryGenEntries";
      var StoredItem = this.oModel.getData().value;
      var oBody = {
        "DocDate": that.getView().byId("DP8").getValue(),
        "U_App_GRTransType": this.getView().byId('TransactionID').getValue(),
        "DocumentLines": []
      };          
      
      for(var i = 0;i < StoredItem.length;i++){
        oBody.DocumentLines.push({
          "ItemCode": StoredItem[i].ItemCode,
          "Quantity": StoredItem[i].Quantity,
          "UoMEntry": StoredItem[i].AbsEntry,
          "CostingCode": OITM[i].CostingCode,
          "UoMCode": StoredItem[i].UoMCode,
          "ProjectCode": this.getView().byId('proj').getSelectedKey(),
          "WarehouseCode": localStorage.getItem("wheseID")
          });
        }
        // console.log(oBody)
      oBody = JSON.stringify(oBody);
      // console.log(oBody);        
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
             
                    MessageBox.information("Item successfully Received,\nNew Doc Number Created:" + json.DocNum, {
                      actions: [MessageBox.Action.OK],
                      title: "Goods Receipt",
                      icon: MessageBox.Icon.INFORMATION,
                      styleClass:"sapUiSizeCompact"
                    });
                      this.oModel.setData({UoMCode:[]});
                      this.oModel.updateBindings(true);
                      this.oModel = new JSONModel("model/item.json");
                      this.getView().setModel(this.oModel, "oModel");

                    this.oModel.refresh();
                    
                    that.closeLoadingFragment();
                  },context: this
                });
              
     },

  onShowApproval: function(){
      var itemJSON = this.oModel.getData().value;
      if(parseInt(itemJSON.length) == 0){
        sap.m.MessageToast.show("Please Input item First");
      }
      else{
      if (!this.GRapprv) {
        this.GRapprv = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.Approvals.GRApproval", this);
        this.getView().addDependent(this.GRapprv);
        this.oModel.refresh();
      }
      sap.ui.getCore().byId("GRremarksID").setValue("");
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
      var itemJSON = that.oModel.getData().value;
      if(parseInt(itemJSON.length) == 0){
        sap.m.MessageToast.show("Please Input item First");
      }
      else{
      var x = [];
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/ApprovalTemplates?$filter=Name eq '" + localStorage.getItem("GRName") + "' and IsActive eq 'tYES'";
    
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
            },
            success: function (json) {
              x  = json.value;
              that.closeLoadingFragment();
            }
          })
         
          if(x.length !=0){
            that.onGetItemGroup();
            that.onShowApproval();
          }else{
            that.onGetItemGroup();
            that.onPostingGR1();
          }
        }
    },

    onOriginator: function(){
      var that = this
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/ApprovalTemplates?$select=IsActive,ApprovalTemplateUsers&$filter=Code eq " + localStorage.getItem("Appv_GR");
     
      $.ajax({
          url: sUrl,
          type: "GET",
          crossDomain: true,
          xhrFields: {
          withCredentials: true},
          error: function (xhr, status, error) {
            that.closeLoadingFragment();
            console.log(error)
            sap.m.MessageToast.show(error);
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
                  title: localStorage.getItem("GRName"),
                  icon: MessageBox.Icon.INFORMATION,
                  styleClass:"sapUiSizeCompact",
                  onClose: function () {
                    that.onMain();
                  }
                });
              }
            }
            that.closeLoadingFragment();
                  }
                })
    },
     
  onWithoutRef: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("goodsReceipt");
      },

  onMain: function(){
        this.router = this.getOwnerComponent().getRouter();
        this.router.navTo("homeScreen");
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

    onCloseAdd: function(){
      if(this.addItemDialog){
          this.addItemDialog.close();
      }
    },

    onAddItem: function(){
    if(this.getView().byId("TransactionID").getValue() == ""){
        sap.m.MessageToast.show("Please Select Transaction Type First");
    }else{
      if (!this.addItemDialog) {
          this.addItemDialog = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.addItem", this);
          this.getView().addDependent(this.addItemDialog);
      }
        this.onGetDimension();
        this.onGetItem();
       // this.onGetUOM();
          sap.ui.getCore().byId("itmID").setValue("");
          sap.ui.getCore().byId("GRdist").setValue("");
          sap.ui.getCore().byId("GRdist").setSelectedKey("");
          sap.ui.getCore().byId("itmID").setSelectedKey("");
          sap.ui.getCore().byId("itmName").setSelectedKey("");
          sap.ui.getCore().byId("uomID").setSelectedKey("");
          sap.ui.getCore().byId("qtyID").setValue("");
          this.addItemDialog.open();
        }
    },

    onGetItem: function(){
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

    onGetPrice: function(){
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Items?$select=MovingAveragePrice,&$filter=ItemCode eq '" + fitemUOMcode + "'";
        $.ajax({
          url: sUrl,
          type: "GET",
          crossDomain: true,
          xhrFields: {
          withCredentials: true
                  },
          error: function (xhr, status, error) {
            this.closeLoadingFragment();
            sap.m.MessageToast(xhr.responseJSON.error.message.value);
          },success: function (json) {
              this.oModel.getData().itemPrice  = json.value[0];
                    this.oModel.refresh();
                    this.closeLoadingFragment();
                  },
                  context: this
                })
                // console.log(this.oModel.getData().itemPrice)
    },

    //next
    onGetAddItem: function(){
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

      var sItmID = sap.ui.getCore().byId("itmID").getValue();
      var sDistR = sap.ui.getCore().byId("GRdist").getValue();
      var sItmName = sap.ui.getCore().byId("itmName").getValue();
      var sQtyID = sap.ui.getCore().byId("qtyID").getValue();
      var sUoMID = sap.ui.getCore().byId("uomID").getValue();
      var AbsEntryID = sap.ui.getCore().byId("uomID").getSelectedKey();


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
      }else if(sDistR == ""){
        sap.m.MessageToast.show("Please input Dist. Rule");
        that.closeLoadingFragment();
        return;
      }else{
        
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 2
        })


        that.onGetPrice();
        ///>>>>>>>GetBarcode
        var StoredBarc = that.oModel.getData().BarcodeUnit; 
        var getStrBarc = "";
        if(StoredBarc.length != 0){
          getStrBarc = StoredBarc[0].Barcode;
        }
       
        var getPR = this.oModel.getData().itemPrice.MovingAveragePrice;

        var getTotalPR = parseInt(getPR) * parseInt(sQtyID);
        
        
        var StoredItem = that.oModel.getData().value;        
        const oITM = StoredItem.filter(function(OIT){
        return OIT.ItemCode == sItmID && OIT.BarCode == getStrBarc && OIT.CostingCode == sDistR;})

      var cResult = parseInt(oITM.length);
      if(cResult == 0){
        that.oModel.getData().value.push({
          "ItemCode": sItmID,
          "ItemName":sItmName,
          "BarCode": getStrBarc,
          "Quantity": sQtyID,
          "ItemPrice": getPR,
          "CostingCode": sDistR, 
          "Price": "",
          "UoMCode": sUoMID,
          "ItemGroup": "",
          "AbsEntry":AbsEntryID
        });
        that.closeLoadingFragment();
      }else{
        oITM[0].Quantity = parseInt(oITM[0].Quantity) + parseInt(sQtyID);
        that.closeLoadingFragment();
      }
      that.closeLoadingFragment();
      that.oModel.refresh();
      that.onCloseAdd();
          }
        }
      }
    }
    },

    onGetBarcodeOnAdd: function(){
      this.openLoadingFragment();
      var that = this;
      var itmCode = sap.ui.getCore().byId("itmID").getValue();
      var AbsEntryID = sap.ui.getCore().byId("uomID").getSelectedKey();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=UoMEntry eq " + AbsEntryID + " and ItemNo eq '" + itmCode + "'";
      var BcodUntContainer = [];
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          BcodUntContainer = response.value;

          that.oModel.getData().BarcodeUnit = BcodUntContainer;
          that.oModel.refresh();
          that.closeLoadingFragment();
        }, error: function() { 
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
    })
        that.closeLoadingFragment()
    },

    onSelectItemCode: function(){
        var itemName = sap.ui.getCore().byId("itmID").getSelectedKey();
        sap.ui.getCore().byId("itmName").setValue(itemName);
        this.openLoadingFragment();
        fitemUOMcode = sap.ui.getCore().byId("itmID").getValue();
        this.onGetListOfAbst();
        // this.onGetListOfUOM();
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
        this.onGetBarcodeOnAdd();
      }

    },

    onvalidationUOMED: function(){

      var StoredUOM = this.oModel.getData().UoMCode;
      const vUOM = StoredUOM.filter(function(UOM){
      return UOM.Code == sap.ui.getCore().byId("iUOMID").getValue();
    })

      if(vUOM.length == 0){
        sap.m.MessageToast.show("Invalid UOM");
        return;
      }else{
        this.onGetBarcodeOnAdd();
      }

    },

    onSelectItemName: function(){
      var itemCode = sap.ui.getCore().byId("itmName").getSelectedKey();
      sap.ui.getCore().byId("itmID").setValue(itemCode);
      //localStorage.setItem("sBarcode", sap.ui.getCore().byId("itmID").getValue());
      this.openLoadingFragment();
      fitemUOMcode = sap.ui.getCore().byId("itmID").getValue();
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

  onPressEdit: function(){
    if (!this.editItem) {
      this.editItem = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.editItem", this);
      this.getView().addDependent(this.editItem);
    }
    this.editItem.open();
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

    sap.ui.getCore().byId("eItemID").setValue(boundData.ItemCode);
    sap.ui.getCore().byId("eItemName").setValue(boundData.ItemName);
    sap.ui.getCore().byId("iUOMID").setValue(boundData.UoMCode);
    sap.ui.getCore().byId("curiUOMID").setValue(boundData.UoMCode);
    sap.ui.getCore().byId("iUOMID").setSelectedKey(boundData.AbsEntry);
    sap.ui.getCore().byId("eQtyID").setValue(boundData.Quantity);

    sap.ui.getCore().byId('eItemID').setEnabled(false);
    sap.ui.getCore().byId('eItemName').setEnabled(false);
   

    sap.ui.getCore().byId("eBarcode").setVisible(false);
    sap.ui.getCore().byId("curiUOMID").setVisible(false);
    // sap.ui.getCore().byId("bttnSave").setEnabled(false);

      
    that.closeLoadingFragment();
  },

  onGetBarcodeOnEdit: function(){
   
    var that = this;
    var itmCode = sap.ui.getCore().byId("eItemID").getValue();
    var AbsEntryID = sap.ui.getCore().byId("iUOMID").getSelectedKey();
    var sServerName = localStorage.getItem("ServerID");
    var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=UoMEntry eq " + AbsEntryID + " and ItemNo eq '" + itmCode + "'";
    var BcodUntContainer = [];
    $.ajax({
      url: sUrl,
      type: "GET",
      dataType: 'json',
      crossDomain: true,
      xhrFields: {
        withCredentials: true},
      success: function(response){
        sap.ui.getCore().byId("bttnSave").setEnabled(true);
        BcodUntContainer = response.value;
        that.oModel.getData().BarcodeUnit = BcodUntContainer;
        //that.oModel.refresh();
      }, error: function(xhr, status, error) { 
        that.closeLoadingFragment()
        console.log(xhr.responseJSON.error.message.value);
      }
  })
 
      that.closeLoadingFragment()
  },

  
  onSaveEdit: function(){
    var StoredUOM = this.oModel.getData().UoMCode;
    const vUOM = StoredUOM.filter(function(UOM){
    return UOM.Code == sap.ui.getCore().byId("iUOMID").getValue();
    })

    if(vUOM.length == 0){
      sap.m.MessageToast.show("Invalid UOM");
      return;
    }else{

    var that = this;
    fitemUOMcode = sap.ui.getCore().byId("eItemID").getValue();
    var editQty = sap.ui.getCore().byId("eQtyID").getValue();
    var editUOM = sap.ui.getCore().byId("iUOMID").getValue();
    if(editQty == "" || editQty <= 0){
      sap.m.MessageToast.show("Please input quantity");
      return;
    }else if(editUOM == ""){
      sap.m.MessageToast.show("Please Select UoM");
      return;
    }

    this.onGetPrice();
    this.openLoadingFragment();
    var StoredItem = that.oModel.getData().value;
    var curItemCode = sap.ui.getCore().byId("eItemID").getValue();
    var curUOM = sap.ui.getCore().byId("curiUOMID").getValue();
    var editAbs = sap.ui.getCore().byId("iUOMID").getSelectedKey();
  
    //get new barcode
    var StoredBar = that.oModel.getData().BarcodeUnit;
    const getupBarC = StoredBar.filter(function(BCD){
    return BCD.ItemNo == curItemCode && BCD.UoMEntry == editAbs;})
    
    var editBarcode;
    if(getupBarC.length != 0 ){
      editBarcode = getupBarC[0].Barcode;
    }
    

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })

    const updelItem = StoredItem.filter(function(OIT){
    return OIT.ItemCode == curItemCode && OIT.UoMCode ==editUOM;})
   
      if(parseInt(updelItem.length) != 0){
        var comPrice;
        if(editUOM == curUOM){
          updelItem[0].Quantity = parseInt(editQty);
          updelItem[0].Price = formatter.format(parseInt(editQty) * parseInt(updelItem[0].ItemPrice));
        }else{
          updelItem[0].Quantity = parseInt(updelItem[0].Quantity) + parseInt(editQty);
          comPrice = parseInt(updelItem[0].Quantity) + parseInt(editQty);
          updelItem[0].Price =  formatter.format(comPrice * parseInt(updelItem[0].ItemPrice));    
          StoredItem.splice(indS,1);  
        }
      
      }else{
        StoredItem[indS].Quantity = editQty;
        StoredItem[indS].Price = formatter.format(parseInt(editQty) * parseInt(StoredItem[indS].ItemPrice)); 
        StoredItem[indS].UoMCode = editUOM;
        StoredItem[indS].AbsEntry = editAbs; 
      
      }
   
      that.oModel.refresh();
      that.closeLoadingFragment();
      that.onCloseEdit();
    }
  },

  onDeleteItem(oEvent){
    var that = this;
    var StoredItem = that.oModel.getData().value;
  
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

  onEnableBttn: function(){
      sap.ui.getCore().byId("bttnSave").setEnabled(true);    
  },

  onCloseEdit: function(){
    if(this.editItem){
        this.editItem.close();
    }
    this.closeLoadingFragment();
  
  },

  onGetTransactionType: function(){
    // this.openLoadingFragment();
    var sServerName = localStorage.getItem("ServerID");
    // var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null'";
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/ExecQuery.xsjs?procName=spAppGetGRType&dbName=" + localStorage.getItem("dbName");
    
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
            this.oModel.getData().GRType  = response;
            this.oModel.refresh();
            this.closeLoadingFragment();
          },
          context: this
        })
  },

  onGetItemGroup: function(){
    var that = this;
    var s = that.oModel.getData().value;  
    for(let g = 0;g< s.length; g++){
  
    this.closeLoadingFragment();
    var sServerName = localStorage.getItem("ServerID");
    var sUrl = sServerName + "/b1s/v1/Items?$select=ItemsGroupCode&$filter=ItemCode eq '" + s[g].ItemCode + "'";
    $.ajax({
      url: sUrl,
      type: "GET",
      dataType: 'json',
      crossDomain: true,
      xhrFields: {
        withCredentials: true},
      success: function(response){
        s[g].ItemGroup = response.value[0].ItemsGroupCode;
        that.oModel.refresh();
      
      }, error: function() { 
        that.closeLoadingFragment()
        console.log("Error Occur");
      }
    })
  
    }
    // console.log(s)
  },

  onGetListProject: function(){
    var that = this;
    this.openLoadingFragment();   
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Projects?$select=Code,Name&$filter=Active eq 'tYES'&$orderby=Code";
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          that.oModel.getData().projectList = response.value;
          that.oModel.refresh();
          that.closeLoadingFragment()
        }, error: function(xhr, status, error) { 
          that.closeLoadingFragment()
          sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
        }
    })
  },


  onGetDimension: function(){
    var that = this;
    var sServerName = localStorage.getItem("ServerID");
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/Dimenstion.xsjs";
  
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
            var OOCR = [];
            var ODIM =  response;
            var count = Object.keys(ODIM).length;
          
            for(let o = 0; o < count;o++){
              OOCR.push({
                "DimDesc": ODIM[o].DimDesc,
                "OcrCode": ODIM[o].OcrCode,
                "OcrName": ODIM[o].OcrName
              });
            }
              that.oModel.getData().DimentionType = OOCR;
              that.oModel.refresh();
              // that.closeLoadingFragment();
          },
          context: this
        })
  },

  });
});
