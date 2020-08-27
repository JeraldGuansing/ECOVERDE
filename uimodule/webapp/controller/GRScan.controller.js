sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
  "sap/m/MessageBox"
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox) {
  "use strict";

  return Controller.extend("com.ecoverde.ECOVERDE.controller.GRScan", {
    onInit: function(){

      this.oModel = new JSONModel("model/Item.json");
      this.getView().setModel(this.oModel, "oModel");
      //this.getBarcode();
    },

    onScan: function() {
          var options = {
              preferFrontCamera: true, // iOS and Android
              showFlipCameraButton: true, // iOS and Android
              showTorchButton: true, // iOS and Android
              torchOn: true, // Android, launch with the torch switched on (if available)
              prompt: "Place barcode inside the scan area", // Android
              resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
              formats: "QR_CODE,PDF_417,UPC_A", // default: all but PDF_417 and RSS_EXPANDED
              orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
              disableAnimations: true // iOS
          };
            cordova.plugins.barcodeScanner.scan(
              function (result) {
                var sBarcode = result.text;
                localStorage.setItem("sBarcode", sBarcode);
                this.onValidateBarcode();
              },
              function (error) {
                //toast here
        });
    },

    getBarcode: function () {
    
      $.ajax({
        url: "https://202.175.234.102:50000/b1s/v1/BarCodes",
        type: "GET",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          console.log("Error Occured");
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {

        this.oModel.getData().value = results.value;
        this.oModel.refresh();
      });
    },

    onTest: function(){
      var that = this;
      var oModel = new sap.ui.model.json.JSONModel();
      var oView = that.getView();

      var sServerName = localStorage.getItem("ServerID");
      var vBarcode = oView.byId("myBarcode").getValue();
      var sUrl = sServerName + "/b1s/v1/Items";
  
       $.ajax({
            url: sUrl,
            type: "GET",
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
              withCredentials: true},
            success: function(response){
             
            var oItem = response.value;

           //filter specific/get 3 fields.

             const scanCode = oItem.filter(function(items){
              return items.ItemCode == vBarcode || items.ItemName == vBarcode;
            }).map(function(itemDet){
              return {
                    "ItemCode": itemDet.ItemCode, 
                    "ItemName":itemDet.ItemName,
                    "BarCode":vBarcode,
                    "Quantity": 1
                   };         
            });
            //Validation
            
           // console.log(scanCode[0].ItemCode);
           
           var sResult = parseInt(scanCode.length); 
            if(sResult == 0){
              sap.m.MessageToast.show("Barcode Not Found");
              localStorage.setItem("sBarcode", "");
             
            }else{
              //just push the data on model

              //check if with same item
              
              var rItem = that.oModel.getData().value;

              rItem.forEach(function(itemCde){
                if (itemCde.ItemCode === scanCode[0].ItemCode){
                  itemCde.Quantity = parseInt(itemCde.Quantity) + 1;
                  console.log(itemCde.Quantity);
                 
                }else{
                  that.oModel.getData().value.push(scanCode[0]);
                  console.log("new Item");
                }
              });

              debugger;
              //that.oModel.getData().value.push(scanCode[0]);
              that.oModel.refresh();
            
            }
      
            }, error: function(response) { 
            sap.m.MessageToast.show("Error Occur");
            }
        })
    
    },
    

  });
});
