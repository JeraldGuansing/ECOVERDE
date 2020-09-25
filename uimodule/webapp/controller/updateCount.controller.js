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
  var indS;
  var listpath;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.updateCount", {
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
      this.onGetcountItem();
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

  onGetcountItem: function(){
     
      var that = this;
      that.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/InventoryCountings(" + localStorage.getItem("DocEntry") +")?";
      $.ajax({
      url: sUrl,
      type: "GET",
      dataType: 'json',
      crossDomain: true,
      xhrFields: {
        withCredentials: true},
      success: function(response){
        that.closeLoadingFragment()
          that.oModel.getData().CountItem = response.InventoryCountingLines;
          // console.log(that.oModel.getData().CountItem)
          that.oModel.refresh();
        
        }, error: function() { 
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
      })
    },

    onPressEdit: function(){
      if (!this.updateCounter) {
        this.updateCounter = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.InventoryCount.updateCount", this);
        this.getView().addDependent(this.updateCounter);
      
      }
      this.updateCounter.open();
    },

    onShowEdit: function(oEvent){
      this.onPressEdit();

      var myInputControl = oEvent.getSource(); // e.g. the first item
      var boundData = myInputControl.getBindingContext('oModel').getObject();
      listpath = myInputControl.getBindingContext('oModel').getPath();
      var indexItem = listpath.split("/");
      indS =indexItem[2];

      sap.ui.getCore().byId("CnttmID").setValue(boundData.ItemCode);
      sap.ui.getCore().byId("CntitmName").setValue(boundData.ItemDescription);
      sap.ui.getCore().byId("CntuomID").setValue(boundData.UoMCode);
      sap.ui.getCore().byId("CntqtyID").setValue(boundData.CountedQuantity);

      sap.ui.getCore().byId("CnttmID").setEnabled(false);
      sap.ui.getCore().byId("CntitmName").setEnabled(false);
      sap.ui.getCore().byId("CntuomID").setEnabled(false);
    },
  
    onCloseEdit: function(){
      if(this.updateCounter){
          this.updateCounter.close();
          this.oModel.refresh();
      }
    },

    onSaveEdit: function(){
      var updateQty = this.oModel.getData().CountItem;

      if(sap.ui.getCore().byId("CntqtyID").getValue() == 0 || sap.ui.getCore().byId("CntqtyID").getValue() == 0){
        sap.m.MessageToast.show("Please Enter Quantity");
      }else{
        updateQty[indS].CountedQuantity = sap.ui.getCore().byId("CntqtyID").getValue();
        this.onCloseEdit();
      }
    },

    onConfirmUpdate: function(){

      var that = this;
        MessageBox.information("Are you sure you want to [UPDATE] this Inventory Count Record?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          title: "Inventory Counting",
          icon: MessageBox.Icon.QUESTION,
          styleClass:"sapUiSizeCompact",
          onClose: function (sButton) {
            if(sButton === "YES"){
              that.onUpdateCount();
            }}
        });
     
      },
    
onUpdateCount: function(){
 
        var that = this;
        that.openLoadingFragment();
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/InventoryCountings(" + localStorage.getItem("DocEntry") +")?";
        var oBody = {
          "InventoryCountingLines": []};
        var posItem = this.oModel.getData().CountItem;

        var x = posItem.length;
        for(var i = 0; i < x; i++){
        oBody.InventoryCountingLines.push({
          "LineNumber": posItem[i].LineNumber,
           "CountedQuantity": posItem[i].CountedQuantity,
           "Counted": "tYES"
          });
        }
        // console.log(oBody);
        oBody = JSON.stringify(oBody);
        $.ajax({
          url: sUrl,
          type: "PATCH",
          data: oBody,
          headers: {
            'Content-Type': 'application/json'},
          crossDomain: true,
          xhrFields: {withCredentials: true},
          error: function (xhr, status, error) {
            that.closeLoadingFragment();
            sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
            },
          success: function (json) {
           
                  MessageBox.information("Record successfully Updated", {
                    actions: [MessageBox.Action.OK],
                    title: "Inventory Count",
                    icon: MessageBox.Icon.INFORMATION,
                    styleClass:"sapUiSizeCompact"
                  });
                  that.oModel.refresh();
                  that.closeLoadingFragment();
                  that.onPressNavBack();
                },context: this
              });
    },
    
    onPressNavBack: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("inventoryView",null, true);
    },
    
  });
});
