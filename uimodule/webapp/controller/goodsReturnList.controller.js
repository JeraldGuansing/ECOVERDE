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
    var oView = this.getView();
    oView.byId("venID").setText(localStorage.getItem("VendorCode"));
    oView.byId("venName").setText(localStorage.getItem("VendorName"));

    // var today = new Date();
    // var dd = String(today.getDate()).padStart(2, '0');
    // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    // var yyyy = today.getFullYear();
    
    // today =  yyyy+ mm + dd;
    // this.byId("DP8").setValue(today);

    this.onGetReturnList();
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
      this.router.navTo("returnWref");
    },

    onPressIssuance: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsIssueMenu");
    },

    onGetReturnList: function(){
      this.openLoadingFragment();
      var that = this;
     
     
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/PurchaseDeliveryNotes?$select=DocNum,DocEntry,NumAtCard,DocDueDate,DocDate,TaxDate&$filter=CardCode eq '" +  localStorage.getItem("VendorCode") +"'";
  
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

getContextByIndex: function(evt) {
			var oTable = this.byId("tblID");
			var iIndex = oTable.getSelectedIndex();
			if (iIndex < 0) {
				MessageToast.show("Please Select Item first");
			} else {
          this.onCopyGRPO();
         }
		},

  onCopyGRPO: function(evt) {
        
      localStorage.setItem("DocNo", "");
      
      var i = this.byId("tblID").getSelectedIndices();
      var oList =  this.oModel.getData().goodsRetlist;
     
      localStorage.setItem("DocNo", oList[i].DocNum);
      localStorage.setItem("DocEntry", oList[i].DocEntry);
      this.clearSelection();
      this.onPressCopyReturn();
    },

    clearSelection: function(evt) {
      this.byId("tblID").clearSelection();
    },

  });
});
