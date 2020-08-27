sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/Token",
  "sap/m/MessageBox"
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox) {
  "use strict";
 
  return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsreceipt100", {
    onInit: function(){

    },


    onValidateBarcode: function(){
      localStorage.setItem("sItemCode", "");
      localStorage.setItem("sIteName", "");
      var sServerName = localStorage.getItem("ServerID");
      var vBarcode = localStorage.getItem("sBarcode");
      var sUrl = sServerName + "/b1s/v1/BarCodes("+ vBarcode + ")";

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
             return items.BarCode == vBarcode;
           }).map(function(itemDet){
               return [{
                         "ItemCode": itemDet.ItemCode, 
                         "ItemName":itemDet.ItemName,
                         "BarCode":itemDet.BarCode
                       }];
           });
           //Validation
          var sResult = parseInt(scanCode.length); 
           if(sResult == 0){
             sap.m.MessageToast.show("Barcode Not Found");
             localStorage.setItem("sBarcode", "");
             console.log(oItem.length);
           }else{
             localStorage.setItem("sItemCode", scanCode.ItemCode);
             localStorage.setItem("sIteName", scanCode.ItemName);
           }
        }, error: function(response) { 
        sap.m.MessageToast.show("Invalid Bardode!");}
        })
    
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
                "BarCode":itemDet.BarCode,
                };         
            });
            //Validation
           
            console.log(scanCode.value);
            
          
           var sResult = parseInt(scanCode.length); 
            if(sResult == 0){
              sap.m.MessageToast.show("Barcode Not Found");
              localStorage.setItem("sBarcode", "");
             
            }else{
              //ajax call bind
              
            }
      
            }, error: function(response) { 
            sap.m.MessageToast.show("Error Occur");
            }
        })
    
    },


      //showNavButton="true" navButtonPress="onPressBack"
    onGotoScanview: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("BarcodeScanning");
    },
  });
});
