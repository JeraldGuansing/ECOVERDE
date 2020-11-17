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
  var ids;
  var isActive;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.TransferRequestDraft", {
    onInit: function(){            
      var that = this;
	    var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().onGetToDraftBody();
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

      initialize: function(){
        
        this.oModel = new JSONModel("model/item.json");
        this.getView().setModel(this.oModel, "oModel");

        this.getView().byId("toWID").setEnabled(false);
        this.getView().byId('toWID').setValue(localStorage.getItem("wheseNm"));
        // this.getView().byId("ProjID").setEnabled(false);
        
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today =  yyyy+ mm + dd;
        this.byId("DP8").setValue(today);
        // this.ongetFromWhse()
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

    onAlert: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("appAlert");
        },


    onGetToDraftBody: function(){
        var that = this;
        this.openLoadingFragment();   
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/Drafts?$select=DocumentLines&$filter=DocEntry eq " + localStorage.getItem("DocEntry");
          $.ajax({
            url: sUrl,
            type: "GET",
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
              withCredentials: true},
            success: function(response){
        
              that.oModel.getData().GRDraftsB = response.value[0].DocumentLines;
              that.oModel.refresh();
              that.closeLoadingFragment()

            }, error: function(xhr, status, error) { 
              that.closeLoadingFragment()
              sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
            }
        })
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

    onConfirmPosting: function(){
      var that = this;
    
      var itemJSON = this.oModel.getData().GRDraftsB;
      if(parseInt(itemJSON.length) == 0){
        sap.m.MessageToast.show("Please Scan/Input item First");
      }
      else{

      MessageBox.information("Are you sure you want to [POST] this transaction?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        title: "POST Goods Receipt",
        icon: MessageBox.Icon.QUESTION,
        styleClass:"sapUiSizeCompact",
        onClose: function (sButton) {
          if(sButton === "YES"){
            that.openLoadingFragment();
            ids = localStorage.getItem("Appv_TR");
            isActive = "N";
            that.onactivateAlert();
            that.onPostingTR();
          }}
      });
      }
    },

    onPostingTR: function(){
      var that = this;
      that.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/InventoryTransferRequests";
      var oBody = {
        "FromWarehouse": that.getView().byId("fromWID").getSelectedKey(),
        "ToWarehouse": localStorage.getItem("wheseID"),  
        "DocDate": that.getView().byId("DP8").getValue(),
        "StockTransferLines": []
      };          
      
      var StoredItem = this.oModel.getData().GRDraftsB;
      for(var i = 0;i < StoredItem.length;i++){
        oBody.StockTransferLines.push({
          "ItemCode": StoredItem[i].ItemCode,
          "UnitPrice": "",
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
              ids = localStorage.getItem("Appv_TR");
              isActive = "Y";
              that.onactivateAlert();
              that.onReadAlert();
              that.closeLoadingFragment();
                    MessageBox.information("Transfer Request success,\nNew Doc Number Created:" + json.DocNum, {
                      actions: [MessageBox.Action.OK],
                      title: "Transfer Request",
                      icon: MessageBox.Icon.INFORMATION,
                      styleClass:"sapUiSizeCompact",
                      onClose: function () {
                        that.oModel.getData().GRDraftsB = [];
                        that.onAlert();
                        that.oModel.refresh();}
                    });
                
                  }
                });
              
     },

     onactivateAlert: function(){

      var sServerName = localStorage.getItem("ServerID");
      var xsjsServer = sServerName.replace("50000", "4300");
      var sUrl = xsjsServer + "/app_xsjs/UpdateAlert.xsjs?id=" + ids +"&isAct=" + isActive;
  
      $.ajax({
        url: sUrl,
            type: "POST",
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
              this.oModel.refresh();
            },
            context: this
          })
  
  
    },
 
     onReadAlert: function(){
      var sServerName = localStorage.getItem("ServerID");
      var xsjsServer = sServerName.replace("50000", "4300");
      var sUrl = xsjsServer + "/app_xsjs/readAlert.xsjs?id=" + localStorage.getItem("AlertCode") +"&isRead=Y";
      
      $.ajax({
        url: sUrl,
            type: "POST",
            beforeSend: function (xhr) {
            // xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd810~"));
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd123"));
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
              this.oModel.refresh();
              this.closeLoadingFragment();
            },
            context: this
          })
    },


    ongetFromWhse: function(){
      var that = this;
      var sServerName = localStorage.getItem("ServerID");
      var xsjsServer = sServerName.replace("50000", "4300");
      var sUrl = xsjsServer + "app_xsjs/TransferWhse.xsjs?idw=" + localStorage.getItem("DocEntry");
    
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
              var OTR = [];
              var ITR =  response;
              var count = Object.keys(ITR).length;
              for(let o = 0; o < count;o++){
                this.getView().byId("fromWID").setValue(ITR[0].FromWhsCod); 
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
