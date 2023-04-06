sap.ui.define([
    'com/ey/fin/ap/controller/BaseController',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function(BaseController, MessageBox, MessageToast, Fragment, Filter, FilterOperator) {
    'use strict';
    return BaseController.extend("com.ey.fin.ap.controller.View2",{
        onInit: function(){
            this.oRouter = this.getOwnerComponent().getRouter();
            this.oRouter.getRoute("detail").attachMatched(this.herculise, this);
        },
        //Route Matched Handler concept
        herculise: function(oEvent){
            //Extract the variable which we pass to the Route (hash tag)
            var sIndex = oEvent.getParameter("arguments").fruitId;
            //Resconstruct the path for element binding
            var sPath = "/" + sIndex;
            //Perform element binding with view2 for view2
            this.getView().bindElement(sPath,{
                    expand: "To_Supplier"
            });

            
        },
        oSupplierPopup: null,
        oCitiPopup: null,
        oField: null,
        onDialogConfirm: function(oEvent){
            //Getting the ID of the popup so we can differentiate
            //Which fragment led this event to trigger
            var sId = oEvent.getSource().getId();
            if(sId.indexOf("cities") !== -1){
                //Step 1: Explore SDK and get the parameter to find the selected item
                var oSelectedItem = oEvent.getParameter("selectedItem");
                //Step 2: From this display list item, we will get the label
                var sCityName = oSelectedItem.getLabel();
                //Step 3: Set this to the input field inside table on which F4 was pressed
                //        We already taken the snapshot
                this.oField.setValue(sCityName);
            }else{
                debugger;
                //Step 1: get all the selected values
                var aFilter = [];
                var aSelectedItems = oEvent.getParameter("selectedItems");
                //Step 2: Create an array with all the filters
                for (let i = 0; i < aSelectedItems.length; i++) {
                    const element = aSelectedItems[i];
                    var oFilter = new Filter("name", FilterOperator.EQ, element.getLabel());
                    aFilter.push(oFilter);
                }
                //Step 3: Inject the filter to the table by gettings its object
                this.getView().byId("supplierTab").getBinding("items").filter(aFilter);
            }

            
        },
        onF4Request: function(oEvent){
            //Taking a snap shop of the field on Which F4 was pressed 
            //inside the table
            this.oField = oEvent.getSource();
            // in JS, the callbacks and promise functions will by default not 
            // have access to the 'this'(global variable for controller) pointer
            // we need to create a COPY of this global variable, because a callback/promise
            // can access a local variable of the caller function
            var that = this;
            //IF lo_alv IS NOT BOUND.
            if(!this.oCitiPopup){
                Fragment.load({
                    id: 'cities',
                    name: 'com.ey.fin.ap.fragments.popup',
                    controller: this
                }).then(function(oDialogBox){
                    that.oCitiPopup = oDialogBox;
                    //Since fragment is a parasite, by default it cannot access the data model
                    //of our app, until someone allow a explicit access of model to this
                    //parasite (external module). The view can allow access of model to the
                    //fragment, which is done using addDependent function
                    that.getView().addDependent(that.oCitiPopup);
                    that.oCitiPopup.setTitle("Cities");
                    that.oCitiPopup.setMultiSelect(false);
                    that.oCitiPopup.bindAggregation("items",{
                        path: '/cities',
                        template: new sap.m.DisplayListItem({
                            label: '{name}',
                            value: '{famousFor}'
                        })
                    });
                    that.oCitiPopup.open();
                });
            }else{
                this.oCitiPopup.open();
            }           

            //PBO - ALV
            //IF lo_alv IS NOT BOUND.
            //  CREATE OBJECT lo_alv.
            //MessageBox.confirm("This functionality is under construction 😉");
        },
        onFilter: function(oEvent){
            var that = this;
            if(!this.oSupplierPopup){
                Fragment.load({
                    id: 'supplier',
                    name: 'com.ey.fin.ap.fragments.popup',
                    controller: this
                }).then(function(oDialogBox){
                    that.oSupplierPopup = oDialogBox;
                    that.oSupplierPopup.setTitle("Suppliers");
                    //Since fragment is a parasite, by default it cannot access the data model
                    //of our app, until someone allow a explicit access of model to this
                    //parasite (external module). The view can allow access of model to the
                    //fragment, which is done using addDependent function
                    that.getView().addDependent(that.oSupplierPopup);
                    that.oSupplierPopup.bindAggregation("items",{
                        path: '/suppliers',
                        template: new sap.m.DisplayListItem({
                            label: '{name}',
                            value: '{country}'
                        })
                    });
                    that.oSupplierPopup.open();
                });
            }else{
                this.oSupplierPopup.open();
            }
            

            //MessageBox.confirm("This functionality is under construction 😉");
        },
        onSave: function(){
            MessageBox.confirm("Would you like to Save?",{
                title: "Anubhav Confirm",
                //By Default SAP UI5 will not pass this pointer as controller object
                //To the evenet handler function, we need to explicitly pass it
                onClose: this.onCloseMessage.bind(this)
            });
        },
        onCloseMessage: function(state){
            var oView = this.getView();
            if(state === "OK"){
                MessageToast.show("Contra8s! Your order has been created 😊");
            }else{
                MessageBox.error("Oops!! you can cancelled it 😒");
            }
        },
        onBack: function(){
            //Step 1: get the mother object
            var oAppCon = this.getView().getParent();
            //Step 2: Navigate to second child using 'to' function
            //Check documentation - https://ui5.sap.com/1.71.49/#/api/sap.m.NavContainer/methods/to
            oAppCon.to("idView1");
        }
    });
});