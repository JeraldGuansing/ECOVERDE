sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "sap/m/MessageToast",
  "sap/ui/Device",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/Token",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function(Controller,MessageToast,Device,Filter,FilterOperator,Token,MessageBox,JSONModel) {
  "use strict";

  return Controller.extend("com.ecoverde.ECOVERDE.controller.warehouseReport", {
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
      this.onWhseList();
      this.getView().byId('BtnItm').setEnabled(false);
      this.onButtonDis();

    },

    onWhseList: function(){
      this.openLoadingFragment();
      this.oModel.getData().displayWHItem = [];
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Warehouses()?$select=WarehouseCode,WarehouseName&$filter=WarehouseCode ne '" + localStorage.getItem("wheseID") + "'";

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
              this.oModel.getData().warehouses = json.value;
              this.oModel.refresh();
              this.closeLoadingFragment();
            },
            context: this
          })

    },

    onGetItem: function(){
      this.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=Frozen eq 'tNO'";
      
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
              this.onButtonEnab();
              this.closeLoadingFragment();
            },
            context: this
          })

    },

    onPresSelectItem: function(){
      if (!this.viewItem) {
        this.viewItem = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.WarehouseReport.whseReportItem", this);
        this.getView().addDependent(this.viewItem);
      }
      this.onGetItem();
      this.viewItem.open();
    },

    onCloseSelectItem: function(){
      if(this.viewItem){
        this.viewItem.close();
     }
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

  onButtonDis: function(){
    this.getView().byId('BtnTrn').setEnabled(false);
  },

  onButtonEnab:function(){
    this.getView().byId('BtnTrn').setEnabled(true);
    this.getView().byId('BtnItm').setEnabled(true);
  },


  handleClose: function (oEvent) {
    // reset the filter
    var whseCode = this.getView().byId('whsID').getSelectedKey();
   
    var oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([]);
    this.oModel.getData().warehousesItem = [];
    var aContexts = oEvent.getParameter("selectedContexts");
    if (aContexts && aContexts.length) {
     
      var getJSONITEM = aContexts.map(function (oContext) { 
      return oContext.getObject().ItemCode; }).join(",");
      var splitITEM = getJSONITEM.split(",");
    
      for(var i = 0;i < splitITEM.length; i++){
      this.oModel.getData().warehousesItem.push({
        "ItemCode": splitITEM[i],
        "WarehouseCode": whseCode
      });
    }
      this.oModel.refresh();
    }


    this.onDisplayItemWH();

  },

  onDisplayItemWH: function(){
            this.clearSelection();
            var StoredItem = this.oModel.getData().warehousesItem;        
            this.oModel.getData().SelectedWhseItem = [];
            for(let i = 0;i < StoredItem.length;i++){
            this.openLoadingFragment();
            var sServerName = localStorage.getItem("ServerID");
            var sUrl = sServerName + "/b1s/v1/Items?$select=ItemWarehouseInfoCollection&$filter=ItemCode eq '" + StoredItem[i].ItemCode +"'";

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
                    var res = json.value[0].ItemWarehouseInfoCollection;
                      for(let a = 0;a < res.length;a++){
                        this.oModel.getData().SelectedWhseItem.push({
                          "ItemCode": res[a].ItemCode,
                          "ItemName": "",
                          "BarCode": "",
                          "UoMCode": "",
                          "AbsEntry": "",
                          "WarehouseCode": res[a].WarehouseCode,
                          "InStock": res[a].InStock,
                          "Committed": res[a].Committed,
                          "Ordered": res[a].Ordered
                        });     
                      }
                    
                    this.closeLoadingFragment();
                  },
                  context: this
                })
            } 
               this.oModel.getData().displayWHItem = [];
                var StoredWhse = this.oModel.getData().SelectedWhseItem; 
                for(let x =0;x < StoredItem.length;x++){
                  var oITM = StoredWhse.filter(function(OIT){
                  return OIT.ItemCode == StoredItem[x].ItemCode && OIT.WarehouseCode == StoredItem[x].WarehouseCode;})
                  this.oModel.getData().displayWHItem.push(oITM[0]);
                }

      var getdesc = this.oModel.getData().displayWHItem;
      for(let d =0;d < getdesc.length; d++){

        var sUrlD = sServerName + "/b1s/v1/Items?$select=ItemName,BarCode,InventoryUoMEntry&$filter=ItemCode eq '" + getdesc[d].ItemCode +"'";
        
        $.ajax({
          url: sUrlD,
              type: "GET",
              crossDomain: true,
              async: false,
              xhrFields: {
              withCredentials: true
              },
              error: function (xhr, status, error) {
                this.closeLoadingFragment();
                console.log("Error Occured" +  xhr.responseJSON.error.message.value);
              },
              success: function (json) {
                getdesc[d].ItemName = json.value[0].ItemName;
                getdesc[d].BarCode = json.value[0].BarCode;
                getdesc[d].UoMCode = json.value[0].InventoryUoMEntry;
                this.oModel.refresh();
               
              },
              context: this
            })
      }
        this.oModel.refresh();
  },

  getContextByIndex: function(evt) {
    var oTable = this.byId("tblID1");
    var iIndex = oTable.getSelectedIndex();
    if (iIndex < 0) {
      MessageToast.show("Please Select Item first");
    } else {
      this.ontransfer(); 
        }
  },

  clearSelection: function(evt) {
    this.byId("tblID1").clearSelection();
  },
  ontransfer:function(){

    var i = this.byId("tblID1").getSelectedIndices();
    var oList =  this.oModel.getData().displayWHItem;
  
    for(let x = 0;x < i.length;x++){
      var a = i[x];
      if(oList[a].InStock != 0){
          this.oModel.getData().TransferRequest.push({
          "ItemCode": oList[a].ItemCode,
          "ItemName":oList[a].ItemName,
          "BarCode": oList[a].BarCode,
          "Quantity": 0,
          "UoMCode": "",
          "AbsEntry":  oList[a].UoMCode,
          "WarehouseCode": oList[a].WarehouseCode
          });
        }
      }
    

  if(this.oModel.getData().TransferRequest !=0){
   sessionStorage.setItem('TRequest',JSON.stringify(this.oModel.getData().TransferRequest));
   localStorage.setItem("FromWhseID", this.getView().byId("whsID").getSelectedKey());
   localStorage.setItem("FromWhseNM", this.getView().byId("whsID").getValue());
   
    // console.log(this.oModel.getData().TransferRequest)

    this.router = this.getOwnerComponent().getRouter();
    this.router.navTo("TransferRequest200");
    }else{
      this.clearSelection();
      sap.m.MessageToast.show("Please Unselect 0 Instock First");
    }
  },


  });
});
