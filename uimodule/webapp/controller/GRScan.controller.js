sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",

], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox,Fragment) {
  "use strict";

  return Controller.extend("com.ecoverde.ECOVERDE.controller.GRScan", {
    onInit: function(){
      
      this.oModel = new JSONModel("model/item.json");
      this.getView().setModel(this.oModel, "oModel");
      
    },

    onScan: function() {
      var that = this;
            cordova.plugins.barcodeScanner.scan(
              function (result) {
                var sBarcode = result.text;
                localStorage.setItem("sBarcode", sBarcode);
                that.openLoadingFragment();
                that.onScanBarcode();
              },
              function (error) {
                //toast here
        });
    },
  

    onScanBarcode: function(){
      var that = this;
      // var oView = that.getView();

      var sServerName = localStorage.getItem("ServerID");
      //var vBarcode = oView.byId("myBarcode").getValue();
      var vBarcode = localStorage.getItem("sBarcode");
      var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,BarCode,ItemName";
  
       $.ajax({
            url: sUrl,
            type: "GET",
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
              withCredentials: true},
            success: function(response){
             
            var oItem = response.value;
            const scanCode = oItem.filter(function(items){
            return items.ItemCode == vBarcode; //|| items.BarCode == vBarcode;
            })
            //Validation
           var sResult = parseInt(scanCode.length); 

            if(sResult == 0){
              sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the system!");
              localStorage.setItem("sBarcode", "");
            }else{
              var StoredItem = that.oModel.getData().value;
              const oITM = StoredItem.filter(function(OIT){
              return OIT.ItemCode == vBarcode;
            })
            var cResult = parseInt(oITM.length);
            if(cResult == 0){
              that.oModel.getData().value.push({
                "ItemCode":scanCode[0].ItemCode, 
                "ItemName":scanCode[0].ItemName,
                "BarCode":scanCode[0].BarCode,
                "Quantity": 1
              });
            
            }else{
              oITM[0].Quantity = parseInt(oITM[0].Quantity) + 1;
            }
              that.oModel.refresh();
              localStorage.setItem("sBarcode", "");
            }
            that.closeLoadingFragment()
            }, error: function() { 
              that.closeLoadingFragment()
              console.log("Error Occur");
            }
        })
        that.closeLoadingFragment()
    },
  
    onPostingGR: function(){

      var itemJSON = this.oModel.getData().value;

      if(parseInt(itemJSON.length) == 0){
        this.onScan();
      }
      else{

      var that = this;
      that.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/InventoryGenEntries";
      var oBody = {"DocumentLines": []};          
      
      var StoredItem = this.oModel.getData().value;
      for(var i = 0;i < StoredItem.length;i++){
        oBody.DocumentLines.push({
          "ItemCode": StoredItem[i].ItemCode,
          "Quantity": StoredItem[i].Quantity,
          "UnitPrice": 1
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
              sap.m.MessageToast.show("Unable to post the Item");
              },
            success: function (json) {
              that.closeLoadingFragment();
                    MessageBox.information("Item successfully Received,\nNew Doc Number Created:" + json.DocNum, {
                      actions: [MessageBox.Action.OK],
                      title: "Goods Receipt",
                      icon: MessageBox.Icon.INFORMATION,
                      styleClass:"sapUiSizeCompact",
                      onClose: function (sButton) {
                        that.onWithoutRef();
                      }
                    });
                  
                  },context: this
                });
              }
     },


     onWithoutRef: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("goodsReceipt");
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
