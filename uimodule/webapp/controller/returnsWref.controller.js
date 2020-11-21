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
  var listpath;
  var indS;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.returnsWref", {

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

    var str = localStorage.getItem("VendorName");
    var res = str.substring(0, 18);

    oView.byId("docID").setText(localStorage.getItem("DocNo"));
    oView.byId("Vcode").setText(localStorage.getItem("VendorCode"));
    oView.byId("Vname").setText(res);


    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today =  yyyy+ mm + dd;
    this.byId("DP8").setValue(today);

    this.onReturnList();
    this.getPODetails();
   
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


onPressNavBack: function(){
    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("goodsReturnList",null, true);
  },

  onReturnList: function(){
    var that = this;
    that.openLoadingFragment();
    var docID = localStorage.getItem("DocNo");
    var sServerName = localStorage.getItem("ServerID");
    var sUrl = sServerName + "/b1s/v1/PurchaseDeliveryNotes?$select=DocumentLines&$filter=DocNum eq " + docID;
  
    $.ajax({
      url: sUrl,
      type: "GET",
      dataType: 'json',
      crossDomain: true,
      xhrFields: {
        withCredentials: true},
      success: function(response){
      
      try {
        const returnITM = response.value[0].DocumentLines.filter(function(RTI){
        return RTI.LineStatus == "bost_Open"})
        that.oModel.getData().goodsReturn  = returnITM;
        
      }catch(err) {
        that.initialize();
        console.log(err);
      }
       that.oModel.refresh();
       that.closeLoadingFragment();
      }, error: function(response) { 
        console.log(response);
        that.closeLoadingFragment();
      }
  })
  },

  onPressItem: function(oEvent){
    var that = this;
    that.onPressEdit();

    var myInputControl = oEvent.getSource(); // e.g. the first item
    var boundData = myInputControl.getBindingContext('oModel').getObject();
    listpath = myInputControl.getBindingContext('oModel').getPath();
    var indexItem = listpath.split("/");
    indS =indexItem[2];

    sap.ui.getCore().byId("retgItemCode").setValue(boundData.ItemCode);
    sap.ui.getCore().byId("retgItemName").setValue(boundData.ItemDescription);
    sap.ui.getCore().byId("retgQtyID").setValue(boundData.RemainingOpenQuantity);
    sap.ui.getCore().byId("retgUoM").setValue(boundData.UoMCode);

    sap.ui.getCore().byId('retgUoM').setEnabled(false);
    sap.ui.getCore().byId('retgItemCode').setEnabled(false);
    sap.ui.getCore().byId('retgItemName').setEnabled(false);

  },

  onPressEdit: function(){
    if (!this.grpoRet) {
      this.grpoRet = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.returnsWrefedit", this);
      this.getView().addDependent(this.grpoRet);
    }
    this.grpoRet.open();
  },

  onSavereturn: function(){
    var rITM = this.oModel.getData().goodsReturn;
    rITM[indS].RemainingOpenQuantity = sap.ui.getCore().byId("retgQtyID").getValue();
    this.oModel.refresh();
    this.onCloseAdd();
  },

  onCloseAdd: function(){
    if(this.grpoRet){
        this.grpoRet.close();
    }
  },

  onConfirmPosting: function(){
    var that = this;
    MessageBox.information("Are you sure you want to [POST] this transaction?", {
      actions: [MessageBox.Action.YES, MessageBox.Action.NO],
      title: "POST Goods Return",
      icon: MessageBox.Icon.QUESTION,
      styleClass:"sapUiSizeCompact",
      onClose: function (sButton) {
        if(sButton === "YES"){
          that.onPostingReturn();
        }}
    });
    },
  


  onPostingReturn: function(){
    var that = this;
      var oView = that.getView();
      that.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/PurchaseReturns";
      var oBody = {
        "CardCode": localStorage.getItem("VendorCode"),
        "DocDate": oView.byId("DP8").getValue(),
        "DocumentLines": []};          
      
      var StoredItem = this.oModel.getData().goodsReturn;
      for(var i = 0;i < StoredItem.length;i++){
        if(StoredItem[i].Quantity !=0){      
          oBody.DocumentLines.push({
            "ItemCode": StoredItem[i].ItemCode,
            "Quantity": StoredItem[i].RemainingOpenQuantity,
            "TaxCode": StoredItem[i].TaxCode,
            "UnitPrice": StoredItem[i].UnitPrice,  
            "BaseEntry" : localStorage.getItem("DocEntry"),
            "BaseType": "20",
            "BaseLine": StoredItem[i].LineNum,
            "WarehouseCode": localStorage.getItem("wheseID")
          });
        }
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
          sap.m.MessageToast.show("Unable to post the Item:\n" + xhr.responseJSON.error.message.value);
          },
        success: function (json) {
          //console.log(json);
          that.closeLoadingFragment();
                MessageBox.information("Item successfully return \nCreated Doc number:" + json.DocNum, {
                  actions: [MessageBox.Action.OK],
                  title: "Goods Return",
                  icon: MessageBox.Icon.INFORMATION,
                  styleClass:"sapUiSizeCompact",
                  onClose: function () {
                    that.onReturnOpenPO();
                    that.OnReOPOR();
                    that.onPressNavBack();
                    
                  }
                });
              
              },context: this
            });
     
  },

handleLoadItems: function(oControlEvent) {
    oControlEvent.getSource().getBinding("items").resume();
  },

getPODetails: function(){
  var that = this;
  that.openLoadingFragment();
  var sServerName = localStorage.getItem("ServerID");
  var sUrl = sServerName + "/b1s/v1/PurchaseOrders?$select=DocumentLines&$filter=DocEntry eq " + localStorage.getItem("BaseEntry");

  $.ajax({
    url: sUrl,
    type: "GET",
    dataType: 'json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true},
    success: function(response){
      var returnITM = response.value[0].DocumentLines;
      that.oModel.getData().PurchaseOrder  = returnITM;
      that.oModel.refresh();
      that.closeLoadingFragment();
    }, error: function(response) { 
      console.log(response);
      that.closeLoadingFragment();
    }
  })

},

onReturnOpenPO: function(){
      var that = this;
      var storeRet = that.oModel.getData().PurchaseOrder;
      for(let r = 0; r < storeRet.length; r++){
        var greturn = that.oModel.getData().goodsReturn;
        const returnOTM = greturn.filter(function(ITM){
            return ITM.ItemCode == storeRet[r].ItemCode
            })
          // console.log(returnOTM)
        if(parseInt(returnOTM.length) != 0){

        var retQty = parseInt(returnOTM[0].RemainingOpenQuantity);
        if(retQty != 0){
              var OpenQtyC = parseInt(storeRet[r].RemainingOpenQuantity) + retQty;
              var ItmCode = storeRet[r].ItemCode;
            
              var sServerName = localStorage.getItem("ServerID");
              var xsjsServer = sServerName.replace("50000", "4300");
              var sUrl = xsjsServer + "/app_xsjs/ReOpenItem.xsjs?OpnQty=" + OpenQtyC + "&InvQty=" +  OpenQtyC  + "&OpnCreQty=" +  OpenQtyC  + "&docNum= " + localStorage.getItem("BaseEntry") + "&itmCode=" + ItmCode;
            
                $.ajax({
                url: sUrl,
                type: "POST",
                crossDomain: true,
                beforeSend: function (xhr) {
                  xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:" + localStorage.getItem("XSPass")));    
                },
                xhrFields: {
                  withCredentials: true
                },
                error: function (xhr, status, error) {
                  this.closeLoadingFragment();
                  console.log("Error Occured:" + xhr.responseJSON.error.message.value);
                },
                success: function (response) {
                console.log(response)
                that.closeLoadingFragment();
                }
              });
        }
       }
      }
    },

    OnReOPOR: function(){
        var that = this;  
        var sServerName = localStorage.getItem("ServerID");
        var xsjsServer = sServerName.replace("50000", "4300");
        var sUrl = xsjsServer + "/app_xsjs/ReOpenPO.xsjs?docNum=" + localStorage.getItem("BaseEntry");
          
        $.ajax({
            url: sUrl,
            type: "POST",
            dataType: 'json',
            crossDomain: true,
            beforeSend: function (xhr) {
              xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));
            },
            xhrFields: {
              withCredentials: true},
            success: function(response){
              sap.m.MessageToast.show("Purchase Order has been opened");
            }, error: function() { 
              that.closeLoadingFragment()
              console.log("Error Occur");
            }
        })
    },

  });
});
