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
   
    this.onGetProdItem();
    if (!this.ProdItem) {
      this.ProdItem = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.ProductionList200", this);
      this.getView().addDependent(this.ProdItem);
    }
   
    this.ProdItem.open();
 
  },

  onGetProdItem: function(){
    this.openLoadingFragment();
      var selectedProd =  this.oModel.getData().SelectedProd;
      ITMDEL = {};
      arrrITM = [];
      const UOMName ={};
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/ProductionOrders?$select=AbsoluteEntry,ProductionOrderLines&$filter=DocumentNumber eq "+ selectedProd[0].DocumentNumber +" and Warehouse eq '" + localStorage.getItem("wheseID") + "'";
      
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
              localStorage.setItem("DocEntry",json.value[0].AbsoluteEntry);
              var res = json.value[0].ProductionOrderLines;
              var BaseQuantity;
              var Warehouse;
              var UoMEntry;
              var UoMCode;
              var projName;
              var LineNumber;
              
              for(var i = 0;i < res.length;i++){
                fitemUOMcode = res[i].ItemNo;
                itmUoM = res[i].UoMEntry;
                BaseQuantity = res[i].BaseQuantity;
                LineNumber = res[i].LineNumber;
                Warehouse = res[i].Warehouse;
                UoMEntry = res[i].UoMEntry;
                UoMCode = res[i].UoMCode;
                projName = res[i].Project;
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
                      ITMDEL.ItemCode = json.value[0].ItemCode;
                      ITMDEL.ItemName = json.value[0].ItemName;
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
                            "UoMCode": UoMCode,
                            "LineNumber": LineNumber,
                            "ProjectName": projName,
                          });
                        }

                      })
                      this.closeLoadingFragment();
                }
              this.oModel.getData().ProductionItem = arrrITM;
              // console.log(this.oModel.getData().ProductionItem)
              this.oModel.refresh();
              
            },
            context: this
          })         
  },

  onSelectProdItem: function (oEvent) {
    var arr = [];
     var aItems = sap.ui.getCore().byId('tblList2').getItems();
      var aSelectedItems = [];
      for (var i=0; i<aItems.length;i++) {
           if (aItems[i].getSelected() == true) {
                aSelectedItems.push(aItems[i].oBindingContexts.oModel.sPath);
           }
      }
     
      for(let a = 0;a < aSelectedItems.length;a++){
        var indexItem = aSelectedItems[a].split("/");
        arr.push(indexItem[2]);
      }

      var ol = this.oModel.getData().ProductionItem;
      for(let x = 0;x < arr.length;x++){
        this.oModel.getData().SelectedItemProd.push(
          {
            "ItemCode": ol[x].ItemNo,
            "Quantity":ol[x].BaseQuantity,
            "UoMCode":ol[x].UoMName,
            "ItemName":ol[x].ItemName,
            "UoMC":ol[x].UoMCode,
            "UoMEntry": ol[x].UoMEntry,
            "DocumentNumber": ol[x].DocumentNumber,
            "ProjectName": ol[x].ProjectName,
            "LineNumber": ol[x].LineNumber
          }
        )
      }
     
      this.oModel.refresh();
      
  },

onshowEditDialog: function(){
    if (!this.editItemisP) {
      this.editItemisP = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.editIssueProject", this);
      this.getView().addDependent(this.editItemisP);
    }
    this.editItemisP.open();
  },
  
onPressOpenEdit:function(oEvent){
  var that = this;
  that.openLoadingFragment();

  that.onshowEditDialog();
  
  var myInputControl = oEvent.getSource(); // e.g. the first item
  var boundData = myInputControl.getBindingContext('oModel').getObject();
  listpath = myInputControl.getBindingContext('oModel').getPath();
  var indexItem = listpath.split("/");
  indS =indexItem[2];
   
    sap.ui.getCore().byId("isProdID").setValue(boundData.DocumentNumber);
    sap.ui.getCore().byId("isPEItemC").setValue(boundData.ItemCode);
    sap.ui.getCore().byId("isPEItemN").setValue(boundData.ItemName);
    sap.ui.getCore().byId("isPEItemU").setValue(boundData.UoMCode);
    sap.ui.getCore().byId("isPEItemQ").setValue(boundData.Quantity);

    sap.ui.getCore().byId('isProdID').setEnabled(false);
    sap.ui.getCore().byId('isPEItemC').setEnabled(false);
    sap.ui.getCore().byId('isPEItemN').setEnabled(false);
    sap.ui.getCore().byId('isPEItemU').setEnabled(false);
 
    that.closeLoadingFragment();
},


onSaveEditItem: function(){
  var StoredItem = this.oModel.getData().SelectedItemProd;
  var QtyE = sap.ui.getCore().byId("isPEItemQ").getValue();
  if(parseInt(QtyE) == "" || parseInt(QtyE) ==0){
    sap.m.MessageToast.Show("Please Enter Quantity");
  }else{
  StoredItem[indS].Quantity = QtyE;

  this.onPressCloseEdit();
  that.oModel.refresh();
}

},

onPressCloseEdit: function(){
    if(this.editItemisP){
        this.editItemisP.close();
    }
  },

onDeleteItem(oEvent){
    var that = this;
    var StoredItem = that.oModel.getData().SelectedItemProd;
  
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
    this.onPressCloseEdit();
  },
  
  onConfirmPosting: function(){
    var that = this;
  
    var itemJSON = this.oModel.getData().SelectedItemProd;
    if(parseInt(itemJSON.length) == 0){
      sap.m.MessageToast.show("Please Scan/Input item First");
    }
    else{

    MessageBox.information("Are you sure you want to [POST] this transaction?", {
      actions: [MessageBox.Action.YES, MessageBox.Action.NO],
      title: "POST Issuance to project",
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
    var sUrl = sServerName + "/b1s/v1/InventoryGenExits";
    var oBody = {
      "DocDate": that.getView().byId("DP8").getValue(),
      "DocumentLines": []};          
  
    var StoredItem = this.oModel.getData().SelectedItemProd;
    for(var i = 0;i < StoredItem.length;i++){
      oBody.DocumentLines.push({
        "BaseLine": StoredItem[i].LineNumber,
        "Quantity": StoredItem[i].Quantity,
        "UoMEntry": StoredItem[i].UoMEntry,
        "BaseEntry": localStorage.getItem("DocEntry"),
        "Project":  StoredItem[i].ProjectName
        });
      }
      console.log(oBody)
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
            sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
            },
          success: function (json) {
                  MessageBox.information("Production Order successfully Issued,\nNew Doc Number Created:" + json.DocNum, {
                    actions: [MessageBox.Action.OK],
                    title: "Issuance to Project",
                    icon: MessageBox.Icon.INFORMATION,
                    styleClass:"sapUiSizeCompact"
                  });
                   
                    
                  this.onPressIssuance();
                  this.oModel.refresh();
                  
                  that.closeLoadingFragment();
                },context: this
              });
   },
  });
});
