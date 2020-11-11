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
  return Controller.extend("com.ecoverde.ECOVERDE.controller.GRPODraft", {
    onInit: function(){            
      var that = this;
	    var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().onGetToDraftHeader();
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

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today =  yyyy+ mm + dd;
        this.byId("DP8").setValue(today);
    
        // this.onGetToDraft();
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

    onGetToDraftHeader: function(){
      var that = this;
      this.openLoadingFragment();   
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/Drafts?$select=DocNum,CardCode,CardName&$filter=DocEntry eq " + localStorage.getItem("DocEntry");
        $.ajax({
          url: sUrl,
          type: "GET",
          dataType: 'json',
          crossDomain: true,
          xhrFields: {
            withCredentials: true},
          success: function(response){

            var draftHead = response.value[0];
            that.getView().byId('docID').setText(draftHead.DocNum);
            that.getView().byId('venID').setText(draftHead.CardCode);
            that.getView().byId('venName').setText(draftHead.CardName);
            that.oModel.refresh();
            that.onGetToDraftBody();
            that.closeLoadingFragment()
          }, error: function(xhr, status, error) { 
            that.closeLoadingFragment()
            sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
          }
      })
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
      title: "POST Goods Receipt PO",
      icon: MessageBox.Icon.QUESTION,
      styleClass:"sapUiSizeCompact",
      onClose: function (sButton) {
        if(sButton === "YES"){
          that.openLoadingFragment();
          ids = 8;
          isActive = "N";
          that.onactivateAlert();
          that.onPostingGR();
        }}
    });
    }
  },

  onPostingGR: function(){
    var that = this;
    var sServerName = localStorage.getItem("ServerID");
    var sUrl = sServerName + "/b1s/v1/PurchaseDeliveryNotes";
    var OITM = that.oModel.getData().GRDraftsB;

    var oBody = {
      "CardCode":that.getView().byId('venID').getText(),
      "DocObjectCode": "oPurchaseDeliveryNotes",
      "DocDate": that.getView().byId("DP8").getValue(),
      "DocumentLines": []
    };       

    for(var i = 0;i < OITM.length;i++){
      oBody.DocumentLines.push({
        "BaseLine": i,
        "ItemCode": OITM[i].ItemCode,
        "Quantity": OITM[i].Quantity,
        "TaxCode": OITM[i].TaxCode,
        "UnitPrice": OITM[i].UnitPrice,  
        "UoMEntry": OITM[i].AbsEntry,
        "BaseType": "22",
        "BaseEntry": OITM[i].BaseEntry,
        // "ProjectCode": this.getView().byId('ProjID').getSelectedKey(),
        "UoMCode": OITM[i].UoMCode,
        "WarehouseCode": localStorage.getItem("wheseID")
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
          sap.m.MessageToast.show("Unable to post the Item: " + xhr.responseJSON.error.message.value);
        },
        success: function (json) { 
          that.closeLoadingFragment();
          MessageBox.information("Items successfully received,\nDoc Number Created:" + json.DocNum, {
            actions: [MessageBox.Action.OK],
            title: "Goods Receipt",
            icon: MessageBox.Icon.INFORMATION,
            styleClass:"sapUiSizeCompact",
            onClose: function () {
                ids = 8;
                isActive = "Y";
                that.onactivateAlert();
                that.onReadAlert();
                that.oModel.getData().GRDraftsB = [];
                that.onAlert();
                that.oModel.refresh();
            }
          })
        },context: this
      });
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
              this.closeLoadingFragment();
            },
            context: this
          })
    },
  
    onAlert: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("appAlert");
        },

  });
});
