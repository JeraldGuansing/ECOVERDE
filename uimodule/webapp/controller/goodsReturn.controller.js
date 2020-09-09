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
  var itmBar;
  var uomntry;
  var listpath;
  var indS;
  var iBarc;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsReturn", {
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
        this.oModel = new JSONModel("model/item.json");
        this.getView().setModel(this.oModel, "oModel");
      },


onPressNavBack: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("goodsIssueMenu");
    },

onPressAddr: function(){
      if (!this.addgoodsReturn) {
        this.addgoodsReturn = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.addGoodsReturn", this);
        this.getView().addDependent(this.addgoodsReturn);
      }

      sap.ui.getCore().byId("retItemCode").setValue("");
      sap.ui.getCore().byId("retItemCode").setSelectedKey("");
      sap.ui.getCore().byId("retItemName").setValue("");
      sap.ui.getCore().byId("retItemName").setSelectedKey("");
      sap.ui.getCore().byId("retUOM").setValue("");
      sap.ui.getCore().byId("retUOM").setSelectedKey("");
      sap.ui.getCore().byId("retVendor").setValue("");
      sap.ui.getCore().byId("retVendor").setSelectedKey("");
      sap.ui.getCore().byId("retQtyID").setValue("");

     
      this.onGetListVendor();
      this.addgoodsReturn.open();
    },

onSaveItem: function(){
      var that = this;
      that.openLoadingFragment();
      var sItmID = sap.ui.getCore().byId("retItemCode").getValue();
      var sItmName = sap.ui.getCore().byId("retItemName").getValue();
      var sUoM = sap.ui.getCore().byId("retUOM").getValue();
      var sUoMEntry = sap.ui.getCore().byId("retUOM").getSelectedKey();
      var sCardName = sap.ui.getCore().byId("retVendor").getValue();
      var sCardCode = sap.ui.getCore().byId("retVendor").getSelectedKey();
      var sqty = sap.ui.getCore().byId("retQtyID").getValue();
      
      if(sItmID == ""){
        sap.m.MessageToast.show("Please select Item Code");
        that.closeLoadingFragment();
        return;
      }else if(sItmName == ""){
        sap.m.MessageToast.show("Please select Item Name");
        that.closeLoadingFragment();
        return;
      }else if(sUoM == ""){
        sap.m.MessageToast.show("Please select UoM");
        that.closeLoadingFragment();
        return;
      }else if(sCardName == ""){
        sap.m.MessageToast.show("Please select Vendor");
        that.closeLoadingFragment();
        return;
      }else if(sqty == "" || sqty <= 0){
        sap.m.MessageToast.show("Please Input Item Quantity");
        that.closeLoadingFragment();
        return;
      }else{
    
        var StoredItem = that.oModel.getData().goodsReturn;        
            const oITM = StoredItem.filter(function(OIT){
            return OIT.ItemCode == sItmID && OIT.UoMCode == sUoM && OIT.sCardName == sCardName;
             }) 
        var cResult = parseInt(oITM.length);
        if(cResult == 0){
         
          that.oModel.getData().goodsReturn.push({
            "CardCode": sCardCode,
            "CardName": sCardName,
            "ItemCode": sItmID,
            "ItemName": sItmName,
            "Quantity": sqty,
            "UoMCode": sUoM,
            "UoMEntry": sUoMEntry,
            "Barcode": iBarc
          });
          localStorage.setItem("VendorCode",sCardCode);
          that.closeLoadingFragment();
        }else{
          oITM[0].Quantity = parseInt(oITM[0].Quantity) + parseInt(sqty);
          that.closeLoadingFragment();
        }
        that.closeLoadingFragment();
        that.oModel.refresh();
        that.onCloseIssuance();
      }
    },
    
onPostreturn: function(){
      var itemJSON = this.oModel.getData().goodsReturn;
      if(parseInt(itemJSON.length) == 0){
        sap.m.MessageToast.show("Please Input item First");
      }
      else{
        var that = this;
        that.openLoadingFragment();
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/PurchaseReturns";
        var oBody = {
          "CardCode": localStorage.getItem("VendorCode"),
          "DocumentLines": []};
        var posItem = this.oModel.getData().goodsReturn;

        var x = posItem.length;
        for(var i = 0; i < x; i++){
        oBody.DocumentLines.push({
          "ItemCode":posItem[i].ItemCode,
          "Quantity":posItem[i].Quantity,
          "UoMEntry":posItem[i].UoMEntry,
          "UoMCode": posItem[i].UoMCode,
          "WarehouseCode": localStorage.getItem("wheseID")
          });
        }
        console.log(oBody);
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
            sap.m.MessageToast.show("Unable to post the transaction due to\n" + error);
            },
          success: function (json) {
           
                  MessageBox.information("Items successfully returned,\nDoc Number Created:" + json.DocNum, {
                    actions: [MessageBox.Action.OK],
                    title: "Goods Return",
                    icon: MessageBox.Icon.INFORMATION,
                    styleClass:"sapUiSizeCompact"
                  });
                    this.oModel.setData({goodsReturn:[]});
                    this.oModel.updateBindings(true);
                    this.oModel = new JSONModel("model/item.json");
                    this.getView().setModel(this.oModel, "oModel");
    
                  this.oModel.refresh();
                  
                  that.closeLoadingFragment();
                },context: this
              });
    
      }
    },    

  
onCloseIssuance: function(){
      if(this.addgoodsReturn){
          this.addgoodsReturn.close();
      }
      // this.closeLoadingFragment();
    
    },

onGetItemRet: function(){
      var venCode = sap.ui.getCore().byId("retVendor").getSelectedKey();
      localStorage.setItem("VendorCode",venCode);
      this.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null'&$filter=Mainsupplier eq '"+ venCode +"'";
      
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
            that.closeLoadingFragment();
          }
          
        },

onGetBarcode: function(){
      
          var that = this;
          var itmCode = itmBar;
          var AbsEntryID = uomntry;
      
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
              iBarc = [BcodUntContainer[0].Barcode];
              that.closeLoadingFragment();
            }, error: function() { 
              that.closeLoadingFragment()
              console.log("Error Occur");
            }
        })
            that.closeLoadingFragment()
        },      
        

onGetListVendor: function(){
          var that = this;   
            var sServerName = localStorage.getItem("ServerID");
            var sUrl = sServerName + "/b1s/v1/BusinessPartners?$select=CardCode,CardName";
            $.ajax({
              url: sUrl,
              type: "GET",
              dataType: 'json',
              crossDomain: true,
              xhrFields: {
                withCredentials: true},
              success: function(response){
                that.oModel.getData().VendorList = response.value;
                that.oModel.refresh();
            
              }, error: function() { 
                that.closeLoadingFragment()
                console.log("Error Occur");
              }
          })
        }, 


        onSelectItemCode: function(){
          var itemName = sap.ui.getCore().byId("retItemCode").getSelectedKey();
          sap.ui.getCore().byId("retItemName").setValue(itemName);
          this.openLoadingFragment();
          fitemUOMcode = sap.ui.getCore().byId("retItemCode").getValue();
          this.onGetListOfAbst();
          // this.onGetListOfUOM();
      },
      
    
      onSelectItemName: function(){
        var itemCode = sap.ui.getCore().byId("retItemName").getSelectedKey();
        sap.ui.getCore().byId("retItemCode").setValue(itemCode);
        //localStorage.setItem("sBarcode", sap.ui.getCore().byId("itmID").getValue());
        this.openLoadingFragment();
        fitemUOMcode = sap.ui.getCore().byId("retItemCode").getValue();
        this.onGetListOfAbst();
        // getBarcode here
      },
    
      onSelectUoM: function(){
        var that = this;
        itmBar =  sap.ui.getCore().byId("retItemCode").getValue();
        uomntry = sap.ui.getCore().byId("retUOM").getSelectedKey();
        that.onGetBarcode(); 
      },

  });
});
