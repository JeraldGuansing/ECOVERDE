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
  var itmBar;
  var uomntry;
  var listpath;
  var indS;
  var iBarc;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsReturn", {
  onInit: function(){            
      this.oModel = new JSONModel("model/item.json");
      this.getView().setModel(this.oModel, "oModel");
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
              
            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                that.initialize(evt.data);
            }
        });

      },

initialize: function(vFromId){
        this.oModel = new JSONModel("model/item.json");
        this.getView().setModel(this.oModel, "oModel");
        var oView = this.getView();
        oView.byId("Vcode").setText(localStorage.getItem("VendorCode"));
        oView.byId("Vname").setText(localStorage.getItem("VendorName"));

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today =  yyyy+ mm + dd;
        this.byId("DP8").setValue(today);

      },


onPressNavBack: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsIssueMenu",null, true);
    },

onPressAddr: function(){
      if (!this.addgoodsReturn) {
        this.addgoodsReturn = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.addGoodsReturn", this);
        this.getView().addDependent(this.addgoodsReturn);
      }

      sap.ui.getCore().byId("retItemCode").setValue("");
      sap.ui.getCore().byId("retItemCode").setSelectedKey("");
      sap.ui.getCore().byId("retItemName").setValue("");
      sap.ui.getCore().byId("retItemName").setSelectedKey("");
      sap.ui.getCore().byId("retUOM").setValue("");
      sap.ui.getCore().byId("retUOM").setSelectedKey("");
      sap.ui.getCore().byId("retQtyID").setValue("");
      this.onGetItemRet();
      this.addgoodsReturn.open();
    },

onSaveItem: function(){
      var that = this;

      var StoredBar = that.oModel.getData().itemMaster;
      const vOITM = StoredBar.filter(function(OITM){
      return OITM.ItemCode == sap.ui.getCore().byId("retItemCode").getValue();
    })
   
      if(vOITM.length == 0){
        sap.m.MessageToast.show("Invalid Item Code");
        return;
      }else{
       
        var StoredDes = that.oModel.getData().itemMaster;
        const vOITMD = StoredDes.filter(function(OITMD){
        return OITMD.ItemName == sap.ui.getCore().byId("retItemName").getValue();
      })
  
        if(vOITMD.length == 0){
          sap.m.MessageToast.show("Invalid Item Name");
          return;
        }else{
  
          var StoredUOM = that.oModel.getData().UoMCode;
          const vUOM = StoredUOM.filter(function(UOM){
          return UOM.Code == sap.ui.getCore().byId("retUOM").getValue();
        })
    
          if(vUOM.length == 0){
            sap.m.MessageToast.show("Invalid UOM");
            return;
          }else{


      that.openLoadingFragment();
      var sItmID = sap.ui.getCore().byId("retItemCode").getValue();
      var sItmName = sap.ui.getCore().byId("retItemName").getValue();
      var sUoM = sap.ui.getCore().byId("retUOM").getValue();
      var sUoMEntry = sap.ui.getCore().byId("retUOM").getSelectedKey();
      var sqty = sap.ui.getCore().byId("retQtyID").getValue();
      
      if(sItmID == ""){
        sap.m.MessageToast.show("Please select Item Code");
        that.closeLoadingFragment();
        return;
      }else if(sItmName == ""){
        sap.m.MessageToast.show("Please select Item Name");
        that.closeLoadingFragment();
        return;
      }else if(sUoM == ""){
        sap.m.MessageToast.show("Please select UoM");
        that.closeLoadingFragment();
        return;
      }else if(sqty == "" || sqty <= 0){
        sap.m.MessageToast.show("Please Input Item Quantity");
        that.closeLoadingFragment();
        return;
      }else{
    
        var StoredItem = that.oModel.getData().goodsReturn;        
            const oITM = StoredItem.filter(function(OIT){
            return OIT.ItemCode == sItmID && OIT.UoMCode == sUoM && OIT.sCardName == sCardName;
             }) 
        var cResult = parseInt(oITM.length);
        if(cResult == 0){
         
          that.oModel.getData().goodsReturn.push({
            "ItemCode": sItmID,
            "ItemName": sItmName,
            "Quantity": sqty,
            "UoMCode": sUoM,
            "UoMEntry": sUoMEntry,
            "Barcode": iBarc
          });
          that.closeLoadingFragment();
        }else{
          oITM[0].Quantity = parseInt(oITM[0].Quantity) + parseInt(sqty);
          that.closeLoadingFragment();
        }
        that.closeLoadingFragment();
        that.oModel.refresh();
        that.onCloseIssuance();
      }
       }
      }
    }
    },

  

onCloseIssuance: function(){
      if(this.addgoodsReturn){
          this.addgoodsReturn.close();
      }
      // this.closeLoadingFragment();
    
    },

onGetItemRet: function(){
      this.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var xsjsServer = sServerName.replace("50000", "4300");
      var sUrl = xsjsServer + "/app_xsjs/ExecQuery.xsjs?procName=spAppGetAllItems&dbName=" + localStorage.getItem("dbName");  
    
      $.ajax({
        url: sUrl,
            type: "GET",
            crossDomain: true,
            xhrFields: {
            withCredentials: true
            },
            beforeSend: function (xhr) {
              xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd810~"));
            },
            error: function (xhr, status, error) {
              this.closeLoadingFragment();
              sap.m.MessageToast(xhr.responseJSON.error.message.value);
              console.log(xhr.responseJSON.error.message.value);
            },
            success: function (json) {
              this.oModel.getData().itemMaster  = json;
              this.oModel.refresh();
              this.closeLoadingFragment();
            },
            context: this
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
            that.closeLoadingFragment()
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
            that.closeLoadingFragment();
          }
          
        },

onGetBarcode: function(){
      
          var that = this;
          var itmCode = itmBar;
          var AbsEntryID = uomntry;
      
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
              iBarc = [BcodUntContainer[0].Barcode];
              that.closeLoadingFragment();
            }, error: function() { 
              that.closeLoadingFragment()
              console.log("Error Occur");
            }
        })
            that.closeLoadingFragment()
        },      
        
onSelectItemCode: function(){
          var itemName = sap.ui.getCore().byId("retItemCode").getSelectedKey();
          sap.ui.getCore().byId("retItemName").setValue(itemName);
          this.openLoadingFragment();
          fitemUOMcode = sap.ui.getCore().byId("retItemCode").getValue();
          this.onGetListOfAbst();
          // this.onGetListOfUOM();
      },


onConfirmPosting: function(){
        var itemJSON = this.oModel.getData().goodsReturn;
        if(parseInt(itemJSON.length) == 0){
          sap.m.MessageToast.show("Please Input item First");
        }
        else{
        var that = this;
        MessageBox.information("Are you sure you want to [POST] this transaction?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          title: "POST Goods Return",
          icon: MessageBox.Icon.QUESTION,
          styleClass:"sapUiSizeCompact",
          onClose: function (sButton) {
            if(sButton === "YES"){
              that.onPostreturn();
            }}
        });
      }
        },
      
onPostreturn: function(){
      
          var that = this;
          that.openLoadingFragment();
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/PurchaseReturns";
          var oBody = {
            "CardCode": localStorage.getItem("VendorCode"),
            "DocDate": that.getView().byId("DP8").getValue(),
            "Document_ApprovalRequests": [
              {
                  "ApprovalTemplatesID": 10,
                  "Remarks": sap.ui.getCore().byId("RTremarksID").getValue()
              }
            ],
            "DocumentLines": []};
          var posItem = this.oModel.getData().goodsReturn;
  
          var x = posItem.length;
          for(var i = 0; i < x; i++){
          oBody.DocumentLines.push({
            "ItemCode":posItem[i].ItemCode,
            "Quantity":posItem[i].Quantity,
            "UoMEntry":posItem[i].UoMEntry,
            "UoMCode": posItem[i].UoMCode,
            "WarehouseCode": localStorage.getItem("wheseID")
            });
          }
          console.log(oBody);
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
              // sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
              MessageBox.information("This transaction is for approval", {
                actions: [MessageBox.Action.OK],
                title: "Transfer Request",
                icon: MessageBox.Icon.INFORMATION,
                styleClass:"sapUiSizeCompact"
              });
              that.oModel.getData().goodsReturn = [];
              that.oModel.refresh();
              that.onCloseApproval();  

              },
            success: function (json) {
                    this.oModel.refresh();
                    that.closeLoadingFragment();
                  },context: this
                });
      
        
      },  

onConfirmPosting1: function(){
        var itemJSON = this.oModel.getData().goodsReturn;
        if(parseInt(itemJSON.length) == 0){
          sap.m.MessageToast.show("Please Input item First");
        }
        else{
        var that = this;
        MessageBox.information("Are you sure you want to [POST] this transaction?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          title: "POST Goods Return",
          icon: MessageBox.Icon.QUESTION,
          styleClass:"sapUiSizeCompact",
          onClose: function (sButton) {
            if(sButton === "YES"){
              that.onPostreturn1();
            }}
        });
      }
        },
      
onPostreturn1: function(){
      
          var that = this;
          that.openLoadingFragment();
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/PurchaseReturns";
          var oBody = {
            "CardCode": localStorage.getItem("VendorCode"),
            "DocDate": that.getView().byId("DP8").getValue(),
            "DocumentLines": []};
          var posItem = this.oModel.getData().goodsReturn;
  
          var x = posItem.length;
          for(var i = 0; i < x; i++){
          oBody.DocumentLines.push({
            "ItemCode":posItem[i].ItemCode,
            "Quantity":posItem[i].Quantity,
            "UoMEntry":posItem[i].UoMEntry,
            "UoMCode": posItem[i].UoMCode,
            "WarehouseCode": localStorage.getItem("wheseID")
            });
          }
          console.log(oBody);
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
             
                    MessageBox.information("Items successfully returned,\nDoc Number Created:" + json.DocNum, {
                      actions: [MessageBox.Action.OK],
                      title: "Goods Return",
                      icon: MessageBox.Icon.INFORMATION,
                      styleClass:"sapUiSizeCompact"
                    });
                      this.oModel.setData({goodsReturn:[]});
                      this.oModel.updateBindings(true);
                      this.oModel = new JSONModel("model/item.json");
                      this.getView().setModel(this.oModel, "oModel");
      
                    this.oModel.refresh();
                    
                    that.closeLoadingFragment();
                  },context: this
                });
      
        
      },  

onShowApproval: function(){
        var itemJSON = this.oModel.getData().goodsReturn;
        if(parseInt(itemJSON.length) == 0){
          sap.m.MessageToast.show("Please Input item First");
        }
        else{
        if (!this.RTapprv) {
          this.RTapprv = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.Approvals.RTApproval", this);
          this.getView().addDependent(this.RTapprv);
          this.oModel.refresh();
        }
        sap.ui.getCore().byId("RTremarksID").setValue("");
        this.RTapprv.open();
        }
      
      },
      
onCloseApproval: function(){
        if(this.RTapprv){
            this.RTapprv.close();
        }
      },
      
onCheckPost: function(){
        var that = this;
      
        var itemJSON = that.oModel.getData().goodsReturn;
        if(parseInt(itemJSON.length) == 0){
          sap.m.MessageToast.show("Please Input item First");
        }
        else{
        var x = [];
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/ApprovalTemplates?$filter=Name eq '" + "Return 01" + "' and IsActive eq 'tYES'";
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
    
onSelectItemName: function(){
        var itemCode = sap.ui.getCore().byId("retItemName").getSelectedKey();
        sap.ui.getCore().byId("retItemCode").setValue(itemCode);
        //localStorage.setItem("sBarcode", sap.ui.getCore().byId("itmID").getValue());
        this.openLoadingFragment();
        fitemUOMcode = sap.ui.getCore().byId("retItemCode").getValue();
        this.onGetListOfAbst();
        // getBarcode here
      },
    
onSelectUoM: function(){
        var that = this;
        itmBar =  sap.ui.getCore().byId("retItemCode").getValue();
        uomntry = sap.ui.getCore().byId("retUOM").getSelectedKey();
        that.onGetBarcode(); 
      },

onvalidationCode: function(){

        var StoredBar = this.oModel.getData().itemMaster;
        const vOITM = StoredBar.filter(function(OITM){
        return OITM.ItemCode == sap.ui.getCore().byId("retItemCode").getValue();
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
        return OITM.ItemName == sap.ui.getCore().byId("retItemName").getValue();
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
        return UOM.Code == sap.ui.getCore().byId("retUOM").getValue();
      })
  
        if(vUOM.length == 0){
          sap.m.MessageToast.show("Invalid UOM");
          return;
        }else{
          this.onSelectUoM();
        }
  
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
        
       
        sap.ui.getCore().byId("editCodeRet").setValue(boundData.ItemCode);
        sap.ui.getCore().byId("editNameRet").setValue(boundData.ItemName);
        sap.ui.getCore().byId("editUoMRet").setValue(boundData.UoMCode);
        sap.ui.getCore().byId("editQtyRet").setValue(boundData.Quantity);
    
        sap.ui.getCore().byId('editCodeRet').setEnabled(false);
        sap.ui.getCore().byId('editNameRet').setEnabled(false);
        sap.ui.getCore().byId('editUoMRet').setEnabled(false);
     
        this.closeLoadingFragment();
        
      },
    
    
onSaveEdit: function(){
      var StoredItem = this.oModel.getData().goodsReturn; 
      StoredItem[indS].Quantity = sap.ui.getCore().byId("editQtyRet").getValue();
      this.oModel.refresh();
      this.closeLoadingFragment();
      this.onCloseEdit()
    },
    
onPressEdit: function(){
        if (!this.editReturn) {
          this.editReturn = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.editReturn", this);
          this.getView().addDependent(this.editReturn);
          this.oModel.refresh();
        }
        this.editReturn.open();
      },
    
onCloseEdit: function(){
        if(this.editReturn){
            this.editReturn.close();
        }
      },
    
onDeleteItem(){
        var that = this;
        var StoredItem = that.oModel.getData().goodsReturn;
      
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
       var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=Barcode eq '" + vBarcode + "' and Mainsupplier eq '" + localStorage.getItem("VendorCode") + "'";
      
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
      
            var saveData = that.oModel.getData().goodsReturn;
            const svd = saveData.filter(function(SAVD){
              return SAVD.ItemCode === barItemCode && SAVD.BarCode === vBarcode;
              })
      
            var sResult = parseInt(svd.length);
           
            if(sResult === 0){
              that.oModel.getData().goodsReturn.push({
                "ItemCode":barItemCode, 
                "ItemName": ItemName,
                "Barcode": vBarcode,
                "Quantity": 1,
                "UoMCode": gUoMCode,
                "UoMEntry":AbsEntry
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

  });
});
