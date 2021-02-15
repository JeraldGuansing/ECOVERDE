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
    var docNUM;
    var indx;
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

      this.oModel.getData().SelectedItemProd = [];


      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      var yyyy = today.getFullYear();
      
      today =  yyyy+ mm + dd;
      this.byId("DP8").setValue(today);
      this.onGetTransactionType();
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
    this.openLoadingFragment();
    var that = this;  
    var sServerName = localStorage.getItem("ServerID");
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/ProductionOrderHeader.xsjs?WHID=" + localStorage.getItem("wheseID");
      
    $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));
        },
        xhrFields: {
          withCredentials: true},
        success: function(response){

          var OWOR = [];
          var WOR =  response;
          var count = Object.keys(WOR).length;
         
          for(let o = 0; o < count;o++){
            var strdate = WOR[o].PostDate;
            var res = strdate.substring(0, 10);
            OWOR.push({
              "DocEntry": WOR[o].DocEntry,
              "DocNum": WOR[o].DocNum,
              "ItemCode": WOR[o].ItemCode,
              "PostDate": WOR[o].PostDate,
              "Project": WOR[o].Project,
              "OcrCode": WOR[o].OcrCode,
              "Concatination": WOR[o].ItemCode + "\n" + res + "\n" + WOR[o].Project + "\n" + WOR[o].OcrCode
            });
          }
          that.oModel.getData().ProductionList = OWOR;
          that.oModel.refresh();
          that.closeLoadingFragment()
        }, error: function() { 
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
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
      var spat = aContexts[0].sPath;
      var splitITEM = spat.split("/");
      indx = splitITEM[2];
    
      var podlist = this.oModel.getData().ProductionList;
      docNUM = podlist[indx].DocEntry;

      // console.log(docNUM)
      // this.oModel.refresh();

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
    var that = this;  
    var sServerName = localStorage.getItem("ServerID");
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/ProductionOrderItem.xsjs?doc=" + docNUM;
      
    $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));
        },
        xhrFields: {
          withCredentials: true},
        success: function(response){
       
          var WOR1 = [];
          var WOR =  response;
          var count = Object.keys(WOR).length;
          if(count != 0){
          for(let o = 0; o < count;o++){
           
            var resQuant = parseInt(WOR[o].BaseQty) - parseInt(WOR[o].IssuedQty);
              WOR1.push({
                "DocEntry": WOR[o].DocEntry,
                "DocNum": WOR[o].DocNum,
                "LineNum": WOR[o].LineNum,
                "ItemCode": WOR[o].ItemCode,
                "ItemName": WOR[o].ItemName,
                "Quantity": resQuant,
                "OcrCode": WOR[o].OcrCode,
                "Project": WOR[o].Project,
                "UomEntry": WOR[o].UomEntry,
                "UomCode": WOR[o].UomCode
              });
          }
          that.oModel.getData().ProductionItem = WOR1;
          that.oModel.refresh();
          that.closeLoadingFragment();
          
        }else{
          sap.m.MessageToast.show("No Item Found");
          that.closeLoadingFragment();
        }
        }, error: function() { 
          that.closeLoadingFragment()
          console.log("Error Occur");
        }
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
            "DocEntry":  ol[x].DocEntry,
            "DocNum": ol[x].DocNum,
            "LineNum":  ol[x].LineNum,
            "ItemCode":  ol[x].ItemCode,
            "ItemName":  ol[x].ItemName,
            "Quantity":  ol[x].Quantity,
            "OcrCode":  ol[x].OcrCode,
            "Project":  ol[x].Project,
            "UomEntry":  ol[x].UomEntry,
            "UomCode":  ol[x].UomCode
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
   
    sap.ui.getCore().byId("isProdID").setValue(boundData.DocNum);
    sap.ui.getCore().byId("isPEItemC").setValue(boundData.ItemCode);
    sap.ui.getCore().byId("isPEItemN").setValue(boundData.ItemName);
    sap.ui.getCore().byId("isPEItemU").setValue(boundData.UomCode);
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
  this.oModel.refresh();
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
        "LineNum": i,
        "WarehouseCode":localStorage.getItem("wheseID"),
        "BaseLine": StoredItem[i].LineNum,
        "AccountCode": "11324002",
        "Quantity": StoredItem[i].Quantity,
        "UomEntry": StoredItem[i].UomEntry,
        "BaseEntry": StoredItem[i].DocEntry,
        "CostingCode":  StoredItem[i].OcrCode,
        "Project": StoredItem[i].Project
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
                    styleClass:"sapUiSizeCompact",
                    onClose: function () {
                      this.onPressIssuance();
                      this.oModel.refresh();
                      
                    }

                  });
                   
                  that.closeLoadingFragment();
                },context: this
              });
   },

  onGetTransactionType: function(){
    // this.openLoadingFragment();
    var sServerName = localStorage.getItem("ServerID");
    // var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null'";
    var xsjsServer = sServerName.replace("50000", "4300");
    var sUrl = xsjsServer + "/app_xsjs/ExecQuery.xsjs?procName=spAppGetGIType&dbName=" + localStorage.getItem("dbName");
    
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
          beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));

          },
          success: function (response) {
            this.oModel.getData().GIType  = response;
            this.oModel.refresh();
            this.closeLoadingFragment();
          },
          context: this
        })
  },

  });
});
