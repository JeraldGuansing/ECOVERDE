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

  return Controller.extend("com.ecoverde.ECOVERDE.controller.viewCount", {
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
      this.onGetCountSheet();
    },

    onPressNavBack: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("inventoryCountMenu",null, true);
    },

    onGetCountSheet: function(){
		
      var that = this;
      that.openLoadingFragment();   
      that.oModel = new JSONModel("model/item.json");
      that.getView().setModel(this.oModel, "oModel");
      
        var sServerName = localStorage.getItem("ServerID");
        var sUrl = sServerName + "/b1s/v1/InventoryCountings()?$filter=DocumentStatus eq 'cdsOpen'";
        $.ajax({
        url: sUrl,
        type: "GET",
        dataType: 'json',
        crossDomain: true,
        xhrFields: {
          withCredentials: true},
        success: function(response){
         var res = response.value;
          var consoCount = [];
         
          for(var i = 0;i < res.length; i++){
          
            if(res[i].CountingType == "ctSingleCounter"){
              consoCount.push({
                "DocumentEntry": res[i].DocumentEntry,
                "DocumentNumber": res[i].DocumentNumber,
                "CountDate": res[i].CountDate,
                "CountingType": res[i].CountingType,
                "Counters": res[i].SingleCounterID});
            }else{
                for(var x = 0;x < res[i].IndividualCounters.length;x++){
                  consoCount.push({
                  "DocumentEntry": res[i].DocumentEntry,
                  "DocumentNumber": res[i].DocumentNumber,
                  "CountDate": res[i].CountDate,
                  "CountingType": res[i].CountingType,
                  "Counters": res[i].IndividualCounters[x].CounterName
                  });
            }
            
            for(var a = 0;x < res[i].TeamCounters.length;x++){
              consoCount.push({
                "DocumentEntry": res[i].DocumentEntry,
                "DocumentNumber": res[i].DocumentNumber,
                "CountDate": res[i].CountDate,
                "CountingType": res[i].CountingType,
                "Counters": res[i].TeamCounters[a].CounterName
              })
            }
           }
          }
           
          const CountT = consoCount.filter(function(WTW){
          return WTW.Counters == localStorage.getItem("userName") || WTW.Counters == localStorage.getItem("UserKeyID");
          })

         
          that.oModel.getData().CountSheet = CountT;
            
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

onUpdateEdit: function(oEvent){
          var that = this;
          
          var myInputControl = oEvent.getSource(); // e.g. the first item
          var boundData = myInputControl.getBindingContext('oModel').getObject();
          localStorage.setItem("DocEntry", boundData.DocumentEntry)
          that.onPressList();

          },

onPressList: function(){
            this.router = this.getOwnerComponent().getRouter();
            this.router.navTo("updateCount",null, true);
          },
  
  });
});
