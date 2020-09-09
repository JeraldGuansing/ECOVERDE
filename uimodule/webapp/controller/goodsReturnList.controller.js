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

  return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsReturnList", {

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

    this.onGetListVendor();
  },

    onPressReturnlist: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsReturnlist");
    },

    onPressAddReturn: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsReturn");
    },

    onPressCopyReturn: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsReturn");
    },

    onPressIssuance: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsIssuance");
    },

    onGetListVendor: function(){
      var that = this;   
      that.openLoadingFragment();
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/BusinessPartners?$select=CardCode,CardName";
        $.ajax({
          url: sUrl,
          type: "GET",
          dataType: 'json',
          crossDomain: true,
          xhrFields: {
            withCredentials: true},
          success: function(response){
            that.oModel.getData().VendorList = response.value;
            that.oModel.refresh();
            that.closeLoadingFragment()
          }, error: function() { 
            that.closeLoadingFragment()
            console.log("Error Occur");
          }
      })
    }, 

    onGetReturnList: function(){
      this.openLoadingFragment();
      var that = this;
     
     
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/PurchaseReturns?$select=DocNum,CardCode&$filter=CardCode eq '" +  localStorage.getItem("VendorCode") +"'";
  
      $.ajax({
        url: sUrl,
        type: "GET",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          this.closeLoadingFragment();
          console.log("Error Occured: " + error);
        },
        success: function (json) {
       
        this.oModel.getData().goodsRetlist = json.value;
        this.oModel.refresh();
        this.closeLoadingFragment();
        },
        context: this
      });
    },

onSelectVendor: function(){
  var selVendor = this.getView().byId("rtVendor").getSelectedKey();
  localStorage.setItem("VendorCode",selVendor);
  this.onGetReturnList();
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
