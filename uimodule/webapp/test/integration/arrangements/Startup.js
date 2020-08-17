sap.ui.define([
  "sap/ui/test/Opa5"
], function(Opa5) {
  "use strict";

  return Opa5.extend("com.ecoverde.ECOVERDE.test.integration.arrangements.Startup", {

    iStartMyApp: function () {
      this.iStartMyUIComponent({
        componentConfig: {
          name: "com.ecoverde.ECOVERDE",
          async: true,
          manifest: true
        }
      });
    }

  });
});
