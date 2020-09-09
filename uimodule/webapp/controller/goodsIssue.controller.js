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

  return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsIssue", {
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
  },

  onPressIssuance: function(){
    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("goodsIssuance");
  },

  onSelectParamV: function(){
    if (!this.project) {
      this.project = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.project", this);
      this.getView().addDependent(this.project);
    }

    sap.ui.getCore().byId("isVendor").setValue("");
    sap.ui.getCore().byId("isVendor").setSelectedKey("");
    sap.ui.getCore().byId("isProject").setValue("");
    sap.ui.getCore().byId("isProject").setSelectedKey("");
   
    
    this.onGetListVendor();
    this.onGetListProject();
   
    this.project.open();
 
  },

onCloseParamV: function(){
  if(this.project){
  this.project.close();
    }
    // this.closeLoadingFragment();
  
  },

  onSaveDial:function(){
    var VendName = sap.ui.getCore().byId("isVendor").getValue();
    var projName = sap.ui.getCore().byId("isProject").getValue();
    
    if(VendName == ""){
      sap.m.MessageToast.show("Please select Vendor");
      this.closeLoadingFragment();
      return;
    }else if(projName == ""){
      sap.m.MessageToast.show("Please select Project");
      this.closeLoadingFragment();
      return;
    }else{
    localStorage.setItem("VendorName",sap.ui.getCore().byId("isVendor").getValue());
    localStorage.setItem("VendorCode",sap.ui.getCore().byId("isVendor").getSelectedKey());
    localStorage.setItem("ProjName",sap.ui.getCore().byId("isProject").getValue());
    localStorage.setItem("ProjCode",sap.ui.getCore().byId("isProject").getSelectedKey());
    this.onPressIssuance();
    }

  },

  onPressReturnlist: function(){
    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("goodsReturnList");
  },

  onGetListVendor: function(){
    var that = this;
    this.openLoadingFragment();   
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/BusinessPartners?$select=CardCode,CardName&$filter=CardType eq 'cSupplier'";
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

  onGetListProject: function(){
    var that = this;
    this.openLoadingFragment();   
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
        }, error: function() { 
          that.closeLoadingFragment()
          console.log(respnse);
        }
    })
  },

  onLoopNext: function(){

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
