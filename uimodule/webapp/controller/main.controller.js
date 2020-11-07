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
  var i;
  return Controller.extend("com.ecoverde.ECOVERDE.controller.main", {

    onInit: function(){
		var that = this;
	    var oView = that.getView();
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
		localStorage.getItem("notification", "");
		this.oMdlMenu = new JSONModel("model/menus.json");
		this.getView().setModel(this.oMdlMenu);
		
		
		this.router = this.getOwnerComponent().getRouter();
		this.router.navTo("homeScreen");
		
		this.getView().byId("userID").setText("User:   " + localStorage.getItem("userName"));
		this.getView().byId("whsID").setText("Warehouse Code:   " + localStorage.getItem("wheseID"));
		this.getView().byId("whsName").setText(localStorage.getItem("wheseNm"));

		// this.notifNumber();
		this.modelServices();
	},

	notifNumber: function(){	
	 this.byId("shellid").setNotificationsNumber(localStorage.getItem("notification"));
	},

	onGetAlert: function(){
		var that = this;
		
		var UserCode = localStorage.getItem("UserKeyID");
		var sServerName = localStorage.getItem("ServerID");
		var xsjsServer = sServerName.replace("50000", "4300");
		var sUrl = xsjsServer + "/app_xsjs/getMsg_proc.xsjs?bpType=" + UserCode;
		
		$.ajax({
		  url: sUrl,
			  type: "GET",
			  beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd810~"));
			  },
			  crossDomain: true,
			  xhrFields: {
			  withCredentials: true
			  },
			  error: function (xhr, status, error) {
				that.closeLoadingFragment();
				console.log("Error Occured");
			  },
			  success: function (response) {
				i = parseInt(Object.keys(response.GETLISTALERT).length);
				if(i != 0){
					localStorage.setItem("notification",i);
				}else{
					localStorage.setItem("notification","");		
				}
			  }
			})
	   },

	modelServices: function() {
		var self = this;
		this.intervalHandle = setInterval(function() { 
			self.onGetAlert();
			self.notifNumber();
		 }, 3000);
  },
  

    onItemSelect: function (oEvent) {
			try {
				
			} catch (error) {
				
			}
			var sSelectedMenu = oEvent.getSource().getProperty("selectedKey");
			switch (sSelectedMenu) {
			case "warehouseReport":
				this.router.navTo("warehouseReport");
				this.onMenuButtonPress();
				break;
			case "goodsReceipt":
				this.onChooseProc();
				break;
			case "goodsIssue":
				this.router.navTo("goodsIssueMenu");
				this.onMenuButtonPress();
				break;
			case "Transfer":
				this.router.navTo("transferView");
				this.onMenuButtonPress();
				break;
			case "Count":
				this.router.navTo("inventoryCountMenu");
				this.onMenuButtonPress();
				break;
			case "History":
				this.router.navTo("Reservation");
				this.onMenuButtonPress();
        		break;
			case "bank":
				this.router.navTo("Bank");
				break;
			default:
			
			}
		},


	onSelect: function (event) {
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo(event.getParameter("key"));
		},

		//-------------------------------------------

	onMenuButtonPress: function () {
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
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

	onLogout: function(){
		this.openLoadingFragment();
			var sServerName = localStorage.getItem("ServerID");
			var sUrl = sServerName + "/b1s/v1/Logout";

			$.ajax({
				url: sUrl,
				type: "POST",
				headers: {
				  'Content-Type': 'application/json'},
				crossDomain: true,
				xhrFields: {
				  withCredentials: true
				},
				error: function (xhr, status, error) {
				//sap.m.MessageToast.show(xhr.responseJSON.error.message.value);
				console.log("Error Occured");
				this.closeLoadingFragment();
				},
				success: function (json) {
				this.closeLoadingFragment();
				  sap.m.MessageToast.show("Thank you!");
				  this.router = this.getOwnerComponent().getRouter();
				  this.router.navTo("login");
				  this.onMenuButtonPress();
				},
				context: this
			  });

		},


	onChooseProc: function () {
			var that = this;
			MessageBox.information("With Purchase Order Reference?", {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				title: "Goods Receiving Option",
				icon: MessageBox.Icon.QUESTION,
				styleClass:"sapUiSizeCompact",
				onClose: function (sButton) {
					if(sButton === "YES"){
						that.onWithRef();
						that.onMenuButtonPress();
					}else if (sButton === "NO"){
						// that.onSelectVendorShow();
						that.onWithoutRef();
						that.onMenuButtonPress();
					}
				}
				
			});
		},
		
	onGetListVendor: function(){
		
			var that = this;
			that.oModel = new JSONModel("model/item.json");
			that.getView().setModel(this.oModel, "oModel");
			that.openLoadingFragment();   
			  var sServerName = localStorage.getItem("ServerID");
			  var sUrl = sServerName + "/b1s/v1/BusinessPartners?$select=CardCode,CardName&$filter=CardType eq 'cSupplier'";
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
				  that.closeLoadingFragment()
				}, error: function() { 
				  that.closeLoadingFragment()
				  console.log("Error Occur");
				}
			})
		  }, 
		
	onSaveVendor:function(){
			var VendName = sap.ui.getCore().byId("VendorIDs").getValue();
			
			if(VendName == ""){
			  sap.m.MessageToast.show("Please select Vendor");
			  this.closeLoadingFragment();
			  return;
			}else{
			localStorage.setItem("VendorName",sap.ui.getCore().byId("VendorIDs").getValue());
			localStorage.setItem("VendorCode",sap.ui.getCore().byId("VendorIDs").getSelectedKey());
			
			this.onWithoutRef();
			}
		
		  },

	onSelectVendorShow: function(){
			if (!this.Vendorlist) {
			  this.Vendorlist = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.vendor", this);
			  this.getView().addDependent(this.Vendorlist);
			}
			sap.ui.getCore().byId("VendorIDs").setValue("");
			sap.ui.getCore().byId("VendorIDs").setSelectedKey("");
		   	
			this.onGetListVendor();
			this.Vendorlist.open();
		  },
		
	onCloseVendor: function(){
		  if(this.Vendorlist){
		  this.Vendorlist.close();
			}
		this.oMdlMenu = new JSONModel("model/menus.json");
		this.getView().setModel(this.oMdlMenu);
		
		  },

	onWithRef: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("purchaseOrderList");
		  },

	onWithoutRef: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("BarcodeScanning");
		  },

	onAlert: function(){
		this.router = this.getOwnerComponent().getRouter();
		this.router.navTo("appAlert");
		// this.onMenuButtonPress();
		  },

  });
});
