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
  var gitemUOMcode;
  var fitemUOMcode;
  var listpath;
  var indS;
 
  return Controller.extend("com.ecoverde.ECOVERDE.controller.GRScan", {
  onInit: function(){            
      this.oModel = new JSONModel("model/item.json");
      this.getView().setModel(this.oModel, "oModel");
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
        this.oModel.setData({UoMCode:[]});
        this.oModel.updateBindings(true);
        this.oModel = new JSONModel("model/item.json");
        this.getView().setModel(this.oModel, "oModel");

        this.getView().byId("Vcode").setText(localStorage.getItem("VendorCode"));
        this.getView().byId("Vname").setText(localStorage.getItem("VendorName"));

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        
        today = mm + '/' + dd + '/' + yyyy;
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
        });
    },

    onScanBarcode: function(){
      var that = this;

      var sServerName = localStorage.getItem("ServerID");
      var vBarcode = localStorage.getItem("sBarcode");
      var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=Barcode eq '" + vBarcode + "'";
  
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          that.oModel.getData().Barcode = response.value;
          that.oModel.refresh();

          that.onGetBarcodeItem();
          that.closeLoadingFragment();
         
        }, error: function() { 
          sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the Scanning Barcode!");
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
    })
        that.closeLoadingFragment()
    },

    onGetBarcodeItem: function(){
      var that = this;
      var vBarcode = localStorage.getItem("sBarcode");
      var gotBarcode = that.oModel.getData().Barcode;
      const oITM = gotBarcode.filter(function(OIT){
      return OIT.Barcode == vBarcode;
      })
      var barItemCode = "";
        if(oITM.length != 0){
        barItemCode = oITM[0].ItemNo;
      }
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=ItemCode eq '" + barItemCode + "'";
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          that.oModel.getData().itemMaster = response.value;
          //UOMDetails
          that.onGetBarcodeUOM();
        }, error: function() { 
          sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the Getting barcode Details!");
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
    })
    },

    onGetBarcodeUOM: function(){
      var that = this;
      var vBarcode = localStorage.getItem("sBarcode");
      var gotBarcode = that.oModel.getData().Barcode;
      const BITM = gotBarcode.filter(function(BIT){
      return BIT.Barcode == vBarcode;
      })
      var barItemCode = "";
      var AbsEntry = "";
       if(gotBarcode.length != 0){ 
      barItemCode = BITM[0].ItemNo;
      AbsEntry = BITM[0].UoMEntry;
      }

      var gotItemDT = that.oModel.getData().itemMaster;
      const oITM = gotItemDT.filter(function(OIT){
      return OIT.ItemCode == barItemCode;
      })
      var ItemName = "";
      if(gotItemDT.length != 0){
      ItemName = oITM[0].ItemName;
      }else{
        sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the Getting barcode details in the system!");
        return;
      }

      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/UnitOfMeasurements?$select=Code,AbsEntry&$filter=AbsEntry eq " + AbsEntry;
      $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
          that.oModel.getData().UoMCode = response.value;
          
          var UoMDetail = that.oModel.getData().UoMCode;
         
          const oUoM = UoMDetail.filter(function(UOM){
          return UOM.AbsEntry == AbsEntry;
          })

          var gUoMCode = oUoM[0].Code;

          var saveData = that.oModel.getData().value;
          const svd = saveData.filter(function(SAVD){
            return SAVD.ItemCode === barItemCode && SAVD.BarCode === vBarcode;
            })

          var sResult = parseInt(svd.length);
         
          if(sResult === 0){
            that.oModel.getData().value.push({
              "ItemCode":barItemCode, 
              "ItemName": ItemName,
              "BarCode": vBarcode,
              "Quantity": 1,
              "UoMCode": gUoMCode,
              "AbsEntry":AbsEntry
            });
          }else{
            svd[0].Quantity = parseInt(svd[0].Quantity) + 1;
           } 

           //console.log(that.oModel.getData().value);
           that.oModel.refresh();
        }, error: function() { 
          sap.m.MessageToast.show(vBarcode +"\nBarcode Not Found \nin the getting UOM Details!");
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
    })

    },

    onConfirmPosting: function(){
      var that = this;
    
      var itemJSON = this.oModel.getData().value;
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
    },
    
    onPostingGR: function(){
    
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
          "UnitPrice": 1,
          "UoMEntry": StoredItem[i].AbsEntry,
          "UoMCode": StoredItem[i].UoMCode,
          "WarehouseCode": localStorage.getItem("wheseID")
          });
        }
      oBody = JSON.stringify(oBody);
      // console.log(oBody);        
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
             
                    MessageBox.information("Item successfully Received,\nNew Doc Number Created:" + json.DocNum, {
                      actions: [MessageBox.Action.OK],
                      title: "Goods Receipt",
                      icon: MessageBox.Icon.INFORMATION,
                      styleClass:"sapUiSizeCompact"
                    });
                      this.oModel.setData({UoMCode:[]});
                      this.oModel.updateBindings(true);
                      this.oModel = new JSONModel("model/item.json");
                      this.getView().setModel(this.oModel, "oModel");

                    this.oModel.refresh();
                    
                    that.closeLoadingFragment();
                  },context: this
                });
              
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

    onCloseAdd: function(){
      if(this.addItemDialog){
          this.addItemDialog.close();
      }
    },

    onAddItem: function(){
       
      if (!this.addItemDialog) {
          this.addItemDialog = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.addItem", this);
          this.getView().addDependent(this.addItemDialog);
      }
        this.onGetItem();
       // this.onGetUOM();
          sap.ui.getCore().byId("itmID").setSelectedKey("");
          sap.ui.getCore().byId("itmName").setSelectedKey("");
          sap.ui.getCore().byId("uomID").setSelectedKey("");
          sap.ui.getCore().byId("qtyID").setValue("");
          this.addItemDialog.open();
    },

    onGetItem: function(){
      this.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null' and Mainsupplier eq '" + localStorage.getItem("VendorCode") + "'";
      
      $.ajax({
        url: sUrl,
            type: "GET",
            crossDomain: true,
            xhrFields: {
            withCredentials: true
            },
            error: function (xhr, status, error) {
              this.closeLoadingFragment();
              console.log("Error Occured");
            },
            success: function (json) {
              this.oModel.getData().itemMaster  = json.value;
              this.oModel.refresh();
              this.closeLoadingFragment();
            },
            context: this
          })

    },

    //next
    onGetAddItem: function(){
      var that = this;
      that.openLoadingFragment();
      var sItmID = sap.ui.getCore().byId("itmID").getValue();
      var sItmName = sap.ui.getCore().byId("itmName").getValue();
      var sQtyID = sap.ui.getCore().byId("qtyID").getValue();
      var sUoMID = sap.ui.getCore().byId("uomID").getValue();
      var AbsEntryID = sap.ui.getCore().byId("uomID").getSelectedKey();

      if(sItmID == ""){
        sap.m.MessageToast.show("Please select Item Code");
        that.closeLoadingFragment();
        return;
      }else if(sItmName == ""){
        sap.m.MessageToast.show("Please select Item Name");
        that.closeLoadingFragment();
        return;
      }else if(sUoMID == ""){
        sap.m.MessageToast.show("Please select Item UoM");
        that.closeLoadingFragment();
        return;
      }else if(sQtyID == "" || sQtyID <= 0 ){
        sap.m.MessageToast.show("Please input quantity");
        that.closeLoadingFragment();
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
        that.oModel.getData().value.push({
          "ItemCode": sItmID,
          "ItemName":sItmName,
          "BarCode": getStrBarc,
          "Quantity": sQtyID,
          "UoMCode": sUoMID,
          "AbsEntry":AbsEntryID
        });
        that.closeLoadingFragment();
      }else{
        oITM[0].Quantity = parseInt(oITM[0].Quantity) + parseInt(sQtyID);
        that.closeLoadingFragment();
      }
      that.closeLoadingFragment();
      that.oModel.refresh();
      that.onCloseAdd();
      }
      
    },

    onGetBarcodeOnAdd: function(){
      this.openLoadingFragment();
      var that = this;
      var itmCode = sap.ui.getCore().byId("itmID").getValue();
      var AbsEntryID = sap.ui.getCore().byId("uomID").getSelectedKey();
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

    onSelectItemCode: function(){
        var itemName = sap.ui.getCore().byId("itmID").getSelectedKey();
        sap.ui.getCore().byId("itmName").setValue(itemName);
        this.openLoadingFragment();
        fitemUOMcode = sap.ui.getCore().byId("itmID").getValue();
        this.onGetListOfAbst();
        // this.onGetListOfUOM();
    },
    

    onSelectItemName: function(){
      var itemCode = sap.ui.getCore().byId("itmName").getSelectedKey();
      sap.ui.getCore().byId("itmID").setValue(itemCode);
      //localStorage.setItem("sBarcode", sap.ui.getCore().byId("itmID").getValue());
      this.openLoadingFragment();
      fitemUOMcode = sap.ui.getCore().byId("itmID").getValue();
      this.onGetListOfAbst();
      // getBarcode here
    },

    onGetListOfAbst: function(){
    var that = this;
    gitemUOMcode = fitemUOMcode;
   
    var sServerName = localStorage.getItem("ServerID");
    var sUrl = sServerName + "/b1s/v1/BarCodes?$filter=ItemNo eq '" + gitemUOMcode + "'";
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
             that.closeLoadingFragment();
            }, error: function() { 
              that.closeLoadingFragment()
              console.log("Error Occur");
            }
        })
      }
    },

  onPressEdit: function(){
    if (!this.editItem) {
      this.editItem = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.editItem", this);
      this.getView().addDependent(this.editItem);
    }
    this.editItem.open();
  },

  onShowEdit: function(oEvent){
  var that = this;
  that.openLoadingFragment();

  that.onPressEdit();
  
  var myInputControl = oEvent.getSource(); // e.g. the first item
  var boundData = myInputControl.getBindingContext('oModel').getObject();
  listpath = myInputControl.getBindingContext('oModel').getPath();
  var indexItem = listpath.split("/");
  indS =indexItem[2];
  fitemUOMcode = boundData.ItemCode;
  that.onGetListOfAbst();
  that.onGetListOfUOM();

    sap.ui.getCore().byId("eItemID").setValue(boundData.ItemCode);
    sap.ui.getCore().byId("eItemName").setValue(boundData.ItemName);
    sap.ui.getCore().byId("iUOMID").setValue(boundData.UoMCode);
    sap.ui.getCore().byId("curiUOMID").setValue(boundData.UoMCode);
    sap.ui.getCore().byId("iUOMID").setSelectedKey(boundData.AbsEntry);
    sap.ui.getCore().byId("eQtyID").setValue(boundData.Quantity);

    sap.ui.getCore().byId('eItemID').setEnabled(false);
    sap.ui.getCore().byId('eItemName').setEnabled(false);
   

    sap.ui.getCore().byId("eBarcode").setVisible(false);
    sap.ui.getCore().byId("curiUOMID").setVisible(false);
    sap.ui.getCore().byId("bttnSave").setEnabled(false);

   
    
    that.closeLoadingFragment();
  },


  onGetBarcodeOnEdit: function(){
   
    var that = this;
    var itmCode = sap.ui.getCore().byId("eItemID").getValue();
    var AbsEntryID = sap.ui.getCore().byId("iUOMID").getSelectedKey();
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
        sap.ui.getCore().byId("bttnSave").setEnabled(true);
        BcodUntContainer = response.value;
        that.oModel.getData().BarcodeUnit = BcodUntContainer;
        //that.oModel.refresh();
      }, error: function() { 
        that.closeLoadingFragment()
        console.log("Error Occur");
      }
  })
 
      that.closeLoadingFragment()
  },

  onSaveEdit: function(){
   
    var that = this;
    var editQty = sap.ui.getCore().byId("eQtyID").getValue();
    var editUOM = sap.ui.getCore().byId("iUOMID").getValue();
    if(editQty == "" || editQty <= 0){
      sap.m.MessageToast.show("Please input quantity");
      return;
    }else if(editUOM == ""){
      sap.m.MessageToast.show("Please Select UoM");
      return;
    }
    this.openLoadingFragment();
    var StoredItem = that.oModel.getData().value;
    var curItemCode = sap.ui.getCore().byId("eItemID").getValue();
    var curUOM = sap.ui.getCore().byId("curiUOMID").getValue();
    var editAbs = sap.ui.getCore().byId("iUOMID").getSelectedKey();
  
    //get new barcode
    var StoredBar = that.oModel.getData().BarcodeUnit;
    const getupBarC = StoredBar.filter(function(BCD){
    return BCD.ItemNo == curItemCode && BCD.UoMEntry == editAbs;})
    
    var editBarcode;
    if(getupBarC.length != 0 ){
      editBarcode = getupBarC[0].Barcode;
    }

    const updelItem = StoredItem.filter(function(OIT){
    return OIT.ItemCode == curItemCode && OIT.UoMCode ==editUOM;})

      if(parseInt(updelItem.length) != 0){
        
        if(editUOM == curUOM){
          updelItem[0].Quantity = parseInt(editQty);
        }else{
          updelItem[0].Quantity = parseInt(updelItem[0].Quantity) + parseInt(editQty);
          StoredItem.splice(indS,1);   
        }
       
      }else{
        StoredItem[indS].Quantity = editQty;
        StoredItem[indS].UoMCode = editUOM;
        StoredItem[indS].AbsEntry = editAbs; 
      }
       
      that.oModel.refresh();
      that.closeLoadingFragment();
      that.onCloseEdit();
  },

  onDeleteItem(oEvent){
    var that = this;
    var StoredItem = that.oModel.getData().value;
  
    MessageBox.information("Are you sure you want to delete this Item??", {
      actions: [MessageBox.Action.YES, MessageBox.Action.NO],
      title: "Delete Item",
      icon: MessageBox.Icon.QUESTION,
      styleClass:"sapUiSizeCompact",
      onClose: function (sButton) {
        if(sButton == "YES"){
          StoredItem.splice(indS,1);
          that.oModel.refresh();
        }
      }
    });
    this.onCloseEdit();
  },

  onEnableBttn: function(){
      sap.ui.getCore().byId("bttnSave").setEnabled(true);    
  },

  onCloseEdit: function(){
    if(this.editItem){
        this.editItem.close();
    }
    this.closeLoadingFragment();
  
  },


  });
});
