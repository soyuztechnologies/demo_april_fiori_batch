sap.ui.define([
    'com/ey/fin/ap/controller/BaseController',
    'com/ey/fin/ap/util/formatter',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, Formatter, Filter, FilterOperator) {
    'use strict';
    return BaseController.extend("com.ey.fin.ap.controller.View1",{
        formatter: Formatter,
        onInit: function(){
            this.oRouter = this.getOwnerComponent().getRouter();
            // var oFilter1 = new Filter("CATEGORY", FilterOperator.Contains, sText);
            // //Step 3: Get the list control object
            // var oList = this.getView().byId("idFruits");
            // //Step 4: Inject the filter to filter items
            // oList.getBinding("items").filter(oFilter1);
        },
        onNext: function(sIndex){
            //Step 1: get the mother object
            ///var oAppCon = this.getView().getParent().getParent();
            //Step 2: Navigate to second child using 'to' function
            //Check documentation - https://ui5.sap.com/1.71.49/#/api/sap.m.NavContainer/methods/to
            ///oAppCon.toDetail("idView2");

            //this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.navTo("detail",{
                fruitId: sIndex
            });
        },
        onAdd: function(){
            this.oRouter.navTo("addProduct");
        },
        onItemSelect: function(oEvent){
            //Step 1: get the object of the selected item
            var oSelectedItem = oEvent.getParameter("listItem");
            //Step 2: Get the path of the element which was selected
            var sPath = oSelectedItem.getBindingContextPath();
            //  --- /fruits/12 ==> ["fruits","12"]
            var sIndex = sPath.split("/")[sPath.split("/").length - 1];
            // //Step 3: Get the object of the view2
            // var oAppCon = this.getView().getParent().getParent();
            // var oView2 = oAppCon.getDetailPages()[1];
            // //Step 4: Bind the whole of second view with element
            // oView2.bindElement(sPath);

            this.onNext(sIndex);
        },
        onDeleteMultiple: function(){
            //Step 1: get the list object
            var oList = this.getView().byId("idFruits");
            //Step 2: get all selected items - multiple
            var aItems = oList.getSelectedItems();
            //Step 3: loop over every item and delete one by one
            for (let i = 0; i < aItems.length; i++) {
                const element = aItems[i];
                oList.removeItem(element);
            }
        },
        onSearch: function(oEvent){
            //Step 1: What did user type to search
            var sText = oEvent.getParameter("query");
            //Step 2: Construct a filter object to search data
            var oFilter1 = new Filter("CATEGORY", FilterOperator.Contains, sText);
            // var oFilter2 = new Filter("type", FilterOperator.Contains, sText);
            // //Step - create an array
            // var aFilter = [oFilter1, oFilter2];
            // //Step - Construct a newfilter with OR
            // var oFilter = new Filter({
            //     filters: aFilter,
            //     and: false
            // });
            //Step 3: Get the list control object
            var oList = this.getView().byId("idFruits");
            //Step 4: Inject the filter to filter items
            oList.getBinding("items").filter(oFilter1);


            // debugger;
            // //Step 1: get the value of the search field 
            // //Documentation - https://ui5.sap.com/1.71.49/#/api/sap.m.SearchField/events/search
            // var sValue = oEvent.getParameter("query");
            // //Step 2: Set this value dynamically as title for the view 2
            // var oView2 = this.getView().getParent().getPages()[1];
            // //Step 3: Change the title of the second page dynamically
            // oView2.getContent()[0].setTitle(sValue);
            // //Step 4: Call navigation action directly here
            // this.onNext();
        },
        onDelete: function(oEvent){
            //Step 1: We need to know the object of the item on which delete was pressed
            var oListItem = oEvent.getParameter("listItem");
            //Step 2: Get the object of the list control
            //this.getView().byId("idFruits") - avoid ID based coding IF POSSIBLE
            var oList = oEvent.getSource();
            //Step 3: call the delete item for list and pass the object which needs to be deleted
            oList.removeItem(oListItem);
        },
        onOrder: function(){
            this.onNext();
        }
    });
});