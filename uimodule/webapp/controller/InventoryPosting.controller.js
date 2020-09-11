sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment"
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox,Fragment) {
  "use strict";

  return Controller.extend("com.ecoverde.ECOVERDE.controller.InventoryPosting", {

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
                //This event is fired every time before the NavContainer hides this child control.
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
   
      this.getView().byId("docIDs").setText(localStorage.getItem("DocNo"));
      this.getView().byId("fWhseID").setText(localStorage.getItem("FromWhseID") + "-" + localStorage.getItem("FromWhseNM"));

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today =  yyyy + mm + dd;
      this.byId("DP8").setValue(today);

      this.onReqList();
    },

    onReqList: function(){
      var that = this;
      that.openLoadingFragment();
      var docID = localStorage.getItem("DocNo");
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/InventoryTransferRequests?$select=StockTransferLines&$filter=DocNum eq " + docID;
    
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
         try {
          that.oModel.getData().InventoryTransfer = response.value[0].StockTransferLines
          console.log(that.oModel.getData())
        }
        catch(err) {
          that.initialize();
          
        }
         that.oModel.refresh();
         that.closeLoadingFragment();
        }, error: function(response) { 
          that.closeLoadingFragment();
        }
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

  });
});
