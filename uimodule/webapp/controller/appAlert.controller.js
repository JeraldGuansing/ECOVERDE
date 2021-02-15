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
  var ii;
  var listpath;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.appAlert", {

    onInit: function(){
      var oView = this.getView();
      this.oModel = new JSONModel("model/item.json");
      this.getView().setModel(this.oModel, "oModel");
      oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
                oView.getController().onGetAlert();
              },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().onGetAlert();
                // oView.getController().onGetDetails()
            },
            onBeforeFirstShow: function(evt) {
                //This event is fired before the NavContainer shows this child control for the first time.
            },
            onBeforeHide: function(evt) {
                //This event is fired every time before the NavContainer hides this child control.
            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                oView.getController().initialize();
          
            }
        });
    },


    initialize: function(){
      this.oModel = new JSONModel("model/item.json");
      this.getView().setModel(this.oModel, "oModel");
      // this.onGetAlert();
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

   onGetAlert: function(){
    var that = this;
    try{
    that.openLoadingFragment();
    that.oModel.getData().AlertSMS.length = [];
    var UserCode = localStorage.getItem("UserKeyID");
    var sServerName = localStorage.getItem("ServerID");
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/getAlert.xsjs?uid=" + UserCode + "&wsr=N&objT=112";
   

    $.ajax({
      url: sUrl,
          type: "GET",
          dataType: 'json',
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:" + localStorage.getItem("XSPass")));    
          },
          crossDomain: true,
          xhrFields: {
          withCredentials: true
          },
          error: function (xhr, status, error) {
            that.closeLoadingFragment();
            console.log("Error Occured");
          },
          success: function (response) {
            var sms =  response;
            var count = Object.keys(sms).length;
            
            for(let x = 0; x < parseInt(count);x++){
              // var tim = sms[x].RecTime;
              // var date = new Date(tim);

              // var hours = date.getHours();
              // console.log(hours)
              // var minutes = date.getMinutes();
              // var ampm = hours >= 12 ? 'am' : 'pm';
              // hours = hours % 12;
              // hours = hours ? hours : 12; // the hour '0' should be '12'
              // minutes = minutes < 10 ? '0'+minutes : minutes;
              // var strTime = hours + ':' + minutes + ' ' + ampm;
             
              that.oModel.getData().AlertSMS.push({
                "Subject": sms[x].Subject,
                // "RecTime": sms[x].RecTime,
                "UserText": sms[x].UserText,
                "KeyStr": sms[x].KeyStr,
                "AlertCode": sms[x].AlertCode,
                "DateCreated": "",
                "Description": "",
                "DocObjectCode": ""
                }
              );
            }
            that.oModel.refresh();
        
            if(parseInt(that.oModel.getData().AlertSMS.length) != 0){
              that.onGetDetails();
            }else{
              that.closeLoadingFragment();
            }
          }
        })
      
    }catch(err) {
        // console.log(err)
        that.closeLoadingFragment();
    }
       
   },

   onGetDetails: function(){
    var that = this;
    var s = that.oModel.getData().AlertSMS;
   
    for(let g = 0;g< s.length; g++){
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/Drafts?$select=UpdateDate,JournalMemo,DocObjectCode&$filter=DocEntry eq " + s[g].KeyStr + "";
        try{
        $.ajax({
          url: sUrl,
          type: "GET",
          dataType: 'json',
          async: false,
          crossDomain: true,
          xhrFields: {
            withCredentials: true},
          success: function(response){
            s[g].DateCreated = response.value[0].UpdateDate;
            s[g].Description = response.value[0].JournalMemo;
            s[g].DocObjectCode = response.value[0].DocObjectCode;
            that.oModel.refresh();
          
          }, error: function() { 
            that.closeLoadingFragment()
            console.log("Error Occur");
          }
        })
        }catch(err) {
          console.log(err)
        }
    }
    that.closeLoadingFragment();
   },

  onPressNotif(oEvent){
    var that = this;
    var myInputControl = oEvent.getSource(); // e.g. the first item
    var boundData = myInputControl.getBindingContext('oModel').getObject();
    localStorage.setItem("AlertCode", boundData.AlertCode);
    // console.log(boundData);
    
    var str = boundData.Subject;
		if(str.indexOf("approved") !== -1 || str.indexOf("End of Document") !== -1){
      var tcode = boundData.DocObjectCode;
  
      switch (tcode) {
        case "oInventoryGenEntry": //goods receipt
          localStorage.setItem("DocEntry", boundData.KeyStr);
          that.gotoGR();
          break;
        case "oInventoryTransferRequest": //Transfer Request
          localStorage.setItem("DocEntry", boundData.KeyStr);
          that.gotoTR(); 
          break;
        case "oPurchaseDeliveryNotes": //GoodsReceipt PO
          localStorage.setItem("DocEntry", boundData.KeyStr);
          that.gotoGRPO();
          break;
        case "oInventoryGenExit": //GoodsReceipt GI
          localStorage.setItem("DocEntry", boundData.KeyStr);
          that.gotoGI();
          break;
        default:
      }

		}else{
      that.onReadAlert();
      that.onGetAlert();
       
        }
  },

  onReadAlert: function(){
    var sServerName = localStorage.getItem("ServerID");
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/readAlert.xsjs?id=" + localStorage.getItem("AlertCode") +"&isRead=Y";
    
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
            this.oModel.refresh();
            this.closeLoadingFragment();
          },
          context: this
        })
  },
  
  ///>>>>Routes

	gotoGR: function(){
    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("GRScan200");
    },

  gotoGRPO: function(){
    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("GRPODraft");
    },

  gotoTR: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("TransferRequestDraft");
      },

  gotoGI: function(){
    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("GoodsIssueDraft");
      },

  });
});
