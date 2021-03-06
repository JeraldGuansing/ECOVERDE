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
  return Controller.extend("com.ecoverde.ECOVERDE.controller.GRScan200", {
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
        this.oModel.setSizeLimit(1500);
        this.getView().setModel(this.oModel, "oModel");

        this.getView().byId("TransactionID").setEnabled(false);
        this.getView().byId("ProjID").setEnabled(false);
        
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
        var sUrl = sServerName + "/b1s/v1/Drafts?$select=DocObjectCode,U_App_GRTransType&$filter=DocEntry eq " + localStorage.getItem("DocEntry");
        $.ajax({
          url: sUrl,
          type: "GET",
          dataType: 'json',
          crossDomain: true,
          xhrFields: {
            withCredentials: true},
          success: function(response){
            var draftHead = response.value[0].U_App_GRTransType;
            that.getView().byId('TransactionID').setValue(draftHead);
            that.getView().byId('TransactionID').setSelectedKey(draftHead);
            that.oModel.refresh();
            that.onGetToDraftBody();
            that.closeLoadingFragment()
          }, error: function(xhr, status, error) { 
            that.closeLoadingFragment()
            sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
          }
      })
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
              var draftBodyC = response.value[0].DocumentLines[0].ProjectCode;
              
              that.getView().byId('ProjID').setValue(draftBodyC);
              that.getView().byId('ProjID').setSelectedKey(draftBodyC);
              that.oModel.getData().GRDraftsB = response.value[0].DocumentLines;
              that.oModel.refresh();
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
        title: "POST Goods Receipt",
        icon: MessageBox.Icon.QUESTION,
        styleClass:"sapUiSizeCompact",
        onClose: function (sButton) {
          if(sButton === "YES"){
            that.openLoadingFragment();
            ids = localStorage.getItem("Appv_GR");
            isActive = "N";
            that.onactivateAlert();
            that.onPostingGR();
          }}
      });
      }
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

  onPostingGR: function(){
    var that = this;
    var sServerName = localStorage.getItem("ServerID");
    var sUrl = sServerName + "/b1s/v1/InventoryGenEntries";
    var OITM = that.oModel.getData().GRDraftsB;

    var oBody = {
      "DocDate": that.getView().byId("DP8").getValue(),
      "U_App_GRTransType": that.getView().byId('TransactionID').getValue(),
      "DocumentLines": []
    };       

    for(var i = 0;i < OITM.length;i++){
      oBody.DocumentLines.push({
        "ItemCode": OITM[i].ItemCode,
        "Quantity": OITM[i].Quantity,
        "UoMEntry": OITM[i].AbsEntry,
        "CostingCode":posItem[i].CostingCode,
        "ProjectCode": this.getView().byId('ProjID').getSelectedKey(),
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
                ids = localStorage.getItem("Appv_GR");
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
