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

  return Controller.extend("com.ecoverde.ECOVERDE.controller.CreateCount", {
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

      this.getView().byId("Mcounter").setVisible(false);
      this.getView().byId("Mvalidator").setVisible(false);
      this.getView().byId("empID").setVisible(false);

      this.getView().byId("CounterTyp").setEnabled(false);
      this.getView().byId('userID').setEnabled(false);

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today =  yyyy+ mm + dd;
      this.byId("DP8").setValue(today);
    },

  onSelectCountType: function(){
        var CNtype =  this.getView().byId("CountTypeID").getSelectedKey();
        this.getView().byId("CounterTyp").setEnabled(false);
        this.getView().byId('userID').setEnabled(false);
  
        if(CNtype == "ctSingleCounter"){

          this.getView().byId("regID").setVisible(true);
          this.getView().byId("CounterType").setVisible(true);
          this.getView().byId("Mcounter").setVisible(false);
          this.getView().byId("Mvalidator").setVisible(false);
          // this.onGetListEmp();
          this.getView().byId('CounterTyp').setEnabled(true);
        }else{
          this.getView().byId("regID").setVisible(false);
          this.getView().byId("CounterType").setVisible(false);
          this.getView().byId("Mcounter").setVisible(true);
          this.getView().byId("Mvalidator").setVisible(true);
          // this.onGetListEmp();
          // this.onGetListEmp();
        }

      },


  onSelectUType: function(){
      var Countertype =  this.getView().byId("CounterTyp").getSelectedKey();

      if(Countertype == "ctUser"){
        this.getView().byId("regID").setVisible(true);
        this.getView().byId("empID").setVisible(false);
        this.ongetListuser();
        this.getView().byId('userID').setEnabled(true);
      }else{
        this.getView().byId("empID").setVisible(true);
        this.getView().byId("regID").setVisible(false);
        this.getView().byId('userID').setEnabled(false);
        this.onGetListEmp();
      }

      },
    
  ongetListuser: function(){
		
      var that = this;
      that.openLoadingFragment();
			that.oModel = new JSONModel("model/item.json");
			that.getView().setModel(this.oModel, "oModel");
		   
			  var sServerName = localStorage.getItem("ServerID");
			  var sUrl = sServerName + "/b1s/v1/Users?$select=InternalKey,UserPassword,UserCode"
			  $.ajax({
				url: sUrl,
				type: "GET",
				dataType: 'json',
				crossDomain: true,
				xhrFields: {
				  withCredentials: true},
				success: function(response){
          that.oModel.getData().Counters = response.value;
          // console.log(that.oModel.getData().Counters)
				  that.oModel.refresh();
				  that.closeLoadingFragment()
				}, error: function() { 
				  that.closeLoadingFragment()
				  console.log("Error Occur");
				}
			})
      },
       
  onGetListEmp: function(){
		
        var that = this;
        that.openLoadingFragment();   
        that.oModel = new JSONModel("model/item.json");
        that.getView().setModel(this.oModel, "oModel");
        
          var sServerName = localStorage.getItem("ServerID");
          var sUrl = sServerName + "/b1s/v1/EmployeesInfo?$select=EmployeeID,LastName,FirstName";
          $.ajax({
          url: sUrl,
          type: "GET",
          dataType: 'json',
          crossDomain: true,
          xhrFields: {
            withCredentials: true},
          success: function(response){
            that.oModel.getData().Employee = response.value;
            // console.log(that.oModel.getData().Employee)
            that.oModel.refresh();
            that.closeLoadingFragment()
          }, error: function() { 
            that.closeLoadingFragment()
            console.log("Error Occur");
          }
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
  
  onPressAddItem: function(){
        var that = this;
        that.onGetItem();
            if (!that.addItemCount) {
              that.addItemCount = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.InventoryCount.addInventoryCount", this);
              that.getView().addDependent(that.addItemCount);
              that.oModel.refresh();
            }
            
            that.addItemCount.open();
          },
        
  onCloseEdit: function(){
            if(this.addItemCount){
                this.addItemCount.close();
            }
          },
  
  onGetItem: function(){
      this.openLoadingFragment();
      var sServerName = localStorage.getItem("ServerID");
      var sUrl = sServerName + "/b1s/v1/Items?$select=ItemCode,ItemName&$filter=BarCode ne 'null'";
            
        $.ajax({
          url: sUrl,
          type: "GET",
          crossDomain: true,
          xhrFields: {
          withCredentials: true
                  },
          error: function (xhr, status, error) {
            this.closeLoadingFragment();
            sap.m.MessageToast(xhr.responseJSON.error.message.value);
                  },
                  success: function (json) {
                    this.oModel.getData().itemMaster  = json.value;
                  
                    this.oModel.refresh();
                    this.closeLoadingFragment();
                  },
                  context: this
                })
          },

  handleSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("ItemCode", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("itemMaster");
            oBinding.filter([oFilter]);
          },

  handleClose: function (oEvent) {
            // reset the filter
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([]);
            this.oModel.getData().SelectedItemCount = [];
            var aContexts = oEvent.getParameter("selectedContexts");
            if (aContexts && aContexts.length) {
             
              var getJSONITEM = aContexts.map(function (oContext) { return oContext.getObject().ItemCode; }).join(",");
              var splitITEM = getJSONITEM.split(",");
            
              for(var i = 0;i < splitITEM.length; i++){
              this.oModel.getData().SelectedItemCount.push({
                "ItemCode" : splitITEM[i]
              });
            }
              this.oModel.refresh();
            }
      
          },


  onConfirmAddCounnt: function(){
            var that = this;
            var itemJSON = that.oModel.getData().SelectedItemCount;
            if(parseInt(itemJSON.length) == 0){
              sap.m.MessageToast.show("Please Select item First");
            }else{
            MessageBox.information("Are you sure you want to [CREATE INVENTORY COUNT] for this Items?", {
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              title: "Inventory Counting",
              icon: MessageBox.Icon.QUESTION,
              styleClass:"sapUiSizeCompact",
              onClose: function (sButton) {
                if(sButton === "YES"){
                  that.onSaveSingle();
                }}
            });
            }
          
          },         

  onSaveSingle: function(){
    var that = this;
    var oView = that.getView();
    that.getView().byId("userID").getSelectedKey()
    var sServerName = localStorage.getItem("ServerID");
    var UIDs;

    if(that.getView().byId("CounterTyp").getSelectedKey() == "ctUser"){
      UIDs = that.getView().byId("userID").getSelectedKey();
    }else{
      UIDs = that.getView().byId("employeeID").getSelectedKey();
    }


    var sUrl = sServerName + "/b1s/v1/InventoryCountings";
      var CountingItem = {
        "CountDate":  oView.byId("DP8").getValue(),
        "SingleCounterType":  that.getView().byId("CounterTyp").getSelectedKey(),
        "SingleCounterID": UIDs,
        "CountingType": that.getView().byId("CountTypeID").getSelectedKey(),
        "InventoryCountingLines": []
      };
      var selectedItem = that.oModel.getData().SelectedItemCount;
      for(var i=0;i < selectedItem.length; i++){ 
          CountingItem.InventoryCountingLines.push(
            {
              "ItemCode": selectedItem[i].ItemCode,
              "WarehouseCode": localStorage.getItem("wheseID")
            });
          }

        console.log(CountingItem)
        CountingItem = JSON.stringify(CountingItem);
        $.ajax({
          url: sUrl,
          type: "POST",
          data: CountingItem,
          headers: {
            'Content-Type': 'application/json'},
          crossDomain: true,
          xhrFields: {withCredentials: true},
          error: function (xhr, status, error) {
            that.closeLoadingFragment();
            sap.m.MessageToast.show("Unable to post due to:\n" + xhr.responseJSON.error.message.value);
            },
          success: function (json) {
            //console.log(json);
            that.closeLoadingFragment();
                  MessageBox.information("Item successfully added new inventory counting \nDocumentNumber:" + json.DocumentNumber, {
                    actions: [MessageBox.Action.OK],
                    title: "Inventory Counting",
                    icon: MessageBox.Icon.INFORMATION,
                    styleClass:"sapUiSizeCompact",
                    onClose: function () {
                      that.oModel.getData().SelectedItemCount = [];
                      that.oModel.refresh();
                      that.onPressNavBack();
                    }
                  });
                
                },context: this
              });

              //Update Purchase Order;
        }, 
  
  onPressNavBack: function(){
          this.router = this.getOwnerComponent().getRouter();
          this.router.navTo("inventoryCountMenu",null, true);
        },

  });
});
