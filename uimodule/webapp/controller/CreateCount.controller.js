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
  var flagC;
  var listpath;
  var indS;
  var MultipleUserC = [];
  var MultipleEmpC = [];
  var teamUserC = [];
  var teamEmpC = [];
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


      // this.oModel.getData().IndvidualEmp = [];
      this.getView().byId("Mcounter").setVisible(false);
      this.getView().byId("Mvalidator").setVisible(false);
      this.getView().byId("empID").setVisible(false);

      this.getView().byId("CountTypeID").setValue("Single Counting");
      this.getView().byId("CountTypeID").setSelectedKey("ctSingleCounter");

      this.getView().byId("CounterTyp").setValue("User");
      this.getView().byId("CounterTyp").setSelectedKey("ctUser");

      this.ongetListuser();
      // this.getView().byId("CounterTyp").setEnabled(false);
      this.getView().byId('invIDs').setEnabled(false);
      this.getView().byId('teamIDs').setEnabled(false);

      this.getView().byId('invIDe').setEnabled(false);
      this.getView().byId('teamIDe').setEnabled(false);

      MultipleUserC = [];
      MultipleEmpC = [];
      teamUserC = [];
      teamEmpC = [];

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      
      today =  yyyy+ mm + dd;
      this.byId("DP8").setValue(today);
    },

  onSelectCountType: function(){
        var CNtype =  this.getView().byId("CountTypeID").getSelectedKey();
        // this.getView().byId("CounterTyp").setEnabled(false);
        // this.getView().byId('userID').setEnabled(false);
  
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
        // this.getView().byId('userID').setEnabled(false);
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
          },success: function (json) {
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
                "ItemCode" : splitITEM[i],
                 "ItemName": "",
                 "InStock": "",
                 "UoMName": "",
                 "InventoryUoMEntry": "",
                 "Freeze": "No"
              });
            }
             
            }
      this.onDisplayItem();
          },

  onDisplayItem: function(){
    var sServerName = localStorage.getItem("ServerID");
    var res = this.oModel.getData().SelectedItemCount
    var oITEM = [];
    for(let i =0;i < res.length;i++){

      var sUrlD = sServerName + "/b1s/v1/Items?$select=ItemName,InventoryUoMEntry,ItemWarehouseInfoCollection&$filter=ItemCode eq '" + res[i].ItemCode +"'";
        
      $.ajax({
        url: sUrlD,
            type: "GET",
            crossDomain: true,async: false,
            xhrFields: {withCredentials: true},
            error: function (xhr, status, error) {
              this.closeLoadingFragment();
              console.log("Error Occured" +  xhr.responseJSON.error.message.value);
            },
            success: function (json) {
              res[i].ItemName = json.value[0].ItemName;
              res[i].InventoryUoMEntry = json.value[0].InventoryUoMEntry;
             oITEM = json.value[0];
             
            },
            context: this
          })
          var whseITEM = oITEM.ItemWarehouseInfoCollection;
          var oITM = whseITEM.filter(function(OIT){
          return OIT.WarehouseCode == localStorage.getItem("wheseID");}) 
          res[i].InStock = oITM[0].InStock; 
         
          var sUrlUOM = sServerName + "/b1s/v1/UnitOfMeasurements?$select=Code&$filter=AbsEntry eq " +  res[i].InventoryUoMEntry;
          $.ajax({
                  url: sUrlUOM,
                  type: "GET",
                  dataType: 'json',
                  async: false,crossDomain: true,
                  xhrFields: {withCredentials: true},
                  success: function(response){
                    res[i].UoMName = response.value[0].Code;
                  }, error: function() { 
                    this.closeLoadingFragment()
                  }
              })
              this.closeLoadingFragment();
    }
    this.oModel.refresh();
  },

  onPressItem:function(){
    if (!this.caItem) {
      this.caItem = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.InventoryCount.viewcitem", this);
      this.getView().addDependent(this.caItem);
    }
    this.caItem.open();
  },

onViewItem: function(oEvent){
    var that = this;
    that.openLoadingFragment();
  
    that.onPressItem();
    
    var myInputControl = oEvent.getSource();
    var boundData = myInputControl.getBindingContext('oModel').getObject();
    listpath = myInputControl.getBindingContext('oModel').getPath();
    var indexItem = listpath.split("/");
    indS =indexItem[2];
    // console.log(boundData)
  
      sap.ui.getCore().byId("acCode").setValue(boundData.ItemCode);
      sap.ui.getCore().byId("acName").setValue(boundData.ItemName);
      sap.ui.getCore().byId("acUoM").setValue(boundData.UoMName);
      sap.ui.getCore().byId("acQty").setValue(boundData.InStock);
  
      sap.ui.getCore().byId('acCode').setEnabled(false);
      sap.ui.getCore().byId('acName').setEnabled(false);
      sap.ui.getCore().byId("acUoM").setEnabled(false);
      sap.ui.getCore().byId("acQty").setEnabled(false);
          
    that.closeLoadingFragment();
          
        },

oncloseview: function(){
          if(this.caItem){
              this.caItem.close();
          }
        },

onDeleteItem(){
          var that = this;
          var StoredItem = that.oModel.getData().SelectedItemCount;
        
          MessageBox.information("Are you sure you want to remove this Item??", {
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            title: "Remove Item",
            icon: MessageBox.Icon.QUESTION,
            styleClass:"sapUiSizeCompact",
            onClose: function (sButton) {
              if(sButton == "YES"){
                StoredItem.splice(indS,1);
                that.oModel.refresh();
              }
            }
          });
          this.oncloseview();
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
                  that.onSaveCount();
                }}
            });
            }
          
          },    
          
onSaveCount: function(){
  var CounterType = this.getView().byId("CountTypeID").getValue();
  if(CounterType == ""){
    sap.m.MessageToast.show("Please Select Counting Type")
  }else{
    if(CounterType == "Single Counting"){
    this.onSaveSingle();
  }else{
    this.onSaveMultiple();
  }
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
        },

onSaveMultiple: function(){
  var that = this;
  var oView = that.getView();
  that.getView().byId("userID").getSelectedKey()
  var sServerName = localStorage.getItem("ServerID");

  var sUrl = sServerName + "/b1s/v1/InventoryCountings";
      var CountingItem = {
        "CountDate":  oView.byId("DP8").getValue(),
        "SingleCounterType":  that.getView().byId("CounterTyp").getSelectedKey(),
        "SingleCounterID": localStorage.getItem("wheseID"),
        "CountingType": that.getView().byId("CountTypeID").getSelectedKey(),
        "TeamCounters": [],
        "IndividualCounters": [],
        "InventoryCountingLines": []
      };

      
      for(let t = 0;t < teamUserC.length;t++){
          CountingItem.TeamCounters.push({
            "CounterID": teamUserC[t].CounterID,
            "CounterType": teamUserC[t].CounterType
          });
      }

      for(let c = 0;c < teamEmpC.length;c++){
          CountingItem.TeamCounters.push({
            "CounterID": teamEmpC[c].CounterID,
            "CounterType": teamEmpC[c].CounterType
          });
      }

      for(let s = 0;s < MultipleEmpC.length;s++){
          CountingItem.IndividualCounters.push({
            "CounterID": MultipleEmpC[s].CounterID,
            "CounterType": MultipleEmpC[s].CounterType
          });
      }
      for(let x = 0;x < MultipleUserC.length;x++){
          CountingItem.IndividualCounters.push({
            "CounterID": MultipleUserC[x].CounterID,
            "CounterType": MultipleUserC[x].CounterType
          });
      }

    var tcounters = CountingItem.TeamCounters;
    var selectedItem = that.oModel.getData().SelectedItemCount;
    for(let tc =0; tc < tcounters.length;tc++){
      
      for(var i=0;i < selectedItem.length; i++){ 
          CountingItem.InventoryCountingLines.push(
            {
              "ItemCode": selectedItem[i].ItemCode,
              "WarehouseCode": localStorage.getItem("wheseID"),
              "MultipleCounterRole": "mcrTeamCounter",
              "CounterID": tcounters[tc].CounterID,
              "CounterType": tcounters[tc].CounterType
            });
      }
    }

    var scounters = CountingItem.IndividualCounters;
      for(let sc =0; sc < scounters.length;sc++){
        
        for(var i=0;i < selectedItem.length; i++){ 
            CountingItem.InventoryCountingLines.push(
              {
                "ItemCode": selectedItem[i].ItemCode,
                "WarehouseCode": localStorage.getItem("wheseID"),
                "MultipleCounterRole": "mcrIndividualCounter",
                "CounterID": scounters[sc].CounterID,
                "CounterType": scounters[sc].CounterType
              });
        }
      }
      // console.log(CountingItem);
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
      },
  
onPressNavBack: function(){
          this.router = this.getOwnerComponent().getRouter();
          this.router.navTo("inventoryCountMenu",null, true);
        },

onShowMultipleU: function(){
  if(!this.multiU) {
    this.multiU = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.InventoryCount.individualUser", this);
    this.getView().addDependent(this.multiU);
  }
  flagC = 0;
  this.ongetListuser();
  this.multiU.open();
  },

onShowMultipleE: function(){
    if(!this.multiE) {
      this.multiE = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.InventoryCount.IndividualEmp", this);
      this.getView().addDependent(this.multiE);
    }

    flagC = 0;
    this.onGetListEmp();
    this.multiE.open();
    },


onShowTeamU: function(){
      if(!this.multiU) {
        this.multiU = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.InventoryCount.individualUser", this);
        this.getView().addDependent(this.multiU);
      }
      flagC = 1;
      this.ongetListuser();
      this.multiU.open();
      },
  
onShowTeamE: function(){
        if(!this.multiE) {
          this.multiE = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.InventoryCount.IndividualEmp", this);
          this.getView().addDependent(this.multiE);
        }
    
        flagC = 1;
        this.onGetListEmp();
        this.multiE.open();
        },

  onCloseMultipleE: function(){
      if(this.multiE){
          this.multiE.close();
      }
    },

  onCloseMultipleU: function(){
    if(this.multiU){
        this.multiU.close();
    }

  },

onGetMuser: function (oEvent) {
            // reset the filter
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([]);
          
            var aContexts1 = oEvent.getParameter("selectedContexts");
            if (aContexts1 && aContexts1.length) {
             
              var getJSONITEM = aContexts1.map(function (oContext) { return oContext.getObject().InternalKey;}).join(",");
              var splitITEM = getJSONITEM.split(",");
              if(flagC == 0){
                
                  for(let u =0;u < splitITEM.length;u++){ 
                    var oUSER = MultipleUserC.filter(function(USR){
                    return USR.CounterID == splitITEM[u];}) 
                      if(oUSER.length == 0){
                        MultipleUserC.push({
                        "CounterID": splitITEM[u],
                        "CounterType": "ctUser",
                        "CounterName": ""
                      }); 
                    }
                  }
                  this.getView().byId("invIDs").setText(MultipleUserC.length);
              }else{
                  
                    for(let u =0;u < splitITEM.length;u++){ 
                      var oUSER = teamUserC.filter(function(USR){
                      return USR.CounterID == splitITEM[u];}) 
                        if(oUSER.length == 0){
                          teamUserC.push({
                          "CounterID": splitITEM[u],
                          "CounterType": "ctUser",
                          "CounterName": ""
                        }); 
                      }
                }
                this.getView().byId("teamIDs").setText(teamUserC.length);
              }
            }
          },

onGetEmp: function (oEvent) {
            // reset the filter
            var oBinding1 = oEvent.getSource().getBinding("items");
            oBinding1.filter([]);
            
            var aContexts1 = oEvent.getParameter("selectedContexts");
            if (aContexts1 && aContexts1.length) {
              var getJSONITEM1 = aContexts1.map(function (oContext1) { return oContext1.getObject().EmployeeID;}).join(",");
              var splitITEM1 = getJSONITEM1.split(",");
  
              if(flagC == 0){
              
                 
              for(let em =0;em < splitITEM1.length;em++){
                
                var oEMPM = MultipleEmpC.filter(function(EMPm){
                return EMPm.CounterID == splitITEM1[em];}) 
                  if(oEMPM.length == 0){
                  MultipleEmpC.push({
                    "CounterID": splitITEM1[em],
                    "CounterType": "ctEmployee",
                    "CounterName": ""
                  }); 
                }
              }
              this.getView().byId("invIDe").setText(MultipleEmpC.length);
            }else{
            
              for(let e =0;e < splitITEM1.length;e++){
                var oEMPtm = teamEmpC.filter(function(EMPt){
                return EMPt.CounterID == splitITEM1[e];}) 
                  if(oEMPtm.length == 0){
                    teamEmpC.push({
                    "CounterID": splitITEM1[e],
                    "CounterType": "ctEmployee",
                    "CounterName": ""
                  }); 
                }
              }
              this.getView().byId("teamIDe").setText(teamEmpC.length);
            }         
          }
          },

ontest:function(){
    console.log(MultipleUserC);
    console.log(MultipleEmpC);
    console.log(teamUserC);
    console.log(teamEmpC);
    
},
  });
});
