sap.ui.define([
  "com/ecoverde/ECOVERDE/controller/BaseController"
], function(Controller) {
  "use strict";

  return Controller.extend("com.ecoverde.ECOVERDE.controller.goodsIssue", {
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
              
            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                //that.initialize(evt.data);
            }
        });
	},
  });
});
