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
        // this.oModel.setData({UoMCode:[]});
        // this.oModel.updateBindings(true);
        this.oModel = new JSONModel("model/item.json");
        this.getView().setModel(this.oModel, "oModel");

        this.getView().byId("projDesc").setText(localStorage.getItem("ProjName"));
        this.getView().byId("Vcode").setText(localStorage.getItem("VendorCode"));
        this.getView().byId("Vname").setText(localStorage.getItem("VendorName"));


        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today = mm + '/' + dd + '/' + yyyy;
        this.byId("DP8").setValue(today);

      },

onPressIssuance: function(){
        this.router = this.getOwnerComponent().getRouter();
        this.router.navTo("goodsIssuance");
      },

 

onPressAdd: function(){
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
      this.router.navTo("goodsIssueMenu");
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
        "ProjectCode": localStorage.getItem("ProjCode"),
        "ProjName": localStorage.getItem("ProjName"),
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
    var oBody = {"DocumentLines": []};
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
        sap.m.MessageToast.show("Unable to post the Item");
        },
      success: function (json) {
       
              MessageBox.information("Items successfully Issued,\nDoc Number Created:" + json.DocNum, {
                actions: [MessageBox.Action.OK],
                title: "Goods Issue",
                icon: MessageBox.Icon.INFORMATION,
                styleClass:"sapUiSizeCompact"
              });
                this.oModel.setData({goodsIssuance:[]});
                this.oModel.updateBindings(true);
                this.oModel = new JSONModel("model/item.json");
                this.getView().setModel(this.oModel, "oModel");

              this.oModel.refresh();
              
              that.closeLoadingFragment();
            },context: this
          });

 
},

onGetItemIssue: function(){
  this.openLoadingFragment();
  var sServerName = localStorage.getItem("ServerID");
  var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null' and Mainsupplier eq '" + localStorage.getItem("VendorCode") + "'&$orderby=ItemCode";
  
  $.ajax({
    url: sUrl,
        type: "GET",
        crossDomain: true,
        xhrFields: {
        withCredentials: true
        },
        error: function (xhr, status, error) {
          this.closeLoadingFragment();
          console.log("Error Occured" + xhr.responseJSON.error.message.value);
        },
        success: function (json) {
          this.oModel.getData().itemMaster  = json.value;

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

  });
});
