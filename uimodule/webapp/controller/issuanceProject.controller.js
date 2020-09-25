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
    var itmUoM;
    var ITMDEL;
    var arrrITM;
    var indS;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.issuanceProject", {
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
      // this.onGetCountSheet();

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      
      today =  yyyy+ mm + dd;
      this.byId("DP8").setValue(today);

    },

    onPressIssuance: function (){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsIssueMenu",null, true);
    },

    onPressAdd: function(){
      if (!this.addProd) {
        this.addProd = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.AddProduction", this);
        this.getView().addDependent(this.addProd);
      }
   
      this.onGetItem();
      this.addProd.open();
  
      sap.ui.getCore().byId("PRItemCode").setValue("");
      sap.ui.getCore().byId("PRItemCode").setSelectedKey("");
      sap.ui.getCore().byId("PRItemName").setValue("");
      sap.ui.getCore().byId("PRItemName").setSelectedKey("");
      sap.ui.getCore().byId("PRUOM").setValue("");
      sap.ui.getCore().byId("PRUOM").setSelectedKey("");
      sap.ui.getCore().byId("PRQtyID").setValue("");
    
   
   
    },

    onCloseAdd: function(){
      if(this.addProd){
          this.addProd.close();
      }
      this.closeLoadingFragment();
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
          that.closeLoadingFragment();
          console.log("Error Occur");
        }
    })
    //Get UOMList
    
      },
  

    onSelectItemCode: function(){
      var itemName = sap.ui.getCore().byId("PRItemCode").getSelectedKey();
      sap.ui.getCore().byId("PRItemName").setValue(itemName);
      this.openLoadingFragment();
      fitemUOMcode = sap.ui.getCore().byId("PRItemCode").getValue();
      this.onGetListOfAbst();
      // this.onGetListOfUOM();
  },
  

  onSelectItemName: function(){
    var itemCode = sap.ui.getCore().byId("PRItemName").getSelectedKey();
    sap.ui.getCore().byId("PRItemCode").setValue(itemCode);
    //localStorage.setItem("sBarcode", sap.ui.getCore().byId("itmID").getValue());
    this.openLoadingFragment();
    fitemUOMcode = sap.ui.getCore().byId("PRItemCode").getValue();
    this.onGetListOfAbst();
    // getBarcode here
  },

  
    onAddItem: function(){
      var that = this;
      that.openLoadingFragment();
      var sItmID = sap.ui.getCore().byId("PRItemCode").getValue();
      var sItmName = sap.ui.getCore().byId("PRItemName").getValue();
      var sQtyID = sap.ui.getCore().byId("PRQtyID").getValue();
      var sUoMID = sap.ui.getCore().byId("PRUOM").getValue();
      var AbsEntryID = sap.ui.getCore().byId("PRUOM").getSelectedKey();

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
        if(StoredBarc.length != 0){
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

  onShowListItem: function(){
    this.openLoadingFragment();
    if (!this.ProdList) {
      this.ProdList = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.ProductionList", this);
      this.getView().addDependent(this.ProdList);
    }
    this.onShowListProd();
    this.ProdList.open();
    this.closeLoadingFragment();
  },

  onShowListProd: function(){
    // this.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/ProductionOrders?$select=DocumentNumber,CustomerCode&$filter=ProductionOrderStatus eq 'boposReleased' and Warehouse eq '" + localStorage.getItem("wheseID") + "'";
     
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
              
              this.oModel.getData().ProductionList  = json.value;
              this.oModel.refresh();
         
            },
            context: this
          })
  },

// handleSearch: function (oEvent) {
//     var sValue = oEvent.getParameter("value");
//     var oFilter = new Filter("DocumentNumber", FilterOperator.Contains, sValue);
//     console.log(oFilter)
//     var oBinding = oEvent.getSource().getBinding("ProductionList");
//     console.log(oBinding)
//     oBinding.filter([oFilter]);
//   },

handleClose: function (oEvent) {
    // reset the filter
    var oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([]);
    this.oModel.getData().SelectedProd = [];
    var aContexts = oEvent.getParameter("selectedContexts");
    if (aContexts && aContexts.length) {
     
      var getJSONITEM = aContexts.map(function (oContext) { 
      return oContext.getObject().DocumentNumber; }).join(",");
      var splitITEM = getJSONITEM.split(",");
    
      for(var i = 0;i < splitITEM.length; i++){
      this.oModel.getData().SelectedProd.push({
        "DocumentNumber": splitITEM[i]
      });
    }
      // console.log(this.oModel.getData().SelectedProd)
      this.oModel.refresh();
      this.onShowItemProd();
    }
  },

  onShowItemProd: function(){
    this.openLoadingFragment();
    this.onGetProdItem();
    if (!this.ProdItem) {
      this.ProdItem = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.ProductionList200", this);
      this.getView().addDependent(this.ProdItem);
    }
   
    this.ProdItem.open();
    this.closeLoadingFragment();
  },

  onGetProdItem: function(){
      var selectedProd =  this.oModel.getData().SelectedProd;
      ITMDEL = {};
      arrrITM = [];
      const UOMName ={};
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/ProductionOrders?$select=ProductionOrderLines&$filter=DocumentNumber eq "+ selectedProd[0].DocumentNumber +" and Warehouse eq '" + localStorage.getItem("wheseID") + "'";
      
      $.ajax({
        url: sUrl,
            type: "GET",
            dataType: 'json',
            async: false,
            crossDomain: true,
            xhrFields: {
            withCredentials: true
            },
            error: function (xhr, status, error) {
              this.closeLoadingFragment();
              console.log("Error Occured");
            },
            success: function (json) {
              var res = json.value[0].ProductionOrderLines;
              var BaseQuantity;
              var Warehouse;
              var UoMEntry;
              var UoMCode;
            
              for(var i = 0;i < res.length;i++){
                fitemUOMcode = res[i].ItemNo;
                itmUoM = res[i].UoMEntry;
                BaseQuantity = res[i].BaseQuantity;
                Warehouse = res[i].Warehouse;
                UoMEntry = res[i].UoMEntry;
                UoMCode = res[i].UoMCode;
              
                var sUrlI = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=ItemCode eq '" + fitemUOMcode + "'";
      
                $.ajax({
                  url: sUrlI,
                      type: "GET",
                      dataType: 'json',
                      crossDomain: true,
                      async: false,
                      xhrFields: {
                      withCredentials: true},
                      error: function (xhr, status, error) {
                        this.closeLoadingFragment();
                        console.log("Error Occured");},
                      success: function (json) {
                      ITMDEL.ItemCode = json.value[0].ItemCode
                      ITMDEL.ItemName = json.value[0].ItemName
                      }})

                      var sUrlU = sServerName + "/b1s/v1/UnitOfMeasurements?$select=Code,AbsEntry&$filter=AbsEntry eq " + itmUoM;
                      $.ajax({
                        url: sUrlU,
                        type: "GET",
                        dataType: 'json',
                        async: false,
                        crossDomain: true,
                        xhrFields: {
                          withCredentials: true},
                        success: function(response){
                          var getresult = response.value;
                          UOMName.UoM = getresult[0].Code;
                          
                          arrrITM.push({
                            "DocumentNumber": selectedProd[0].DocumentNumber,
                            "ItemNo": ITMDEL.ItemCode,
                            "ItemName": ITMDEL.ItemName,
                            "UoMName": UOMName.UoM,
                            "BaseQuantity": BaseQuantity,
                            "Warehouse": Warehouse,
                            "UoMEntry" : UoMEntry,
                            "UoMCode": UoMCode
                          });
                        }

                      })
                }
              this.oModel.getData().ProductionItem = arrrITM;
              this.oModel.refresh();
            },
            context: this
          })
       
  },


  onSelectProdItem: function (oEvent) {
    // reset the filter
    var oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([]);
    this.oModel.getData().SelectedProd = [];
    var aContexts = oEvent.getParameter("selectedContexts");
    if (aContexts && aContexts.length) {
      console.log(aContexts)
      var getJSONITEM = aContexts.map(function (oContext) { 
      return oContext.getObject().ItemNo; 
    
    }).join(",");
      var splitITEM = getJSONITEM.split(",");
    
     
    //   for(var i = 0;i < splitITEM.length; i++){
    //   this.oModel.getData().SelectedItemProd.push({
    //     "ItemCode": splitITEM[i]
    //   });
    // }
      // console.log(this.oModel.getData().SelectedProd)
      this.oModel.refresh();
    
     
    }

  },


  });
});
