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
  var taxtCode;
  var UntPrice;
  var Sstate;
  var tcodes;
  var listpath;
  var indS;
  var lineNum;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.GrReference", {
   
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
  
  onWithRef: function(){
    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("purchaseOrderList");
    },


initialize: function(vFromId){
      var oView = this.getView();
      this.oModel = new JSONModel("model/item.json");
      this.getView().setModel(this.oModel, "oModel");

      oView.byId("docID").setText(localStorage.getItem("DocNo"));
      oView.byId("venID").setText(localStorage.getItem("VendorCode"));
      oView.byId("venName").setText(localStorage.getItem("VendorName"));
      oView.byId("inptID").setVisible(false);
        // this.oModel.setData({receiving:[]});
        // this.oModel.updateBindings(true);
      this.onGRList();
      // console.log(this.oModel.getData())
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today =  yyyy+ mm + dd;
      this.byId("DP8").setValue(today);

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
                that.closeLoadingFragment();
                console.log(error);
        });
    },
  

onScanBarcode: function(){
      var that = this;
      var vBarcode = localStorage.getItem("sBarcode");
      var staxCode;
      var sunitPr;
      // if(tcodes != vBarcode){
      //   MessageBox.information("Invalid Barcode,\nPlease check your selected item", {
      //     actions: [MessageBox.Action.OK],
      //     title: "Goods Receipt PO",
      //     icon: MessageBox.Icon.WARNING,
      //     styleClass:"sapUiSizeCompact"
      //   });
      //   that.closeLoadingFragment()
      // }else{

      var StoredItem = that.oModel.getData().DocumentLines;
      const oITM = StoredItem.filter(function(OIT){
      return OIT.BarCode == vBarcode;})
       
      var cResult = parseInt(oITM.length);
      if(cResult == 0){
        MessageBox.information("Invalid Barcode,\nPlease check the item", {
          actions: [MessageBox.Action.OK],
          title: "Goods Receipt PO",
          icon: MessageBox.Icon.WARNING,
          styleClass:"sapUiSizeCompact"
        });
        that.closeLoadingFragment()
      }else{
        staxCode = oITM[0].TaxCode;
        sunitPr = oITM[0].GrossTotal;
        oITM[0].RemainingOpenQuantity = parseInt(oITM[0].RemainingOpenQuantity) - 1;
        oITM[0].receivedQty = parseInt(oITM[0].Quantity) - parseInt(oITM[0].RemainingOpenQuantity)
     

      var RecItem = that.oModel.getData().forPosting;
            const rITM = RecItem.filter(function(RIT){
            return RIT.BarCode == vBarcode;})

            var rResult = parseInt(rITM.length);
            if(rResult == 0){
            
              that.oModel.getData().forPosting.push({
                "ItemCode": vBarcode,
                "Quantity": 1,
                "TaxCode": staxCode,
                "UnitPrice": sunitPr
              });

            }else{
              rITM[0].Quantity = parseInt(rITM[0].Quantity) + 1;
            }
          }
        // }
        that.oModel.refresh();
        that.closeLoadingFragment()
    },

onConfirmPosting: function(){
      var that = this;
      var itemJSON = that.oModel.getData().forPosting;
      if(parseInt(itemJSON.length) == 0){
        sap.m.MessageToast.show("Please Scan/Input item First");
      }
      else{

      
      if(parseInt(itemJSON.length) == 0){
        sap.m.MessageToast.show("Please Scan/Input item First");
      }
      else{

      MessageBox.information("Are you sure you want to [POST] this transaction?", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        title: "POST Goods Receipt w/out PO",
        icon: MessageBox.Icon.QUESTION,
        styleClass:"sapUiSizeCompact",
        onClose: function (sButton) {
          if(sButton === "YES"){
            that.onPostingGR();
          }}
      });
      }
    }
    },
    
onPostingGR: function(){
      var that = this;
      var oView = that.getView();
      that.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/PurchaseDeliveryNotes";
      var oBody = {
        "CardCode": localStorage.getItem("VendorCode"),
        "DocType": "dDocument_Items",
        "DocDate": oView.byId("DP8").getValue(),
        "DocumentLines": []};          
      
      var StoredItem = this.oModel.getData().forPosting;
      for(var i = 0;i < StoredItem.length;i++){
        if(StoredItem[i].Quantity !=0){      
          oBody.DocumentLines.push({
            "ItemCode": StoredItem[i].ItemCode,
            "Quantity": StoredItem[i].Quantity,
            "TaxCode": StoredItem[i].TaxCode,
            "UnitPrice": StoredItem[i].UnitPrice,  
            "BaseEntry" : localStorage.getItem("DocEntry"),
            "BaseType": "22",
            "BaseLine": StoredItem[i].lineNum,
            "WarehouseCode": localStorage.getItem("wheseID")
          });
        }
      }
        // console.log(oBody);  
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
              sap.m.MessageToast.show("Unable to post the Item:\n" + xhr.responseJSON.error.message.value);
              },
            success: function (json) {
              //console.log(json);
              that.closeLoadingFragment();
                    MessageBox.information("Item successfully received \nCreated Doc number:" + json.DocNum, {
                      actions: [MessageBox.Action.OK],
                      title: "Goods Receipt PO",
                      icon: MessageBox.Icon.INFORMATION,
                      styleClass:"sapUiSizeCompact",
                      onClose: function () {
                        // that.getView().destroy();
                        that.onWithRef();
                      }
                    });
                  
                  },context: this
                });

                //Update Purchase Order;
     },

onPressItem: function(oEvent){
          var that = this;
          var oView = this.getView();
          var rState = oView.byId("swID").getState();
          //console.log(that.oModel.getData().DocumentLines);

          var oitem = oEvent.getSource().getTitle();
          tcodes = oitem;
          var Name =  oEvent.getSource().getIntro();
          var Qty = oEvent.getSource().getNumber();
          var rQty = Qty.split("/");
          var remainingQ = rQty[1] - rQty[0];

          var priceCur = oEvent.getSource().getNumberUnit();
          var priceCat = priceCur.split(" ");
        
          var myInputControl = oEvent.getSource(); // e.g. the first item
          var boundData = myInputControl.getBindingContext('oModel').getObject();
          listpath = myInputControl.getBindingContext('oModel').getPath();
          var indexItem = listpath.split("/");
          indS =indexItem[2];
          lineNum = boundData.LineNum;
          // console.log(boundData);


          if(rState === true){
            if(rQty[0] == rQty[1]){
            that.onScan();
            }
          }else{ 
            if(rQty[0] >= rQty[1]){
              MessageBox.information("Do you want to Modify?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                title: "Goods Receipt PO",
                icon: MessageBox.Icon.INFORMATION,
                styleClass:"sapUiSizeCompact",
                onClose: function (sButton) {
                  if(sButton == "YES"){
                  that.onEditItem();
               
                  sap.ui.getCore().byId("codeIDref").setValue(boundData.ItemCode);
                  sap.ui.getCore().byId("nameIDref").setValue(boundData.ItemDescription);
                  //sap.ui.getCore().byId("rQtyref").setValue(boundData.Quantity);
                  sap.ui.getCore().byId("qtyIDref").setValue(boundData.receivedQty);

                  sap.ui.getCore().byId('codeIDref').setEnabled(false);
                  sap.ui.getCore().byId('nameIDref').setEnabled(false);
                  // sap.ui.getCore().byId("rQtyref").setEnabled(false);
                  // that.onShowEdit();
                }
                }
              });
            }else{
              this.onAddItem()
              //set value
              sap.ui.getCore().byId("codeID").setValue(oitem);
              sap.ui.getCore().byId("nameID").setValue(Name);
              sap.ui.getCore().byId("rQty").setValue(remainingQ);
              sap.ui.getCore().byId("untPr").setValue(priceCat[0]);
              sap.ui.getCore().byId("taxCode").setValue(priceCat[2])

              sap.ui.getCore().byId("qtyIDs").setSelectedKey("");
              
              //Set enable
              sap.ui.getCore().byId('codeID').setEnabled(false);
              sap.ui.getCore().byId('nameID').setEnabled(false);
              sap.ui.getCore().byId("rQty").setEnabled(false);
              //set visible
              sap.ui.getCore().byId("untPr").setVisible(false);
              sap.ui.getCore().byId("taxCode").setVisible(false);
			    
           } 
        }
     },


onGetAddItem: function(){
      var that = this;
      //var docID = localStorage.getItem("DocNo")
      var itCode = sap.ui.getCore().byId("codeID").getValue()
      var sQtyID = sap.ui.getCore().byId("qtyIDs").getValue();
      var sunitPr = sap.ui.getCore().byId("untPr").getValue();
      var staxCode = sap.ui.getCore().byId("taxCode").getValue();
      var rQtyID = sap.ui.getCore().byId("rQty").getValue();

      if(sQtyID == "" || sQtyID <= 0){
        sap.m.MessageToast.show("Please input quantity");
        return;
      // }else if(parseInt(sQtyID) > parseInt(rQtyID)){
      //   sap.m.MessageToast.show("Input quantity exceed to remaining quantity");
      //   return;
      }else{
        var remQty;
        var StoredItem = that.oModel.getData().DocumentLines;
        const oITM = StoredItem.filter(function(OIT){
        return OIT.ItemCode == itCode;})

            var cResult = parseInt(oITM.length);
            if(cResult == 0){
            }else{
              oITM[0].RemainingOpenQuantity = parseInt(oITM[0].RemainingOpenQuantity) - parseInt(sQtyID);
              oITM[0].receivedQty = parseInt(oITM[0].receivedQty) + parseInt(sQtyID); 
            }
          
            remQty = oITM[0].RemainingOpenQuantity;

            var RecItem = that.oModel.getData().forPosting;
            const rITM = RecItem.filter(function(RIT){
            return RIT.ItemCode == itCode;})


            var rResult = parseInt(rITM.length);
            if(rResult == 0){
            
              that.oModel.getData().forPosting.push({
                "lineNum": lineNum,
                "ItemCode": itCode,
                "Quantity": sQtyID,
                "remainingQ": remQty,
                "TaxCode": staxCode,
                "UnitPrice": sunitPr
              });

            }else{
              rITM[0].Quantity = parseInt(rITM[0].Quantity) + parseInt(sQtyID);
            }

            this.oModel.refresh();
            //console.log(that.oModel.getData());
            this.onCloseAdd();    
      }
  },

onGRList: function(){
      var that = this;
      that.openLoadingFragment();
      var docID = localStorage.getItem("DocNo");
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/PurchaseOrders?$select=DocNum,DocumentLines&$filter=DocNum eq " + docID;
    
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          // console.log(response)
          //that.oModel.getData().DocumentLines  = response.value[0];
         var rResult = [];
         rResult = response.value[0].DocumentLines;
         try {
          for(var i = 0;i < rResult.length;i++){
          if(rResult[i].RemainingOpenQuantity != 0){
          that.oModel.getData().DocumentLines.push({
            "DocNum": docID,
            "ItemCode":rResult[i].ItemCode,
            "ItemDescription": rResult[i].ItemDescription,
            "BarCode":  rResult[i].BarCode,
            "UnitPrice": rResult[i].UnitPrice,
            "TaxCode": rResult[i].TaxCode,
            "Quantity":  rResult[i].Quantity,
            "openQuant": rResult[i].RemainingOpenQuantity,
            "RemainingOpenQuantity": rResult[i].RemainingOpenQuantity,
            "receivedQty": "0",
            "GrossTotal": rResult[i].GrossTotal,
            "Currency": rResult[i].Currency,
            "UoMCode": rResult[i].UoMCode,
            "LineNum": rResult[i].LineNum
            
          });
        }}
      }
        catch(err) {
          that.initialize();
            // that.router = that.getOwnerComponent().getRouter();
            // that.router.navTo("homeScreen")
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

onCloseAdd: function(){
      if(this.addItemDialog2){
          this.addItemDialog2.close();
      }
      this.closeLoadingFragment();
    },

onCloseAddthree: function(){
      if(this.addItemDialog3){
          this.addItemDialog3.close();
      }
      this.closeLoadingFragment();
    },

onAddItem: function(){
      if (!this.addItemDialog2) {
          this.addItemDialog2 = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.addItem2", this);
          this.getView().addDependent(this.addItemDialog2);
      }
      this.addItemDialog2.open();
    },

onEditItem: function(){
      if (!this.editWithRef) {
          this.editWithRef = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.editWithRef", this);
          this.getView().addDependent(this.editWithRef);
      }
      this.editWithRef.open();
    },

onCloseEditItem: function(){
      if(this.editWithRef){
          this.editWithRef.close();
      }
      this.closeLoadingFragment();
    },


onSaveEdit: function(){
      var that = this;
      var StoredItem = that.oModel.getData().DocumentLines;
      // if(sap.ui.getCore().byId("qtyIDref").getValue() !=0){
      StoredItem[indS].RemainingOpenQuantity = parseInt(StoredItem[indS].RemainingOpenQuantity) - parseInt(sap.ui.getCore().byId("qtyIDref").getValue());
      StoredItem[indS].receivedQty = parseInt(sap.ui.getCore().byId("qtyIDref").getValue());
      // }else{
      //   //StoredItem.splice(indS,1);
      // }
      
      that.oModel.refresh();
      that.onCloseEditItem();
     },

onAddItemThree: function(){
      if (!this.addItemDialog3) {
          this.addItemDialog3 = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.addItem3", this);
          this.getView().addDependent(this.addItemDialog3);
      }
      this.onGetItem();
       // this.onGetUOM();
          sap.ui.getCore().byId("itmID3").setSelectedKey("");
          sap.ui.getCore().byId("itmName3").setSelectedKey("");
          sap.ui.getCore().byId("uomID3").setSelectedKey("");
          sap.ui.getCore().byId("qtyID3").setValue("");
        
      this.addItemDialog3.open();
    },

  
closeLoadingFragment : function(){
    if(this.oDialog){
      this.oDialog.close();
    }
  },


onGetItem: function(){
    this.openLoadingFragment();
    var sServerName = localStorage.getItem("ServerID");
    var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null'&$filter=Mainsupplier eq '"+ localStorage.getItem("VendorCode"); +"'";
    
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
            this.oModel.getData().itemMaster  = json.value;
            this.oModel.refresh();
            this.closeLoadingFragment();
          },
          context: this
        })

  },

onSelectItemCode: function(){
    var itemName = sap.ui.getCore().byId("itmID3").getSelectedKey();
    sap.ui.getCore().byId("itmName3").setValue(itemName);
    this.openLoadingFragment();
    this.onGetListOfAbst();
    // this.onGetListOfUOM();
},


onSelectItemName: function(){
  var itemCode = sap.ui.getCore().byId("itmName3").getSelectedKey();
  sap.ui.getCore().byId("itmID3").setValue(itemCode);
  localStorage.setItem("sBarcode", sap.ui.getCore().byId("itmID3").getValue());
  this.openLoadingFragment();
  this.onGetListOfAbst();
  // getBarcode here
},


onGetListOfAbst: function(){
var that = this;
var itemUOMcode = sap.ui.getCore().byId("itmID3").getValue()
this.closeLoadingFragment();
var sServerName = localStorage.getItem("ServerID");
var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=ItemNo eq '" + itemUOMcode + "'";
$.ajax({
  url: sUrl,
  type: "GET",
  dataType: 'json',
  crossDomain: true,
  xhrFields: {
    withCredentials: true},
  success: function(response){
    that.oModel.getData().UoMEntry = response.value;
    that.oModel.refresh();
    that.onGetListOfUOM();
  }, error: function() { 
    that.closeLoadingFragment()
    console.log("Error Occur");
  }
})
//Get UOMList

},

onGetListOfUOM: function(){
var that = this;
var sServerName = localStorage.getItem("ServerID");
var abslist = that.oModel.getData().UoMEntry;
var UoMContainer = [];
for(var i = 0;i < parseInt(abslist.length);i++){ 
      var absNo = abslist[i].UoMEntry; 
      var sUrl = sServerName + "/b1s/v1/UnitOfMeasurements?$select=Code,AbsEntry&$filter=AbsEntry eq " + absNo;
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          var getresult = response.value;
          UoMContainer.push({
            "Code": getresult[0].Code,
            "AbsEntry": getresult[0].AbsEntry
          })
         
          that.oModel.getData().UoMCode = UoMContainer;
          that.oModel.refresh();
         
        }, error: function() { 
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
    })
  }
 
 
},

onGetBarcodeOnAdd: function(){
  this.openLoadingFragment();
  var that = this;
  var itmCode = sap.ui.getCore().byId("itmID3").getValue();
  var AbsEntryID = sap.ui.getCore().byId("uomID3").getSelectedKey();
  var sServerName = localStorage.getItem("ServerID");
  var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=UoMEntry eq " + AbsEntryID + " and ItemNo eq '" + itmCode + "'";
  var BcodUntContainer = [];
  $.ajax({
    url: sUrl,
    type: "GET",
    dataType: 'json',
    crossDomain: true,
    xhrFields: {
      withCredentials: true},
    success: function(response){
      BcodUntContainer = response.value;

      that.oModel.getData().BarcodeUnit = BcodUntContainer;
      that.oModel.refresh();
      that.closeLoadingFragment();
    }, error: function() { 
      that.closeLoadingFragment()
      console.log("Error Occur");
    }
})
    that.closeLoadingFragment()
},

onAdditionalItem: function(){
  var that = this;
  that.openLoadingFragment();
  var sItmID = sap.ui.getCore().byId("itmID3").getValue();
  var sItmName = sap.ui.getCore().byId("itmName3").getValue();
  var sQtyID = sap.ui.getCore().byId("qtyID3").getValue();
  var sUoMID = sap.ui.getCore().byId("uomID3").getValue();
  var AbsEntryID = sap.ui.getCore().byId("uomID3").getSelectedKey();
  var docID = localStorage.getItem("DocNo");
  if(sItmID == ""){
    sap.m.MessageToast.show("Please select Item Code");
    return;
  }else if(sItmName == ""){
    sap.m.MessageToast.show("Please select Item Name");
    return;
  }else if(sUoMID == ""){
    sap.m.MessageToast.show("Please select Item UoM");
    return;
  }else if(sQtyID == "" || sQtyID <= 0 ){
    sap.m.MessageToast.show("Please input quantity");
    return;
  }else{

    ///>>>>>>>GetBarcode

    var StoredBarc = that.oModel.getData().BarcodeUnit; 
    var getStrBarc = "";
    if(StoredBarc.lenght != 0){
      getStrBarc = StoredBarc[0].Barcode;
    }
    

    var StoredItem = that.oModel.getData().value;        
    const oITM = StoredItem.filter(function(OIT){
    return OIT.ItemCode == sItmID && OIT.BarCode == getStrBarc;
     })
  var cResult = parseInt(oITM.length);
  if(cResult == 0){
    that.oModel.getData().DocumentLines.push({
      "DocNum": docID,
      "ItemCode": sItmID,
      "ItemDescription":sItmName,
      "BarCode": getStrBarc,
      "Quantity": sQtyID,
      "UoMCode": sUoMID,
      "AbsEntry":AbsEntryID,
      "GrossTotal": "",
      "Currency": "",
      "GrossTotal": 0,
      "RemainingOpenQuantity": sQtyID,
      "receivedQty": sQtyID - sQtyID,
      "UnitPrice": 0,
      "TaxCode": 0,
    });
    that.closeLoadingFragment();
  }else{
    oITM[0].Quantity = parseInt(oITM[0].Quantity) + parseInt(sQtyID);
    that.closeLoadingFragment();
  }
  that.closeLoadingFragment();
  that.oModel.refresh();
  that.onCloseAddthree();
  }
  
},

onWithRef: function(){
    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("purchaseOrderList");
},

  });
});
