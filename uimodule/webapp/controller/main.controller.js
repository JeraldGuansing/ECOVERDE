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
				oView.getController().ongetUdetails();
			},
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
				oView.getController().ongetUdetails();
			},
            onBeforeFirstShow: function(evt) {
                //This event is fired before the NavContainer shows this child control for the first time.
            },
            onBeforeHide: function(evt) {
				oView.getController().ongetUdetails();
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
		
		this.getView().byId("userID").setText("User:   " + localStorage.getItem("userName"));
		this.getView().byId("whsID").setText("Warehouse Code:   " + localStorage.getItem("wheseID"));
		this.getView().byId("whsName").setText(localStorage.getItem("wheseNm"));

		this.router = this.getOwnerComponent().getRouter();
		this.router.navTo("homeScreen");
		// this.notifNumber();
		this.modelServices();
	},

	ongetUdetails: function(){
        this.getView().byId("userID").setText("User:   " + localStorage.getItem("userName"));
        this.getView().byId("whsID").setText("Warehouse Code:   " + localStorage.getItem("wheseID"));
        this.getView().byId("whsName").setText(localStorage.getItem("wheseNm"));
      },

	notifNumber: function(){	
	 this.byId("shellid").setNotificationsNumber(localStorage.getItem("notification"));
	},

	onGetAlert: function(){
		var that = this;
		
		var UserCode = localStorage.getItem("UserKeyID");
		var sServerName = localStorage.getItem("ServerID");
		var xsjsServer = sServerName.replace("50000", "4300");
		var sUrl = xsjsServer + "/app_xsjs/getAlert.xsjs?uid=" + UserCode + "&wsr=N&objT=112";
		
		$.ajax({
		  url: sUrl,
			  type: "GET",
			  beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa("SYSTEM:"+localStorage.getItem("XSPass")));
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
				i = parseInt(Object.keys(response).length);
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
		 }, 2000);
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
						that.onSelectVendorShow();
						that.onMenuButtonPress();
					}else if (sButton === "NO"){
						that.onWithoutRef();
						that.onMenuButtonPress();
					}
				}
				
			});
		},


	onSelectVendorShow: function(){
			this.openLoadingFragment();
			  if (!this.PretVendorList) {
				this.PretVendorList = sap.ui.xmlfragment("com.ecoverde.ECOVERDE.view.fragment.PurchVendor", this);
				this.getView().addDependent(this.PretVendorList);
			  }
			
			  sap.ui.getCore().byId("PretVendorIDs").setValue("");
			  sap.ui.getCore().byId("PretVendorIDs").setSelectedKey("");
				 
			  this.onGetListVendor();
			  this.PretVendorList.open();
			  this.closeLoadingFragment();
			  },
		
	
	onGetListVendor: function(){
		this.oModel = new JSONModel("model/item.json");
		this.oModel.setSizeLimit(1000);
		this.getView().setModel(this.oModel, "oModel");

		var that = this;  
		var sServerName = localStorage.getItem("ServerID");
		var xsjsServer = sServerName.replace("50000", "4300");
		var sUrl = xsjsServer + "/app_xsjs/VendorList.xsjs";
		  
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
			  var OCARD = [];
			  var OCRD =  response;
			  var count = Object.keys(OCRD).length;
			 
			  for(let o = 0; o < count;o++){
				OCARD.push({
				  CardCode: OCRD[o].CardCode,
				  CardName: OCRD[o].CardName
				});
			  }
			  that.oModel.getData().VendorList = OCARD;
			  that.oModel.refresh();
			
			  that.oMdlMenu = new JSONModel("model/menus.json");
			  that.getView().setModel(this.oMdlMenu);

			}, error: function() { 
			  that.closeLoadingFragment()
			  console.log("Error Occur");
			}
		})
		}, 
	
	onCloseVendor: function(){
		if(this.PretVendorList){
		this.PretVendorList.close();}
		
		this.oMdlMenu = new JSONModel("model/menus.json");
		this.getView().setModel(this.oMdlMenu);

		},	  
		  
	onSaveVendor:function(){
		var VendName = sap.ui.getCore().byId("PretVendorIDs").getValue();
				
		if(VendName == ""){
		sap.m.MessageToast.show("Please select Vendor");
		this.closeLoadingFragment();
		return;
		}else{
		localStorage.setItem("VendorName",sap.ui.getCore().byId("PretVendorIDs").getValue());
		localStorage.setItem("VendorCode",sap.ui.getCore().byId("PretVendorIDs").getSelectedKey());
		this.onWithRef();
			}
		},
		

	onWithRef: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("purchaseOrderList");
		  },

	onWithoutRef: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("BarcodeScanning");
		  },
	onConfig: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("mainSettings");
			this.onMenuButtonPress();
		  },

	onAlert: function(){
		this.router = this.getOwnerComponent().getRouter();
		this.router.navTo("appAlert");
		// this.onMenuButtonPress();
		  },

  });
});
