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
return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsIssuance", {

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
                oView.getController().onGetListProject()
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

        this.getView().byId("TransactionID").setValue("");
        this.getView().byId("projDesc").setValue("");
        
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today = mm + '/' + dd + '/' + yyyy;
        this.byId("DP8").setValue(today);

      this.onGetTransactionType();
      this.onGetListProject();
      this.onOriginator();
      },

onOriginator: function(){
        var that = this
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/ApprovalTemplates?$select=IsActive,ApprovalTemplateUsers&$filter=Code eq " + localStorage.getItem("GI_code");
       
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
                    title: localStorage.getItem("GI_App"),
                    icon: MessageBox.Icon.INFORMATION,
                    styleClass:"sapUiSizeCompact",
                    onClose: function () {
                      that.onPressNavBack();
                    }
                  });
                }
              }
                that.closeLoadingFragment();
                    }
                  })
      },
      
      
onPressIssuance: function(){
        this.router = this.getOwnerComponent().getRouter();
        this.router.navTo("goodsIssuance",null, true);
      },

onPressAdd: function(){
  if(this.getView().byId("TransactionID").getValue() == ""){
    sap.m.MessageToast.show("Please Select Transaction Type First");
    return;
  }else if(this.getView().byId("projDesc").getValue() == ""){
    sap.m.MessageToast.show("Please Select Project First");
    return;
  }

  if (!this.addIssuance) {
    this.addIssuance = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.addIssuance", this);
    this.getView().addDependent(this.addIssuance);
  }

      sap.ui.getCore().byId("isItemCode").setValue("");
      sap.ui.getCore().byId("isItemCode").setSelectedKey("");
      sap.ui.getCore().byId("isItemName").setValue("");
      sap.ui.getCore().byId("isItemName").setSelectedKey("");
      sap.ui.getCore().byId("isUOM").setValue("");
      sap.ui.getCore().byId("isUOM").setSelectedKey("");
      sap.ui.getCore().byId("isQtyID").setValue("");

      this.onGetItemIssue();
      this.addIssuance.open();
},
  
onCloseIssuance: function(){
      if(this.addIssuance){
          this.addIssuance.close();
      }
      // this.closeLoadingFragment();
    
    },

onPressNavBack: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsIssueMenu",null, true);
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

onSaveItem: function(){

  var StoredBar = this.oModel.getData().itemMaster;
  const vOITM = StoredBar.filter(function(OITM){
  return OITM.ItemCode == sap.ui.getCore().byId("isItemCode").getValue();
})

  if(vOITM.length == 0){
    sap.m.MessageToast.show("Invalid Item Code");
    return;
  }else{
   
    var StoredDes = this.oModel.getData().itemMaster;
    const vOITMD = StoredDes.filter(function(OITMD){
    return OITMD.ItemName == sap.ui.getCore().byId("isItemName").getValue();
  })

    if(vOITMD.length == 0){
      sap.m.MessageToast.show("Invalid Item Name");
      return;
    }else{

      var StoredUOM = this.oModel.getData().UoMCode;
      const vUOM = StoredUOM.filter(function(UOM){
      return UOM.Code == sap.ui.getCore().byId("isUOM").getValue();
    })

      if(vUOM.length == 0){
        sap.m.MessageToast.show("Invalid UOM");
        return;
      }else{
  var that = this;
  that.openLoadingFragment();
  var sItmID = sap.ui.getCore().byId("isItemCode").getValue();
  var sItmName = sap.ui.getCore().byId("isItemName").getValue();
  var sUoM = sap.ui.getCore().byId("isUOM").getValue();
  var sUoMEntry = sap.ui.getCore().byId("isUOM").getSelectedKey();
  var sqty = sap.ui.getCore().byId("isQtyID").getValue();
  
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

    var StoredItem = that.oModel.getData().goodsIssue;        
        const oITM = StoredItem.filter(function(OIT){
        return OIT.ItemCode == sItmID && OIT.UoMCode == sUoM;
         }) 
    var cResult = parseInt(oITM.length);
    if(cResult == 0){
     
     
      that.oModel.getData().goodsIssue.push({
        "ProjectCode": this.getView().byId("projDesc").getSelectedKey(),
        "ProjName": this.getView().byId("projDesc").getValue(),
        "ItemCode": sItmID,
        "UnitPrice": "1",
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

onConfirmPosting: function(){
  var that = this;

  var itemJSON = this.oModel.getData().goodsIssue;
  if(parseInt(itemJSON.length) == 0){
    sap.m.MessageToast.show("Please Input item First");
  }
  else{

  MessageBox.information("Are you sure you want to [POST] this transaction?", {
    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
    title: "POST Goods Issue",
    icon: MessageBox.Icon.QUESTION,
    styleClass:"sapUiSizeCompact",
    onClose: function (sButton) {
      if(sButton === "YES"){
        that.onPostIssue();
      }}
  });
  }
},

onPostIssue: function(){
    var that = this;
    that.openLoadingFragment();
    var sServerName = localStorage.getItem("ServerID");
    var sUrl = sServerName + "/b1s/v1/InventoryGenExits";
    var oBody = {
      "DocDate": that.getView().byId("DP8").getValue(),
      "U_App_GITransType": this.getView().byId('TransactionID').getValue(),
      "Document_ApprovalRequests": [
        {
            "ApprovalTemplatesID": localStorage.getItem("GI_App"),
            "Remarks": sap.ui.getCore().byId("remarksID").getValue()
        }
      ],
      "DocumentLines": []};
    var posItem = this.oModel.getData().goodsIssue;
    var x = posItem.length;

    for(var i = 0; i < x; i++){
    oBody.DocumentLines.push({
      "ProjectCode":posItem[i].ProjectCode,
      "ItemCode":posItem[i].ItemCode,
      "Quantity":posItem[i].Quantity,
      "UoMEntry":posItem[i].UoMEntry,
      "UoMCode":posItem[i].UoMCode,
      "WarehouseCode":localStorage.getItem("wheseID")
      });
    }
    this.onCloseApproval();
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
        // sap.m.MessageToast.show("Unable to post the Item: " + xhr.responseJSON.error.message.value);
        MessageBox.information("this transaction is for approval", {
          actions: [MessageBox.Action.OK],
          title: "Goods Issue",
          icon: MessageBox.Icon.INFORMATION,
          styleClass:"sapUiSizeCompact"
        });
        this.oModel.getData().goodsIssue = [];
        this.oModel.refresh();
         
      },
      success: function (json) {
       
              MessageBox.information("Items successfully Issued,\nDoc Number Created:" + json.DocNum, {
                actions: [MessageBox.Action.OK],
                title: "Goods Issue",
                icon: MessageBox.Icon.INFORMATION,
                styleClass:"sapUiSizeCompact"
              });
              this.oModel.getData().goodsIssue = [];
              this.oModel.refresh();
              that.closeLoadingFragment();
            },context: this
          });

 
},

onConfirmPosting1: function(){
  var that = this;

  var itemJSON = this.oModel.getData().goodsIssue;
  if(parseInt(itemJSON.length) == 0){
    sap.m.MessageToast.show("Please Input item First");
  }
  else{

  MessageBox.information("Are you sure you want to [POST] this transaction?", {
    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
    title: "POST Goods Issue",
    icon: MessageBox.Icon.QUESTION,
    styleClass:"sapUiSizeCompact",
    onClose: function (sButton) {
      if(sButton === "YES"){
        that.onPostIssue1();
      }}
  });
  }
},

onPostIssue1: function(){
  var that = this;
  that.openLoadingFragment();
  var sServerName = localStorage.getItem("ServerID");
  var sUrl = sServerName + "/b1s/v1/InventoryGenExits";
  var oBody = {
    "DocDate": that.getView().byId("DP8").getValue(),
    "U_App_GITransType": this.getView().byId('TransactionID').getValue(),
    "DocumentLines": []};
  var posItem = this.oModel.getData().goodsIssue;
  var x = posItem.length;
  for(var i = 0; i < x; i++){
  oBody.DocumentLines.push({
    "ProjectCode":posItem[i].ProjectCode,
    "ItemCode":posItem[i].ItemCode,
    "UnitPrice":posItem[i].UnitPrice,
    "Quantity":posItem[i].Quantity,
    "UoMEntry":posItem[i].UoMEntry,
    "UoMCode":posItem[i].UoMCode,
    "WarehouseCode":localStorage.getItem("wheseID")
    });
  }
  this.onCloseApproval();
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
      sap.m.MessageToast.show("Unable to post the Item: " + xhr.responseJSON.error.message.value);       
    },
    success: function (json) {
            MessageBox.information("Items successfully Issued,\nDoc Number Created:" + json.DocNum, {
              actions: [MessageBox.Action.OK],
              title: "Goods Issue",
              icon: MessageBox.Icon.INFORMATION,
              styleClass:"sapUiSizeCompact"
            });
            this.oModel.getData().goodsIssue = [];
            this.oModel.refresh();
            that.closeLoadingFragment();
          },context: this
        });


},

onShowApproval: function(){
  var itemJSON = this.oModel.getData().goodsIssue;
  if(parseInt(itemJSON.length) == 0){
    sap.m.MessageToast.show("Please Input item First");
  }
  else{
  if (!this.apprv) {
    this.apprv = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.Approvals.approval", this);
    this.getView().addDependent(this.apprv);
    this.oModel.refresh();
  }
  sap.ui.getCore().byId("remarksID").setValue("");
  this.apprv.open();
  }

},

onCloseApproval: function(){
  if(this.apprv){
      this.apprv.close();
  }
},

onCheckPost: function(){
  var that = this;

  var itemJSON = that.oModel.getData().goodsIssue;
  if(parseInt(itemJSON.length) == 0){
    sap.m.MessageToast.show("Please Input item First");
  }
  else{
  var x = [];
  var sServerName = localStorage.getItem("ServerID");
  var sUrl = sServerName + "/b1s/v1/ApprovalTemplates?$filter=Name eq '" + localStorage.getItem("GI_App") + "' and IsActive eq 'tYES'";
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
      if(x.length !=0 || x.length != null){
        that.onShowApproval();
      }else{
        that.onConfirmPosting1();
      }
    }
},

onGetItemIssue: function(){
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
                    if(parseInt(ITM[o].OnHand) != 0){
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
                  }
                    that.oModel.getData().itemMaster = OITM;
                    that.oModel.refresh();
                    that.closeLoadingFragment();
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


onSelectItemCode: function(){
      var itemName = sap.ui.getCore().byId("isItemCode").getSelectedKey();
      sap.ui.getCore().byId("isItemName").setValue(itemName);
      this.openLoadingFragment();
      fitemUOMcode = sap.ui.getCore().byId("isItemCode").getValue();
      this.onGetListOfAbst();
      // this.onGetListOfUOM();
  },
  

onSelectItemName: function(){
    var itemCode = sap.ui.getCore().byId("isItemName").getSelectedKey();
    sap.ui.getCore().byId("isItemCode").setValue(itemCode);
    //localStorage.setItem("sBarcode", sap.ui.getCore().byId("itmID").getValue());
    this.openLoadingFragment();
    fitemUOMcode = sap.ui.getCore().byId("isItemCode").getValue();
    this.onGetListOfAbst();
    // getBarcode here
  },

  onSelectUoM: function(){
    var that = this;
    itmBar =  sap.ui.getCore().byId("isItemCode").getValue();
    uomntry = sap.ui.getCore().byId("isUOM").getSelectedKey();
    that.onGetBarcode(); 
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
    
   
    sap.ui.getCore().byId("eidsCodeID").setValue(boundData.ItemCode);
    sap.ui.getCore().byId("idisCodeName").setValue(boundData.ItemName);
    sap.ui.getCore().byId("idisUoM").setValue(boundData.UoMCode);
    sap.ui.getCore().byId("idisQty").setValue(boundData.Quantity);

    sap.ui.getCore().byId('eidsCodeID').setEnabled(false);
    sap.ui.getCore().byId('idisCodeName').setEnabled(false);
    sap.ui.getCore().byId('idisUoM').setEnabled(false);
 
    this.closeLoadingFragment();
    
  },


onSaveEdit: function(){
  var StoredItem = this.oModel.getData().goodsIssue; 
  StoredItem[indS].Quantity = sap.ui.getCore().byId("idisQty").getValue();;
  this.closeLoadingFragment();
  this.onCloseEdit()
},

  onPressEdit: function(){
    if (!this.editIssuance) {
      this.editIssuance = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.editIssuance", this);
      this.getView().addDependent(this.editIssuance);
      this.oModel.refresh();
    }

    this.editIssuance.open();
  },

  onCloseEdit: function(){
    if(this.editIssuance){
        this.editIssuance.close();
    }
  },

  onDeleteItem(){
    var that = this;
    var StoredItem = that.oModel.getData().goodsIssue;
  
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
  
        var saveData = that.oModel.getData().goodsIssue;
        const svd = saveData.filter(function(SAVD){
          return SAVD.ItemCode === barItemCode && SAVD.BarCode === vBarcode;
          })
  
        var sResult = parseInt(svd.length);
       
        if(sResult === 0){
          that.oModel.getData().goodsIssue.push({
            "ProjectCode": localStorage.getItem("ProjCode"),
            "ProjName": localStorage.getItem("ProjName"),
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

  onGetTransactionType: function(){
    // this.openLoadingFragment();
    var sServerName = localStorage.getItem("ServerID");
    // var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null'";
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/ExecQuery.xsjs?procName=spAppGetGIType&dbName=" + localStorage.getItem("dbName");
    
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
          beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));

          },
          success: function (response) {
            this.oModel.getData().GIType  = response;
            this.oModel.refresh();
            this.closeLoadingFragment();
          },
          context: this
        })
  },

  onGetListProject: function(){
    var that = this;
    // this.openLoadingFragment();   
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Projects?$select=Code,Name&$filter=Active eq 'tYES'";
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


  onvalidationCode: function(){

    var StoredBar = this.oModel.getData().itemMaster;
    const vOITM = StoredBar.filter(function(OITM){
    return OITM.ItemCode == sap.ui.getCore().byId("isItemCode").getValue();
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
    return OITM.ItemName == sap.ui.getCore().byId("isItemName").getValue();
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
    return UOM.Code == sap.ui.getCore().byId("isUOM").getValue();
  })

    if(vUOM.length == 0){
      sap.m.MessageToast.show("Invalid UOM");
      return;
    }else{
      this.onSelectUoM();
    }

  },

  });
});
