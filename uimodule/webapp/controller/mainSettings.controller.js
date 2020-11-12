sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
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

  return Controller.extend("com.ecoverde.ECOVERDE.controller.mainSettings", {
    onInit: function(){            
      var that = this;
	    var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().getDataAppr();
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

      initialize: function () {
        this.oModel = new JSONModel("model/item.json");
        this.getView().setModel(this.oModel, "oModel");
        this.getView();
          this.getDataAppr()
          this.onGetApprovalTemp();
      },

      getDataAppr: function(){
        var locGRname = localStorage.getItem("GRName");
        var locGRcode = localStorage.getItem("Appv_GR");
        var locGRPOname = localStorage.getItem("GRPOName");
        var locGRPOCode = localStorage.getItem("Appv_GRPO");
        var locTRname = localStorage.getItem("TRName");
        var locTRcode = localStorage.getItem("Appv_TR")
        var locGIName =localStorage.getItem("GI_App");
        var locGICode = localStorage.getItem("GI_code");

        this.getView().byId("gr01").setValue(locGRname);
        this.getView().byId("gr01").setSelectedKey(locGRcode);
        this.getView().byId("grpo01").setValue(locGRPOname);
        this.getView().byId("grpo01").setSelectedKey(locGRPOCode);
        this.getView().byId("tr01").setValue(locTRname);
        this.getView().byId("tr01").setSelectedKey(locTRcode);
        this.getView().byId("gi01").setValue(locGIName);
        this.getView().byId("gi01").setSelectedKey(locGICode);

      },

      onGetApprovalTemp: function(){
        this.openLoadingFragment();
        var that = this;
        var sServerName = localStorage.getItem("ServerID");
        var xsjsServer = sServerName.replace("50000", "4300");
        var sUrl = xsjsServer + "/app_xsjs/ApprovalTemplate.xsjs";
    
        $.ajax({
          url: sUrl,
          type: "GET",
          crossDomain: true,
          beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));
          },
          xhrFields: {
            withCredentials: true
          },
          error: function (xhr, status, error) {
            this.closeLoadingFragment();
            console.log("Error Occured:" + error);
          },
          success: function (response) {
            var resultTemp = [];
            var sms =  response;
            var count = Object.keys(sms).length;
            
            for(let j =0; j < count;j++){
              resultTemp.push({
                  "WtmCode": sms[j].WtmCode,
                  "Name": sms[j].Name,
                  "TransType": sms[j].TransType
              });
            }
            
          const gr = resultTemp.filter(function(ogr){
            return ogr.TransType == 59;
            });

          const grpo = resultTemp.filter(function(ogrpo){
            return ogrpo.TransType == 20;
            })

          const tr = resultTemp.filter(function(otr){
              return otr.TransType == 1250000001;
            })

          const gi = resultTemp.filter(function(ogi){
              return ogi.TransType == 60;
            })

          this.oModel.getData().ApprovalTempGR = gr;
          this.oModel.getData().ApprovalTempGRPO = grpo;
          this.oModel.getData().ApprovalTempTR = tr;
          this.oModel.getData().ApprovalTempGI = gi;
          this.oModel.refresh();
          this.closeLoadingFragment();
          },
          context: this
        });
      },

      onSave: function(){
     
        // that.getView().byId('TransactionID').getValue()

        var GRname = this.getView().byId("gr01").getValue();
        var grCode = this.getView().byId("gr01").getSelectedKey();
        localStorage.setItem("GRName", GRname);
        localStorage.setItem("Appv_GR",grCode);

        var GRPOName = this.getView().byId("grpo01").getValue();
        var GRPOCode =  this.getView().byId("grpo01").getSelectedKey();
        
        localStorage.setItem("GRPOName", GRPOName);
        localStorage.setItem("Appv_GRPO",GRPOCode);


        var GIname = this.getView().byId("gi01").getValue();
        var GICode = this.getView().byId("gi01").getSelectedKey();
        
        localStorage.setItem("GI_App", GIname);
        localStorage.setItem("GI_code", GICode);

        var TRName = this.getView().byId("tr01").getValue();
        var TRCode = this.getView().byId("tr01").getSelectedKey();

      
        localStorage.setItem("TRName", TRName);
        localStorage.setItem("Appv_TR", TRCode);
  
        sap.m.MessageToast.show("Approval Template Saved");

        // this.router = this.getOwnerComponent().getRouter();
        // this.router.navTo("main");
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

  });
});
