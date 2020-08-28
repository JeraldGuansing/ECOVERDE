sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController",
  "jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(Controller,jQuery,Device, Fragment, JSONModel, Popover, Button, mobileLibrary, MessageToast,MessageBox) {
  "use strict";
  return Controller.extend("com.ecoverde.ECOVERDE.controller.main", {

    onInit: function(){

      this.oMdlMenu = new JSONModel("model/menus.json");
      this.getView().setModel(this.oMdlMenu);
      
	  this.router = this.getOwnerComponent().getRouter();
	  this.router.navTo("homeScreen");
     

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
				this.router.navTo("Project");
				this.onMenuButtonPress();
				break;
			case "Transfer":
				this.router.navTo("Unit");
				this.onMenuButtonPress();
				break;
			case "Count":
				this.router.navTo("Reservation");
				this.onMenuButtonPress();
				break;
			case "History":
				this.router.navTo("Reservation");
				this.onMenuButtonPress();
        		break;
      		case "Logoff":
				this.onLogout();
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

		onLogout: function(){
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
				  console.log("Error Occured");
				},
				success: function (json) {
				  sap.m.MessageToast.show("Thank you!");
				  this.router = this.getOwnerComponent().getRouter();
				  this.router.navTo("login");
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
						that.onWithoutRef();
						that.onMenuButtonPress();
					}
				}
				
			});
		},

		onWithRef: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("purchaseOrderList");
		  },

		  onWithoutRef: function(){
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("BarcodeScanning");
		  },

  });
});
