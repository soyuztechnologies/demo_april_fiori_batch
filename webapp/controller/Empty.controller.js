sap.ui.define([
    'com/ey/fin/ap/controller/BaseController'
], function(BaseController) {
    'use strict';
    return BaseController.extend("com.ey.fin.ap.controller.Empty",{
        onBack: function(){
            //Step 1: get the mother object
            var oAppCon = this.getView().getParent();
            //Step 2: Navigate to second child using 'to' function
            //Check documentation - https://ui5.sap.com/1.71.49/#/api/sap.m.NavContainer/methods/to
            oAppCon.to("idView1");
        }
    });
});