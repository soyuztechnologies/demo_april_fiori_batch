sap.ui.define([
    'com/ey/fin/ap/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/Fragment'
], function(BaseController, JSONModel, MessageBox, MessageToast, Fragment) {
    'use strict';
    return BaseController.extend("com.ey.fin.ap.controller.Add",{
        onInit: function(){
            //create a local json model which will hold the payload
            //of the data which we need to send to backend sap system
            this.oLocalModel = new JSONModel();
            this.oLocalModel.setData({
                prodData: {
                    "PRODUCT_ID" : "",
                    "TYPE_CODE" : "PR",
                    "CATEGORY" : "Notebooks",
                    "NAME" : "",
                    "DESCRIPTION" : "",
                    "SUPPLIER_ID" : "0100000071",
                    "SUPPLIER_NAME" : "Tessile Casa Di Roma",
                    "TAX_TARIF_CODE" : "1 ",
                    "MEASURE_UNIT" : "EA",
                    "PRICE" : "0.00",
                    "CURRENCY_CODE" : "USD",
                    "DIM_UNIT" : "CM"
                }
            });
            this.getView().setModel(this.oLocalModel, "prod");

        },
        mode: "Create",
        setMode: function(sMode){
            this.mode = sMode;
            if(this.mode === "Create"){
                this.getView().byId("idSave").setText("Save");
                this.getView().byId("prodId").setEnabled(true);
                this.getView().byId("idDelete").setEnabled(false);

            }else{
                this.getView().byId("idSave").setText("Update");
                this.getView().byId("prodId").setEnabled(false);
                this.getView().byId("idDelete").setEnabled(true);
            }

        },
        onDelete: function(){
            //Step 1: Build the path for deletion
            var sPath = "/ProductSet('" + this.productId + "')";
            //Step 2: get the oData model object
            var oDataModel = this.getView().getModel();
            //Step 3: use the object to fire delete
            var that = this;
            oDataModel.remove(sPath,{
                success: function(){
                    //Step 4: callbacks
                    MessageToast.show("The product has been deleted");
                    that.onClear();
                }
            });           

        },
        onExpLoad: function(){
            //Step 1: get the odata model object
            var oDataModel = this.getView().getModel();
            //Step 2: read the category value
            var sCategory = this.oLocalModel.getProperty("/prodData/CATEGORY");
            //Step 3: call function - get most exp prod
            var that = this;
            oDataModel.callFunction("/GetMostExpensiveProduct",{
                urlParameters: {
                    I_CATEGORY: sCategory
                },
                success: function(data){
                    //Step 4: set data to the UI
                    that.setMode("Update");
                    that.oLocalModel.setProperty("/prodData", data);
                },
                error: function(oError){
                    MessageBox.error("An internal error occurred");
                }
            });
            
        },
        oSupplierPopup: null,
        onF4Help: function(oEvent){
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
                        path: '/SupplierSet',
                        template: new sap.m.DisplayListItem({
                            label: '{COMPANY_NAME}',
                            value: '{BP_ID}'
                        })
                    });
                    that.oSupplierPopup.setMultiSelect(false);
                    that.oSupplierPopup.open();
                });
            }else{
                this.oSupplierPopup.open();
            }
        },
        onDialogConfirm: function(oEvent){
            //Getting the ID of the popup so we can differentiate
            //Which fragment led this event to trigger
            var sId = oEvent.getSource().getId();
            //Step 1: Explore SDK and get the parameter to find the selected item
            var oSelectedItem = oEvent.getParameter("selectedItem");
            //Step 2: From this display list item, we will get the label
            var sSupplierName = oSelectedItem.getValue();
            //Step 3: Set this to the input field inside table on which F4 was pressed
            //        We already taken the snapshot
            this.oLocalModel.setProperty("/prodData/SUPPLIER_ID", sSupplierName);
            this.getView().byId("idSuppName").setText(oSelectedItem.getLabel());
            
        },
        onClear: function(){
            this.setMode("Create");
            this.oLocalModel.setProperty("/prodData",
                {
                    "PRODUCT_ID" : "",
                    "TYPE_CODE" : "PR",
                    "CATEGORY" : "Notebooks",
                    "NAME" : "",
                    "DESCRIPTION" : "",
                    "SUPPLIER_ID" : "0100000071",
                    "SUPPLIER_NAME" : "Tessile Casa Di Roma",
                    "TAX_TARIF_CODE" : "1 ",
                    "MEASURE_UNIT" : "EA",
                    "PRICE" : "0.00",
                    "CURRENCY_CODE" : "USD",
                    "DIM_UNIT" : "CM"
                }
            );
        },
        productId: null,
        onEnter: function(oEvent){
            //Step 1: Get the value what user enter in the field
            var sVal = oEvent.getParameter("value");
            this.productId = sVal;
            //Step 2: Construct the path for making call
            var sPath = "/ProductSet('" + sVal + "')";
            //Step 3: get the odata model object
            var oDataModel = this.getView().getModel();
            //Step 4: Perform the get call by key
            //Why ?? --> Allow the callback function to access controller instance
            var that = this;

            oDataModel.read(sPath,{
                success: function(data){
                    //Step 5: handle the response - success
                    //Set data to local model, since local model is 2 way binding to ui
                    //the data will show to user
                    that.oLocalModel.setProperty("/prodData", data);
                    that.setMode("Update");
                },
                error: function(oError){
                    //Step 5: handle the response - error
                    MessageToast.show("Product not found, please create one!");
                    that.setMode("Create");
                }
            });

        },
        onSave: function(){
            //Step 1: Prepare our payload which is in the local model
            var payload = this.getView().getModel("prod").getProperty("/prodData");
            //Step 2: Validations before we call SAP S/4HANA
            if(payload.PRODUCT_ID === ""){
                MessageBox.error("Please enter a valid product id (e.g. HT-1000)");
                return;
            }
            //Step 3: Get the OData model object - defatul model
            var oDataModel = this.getView().getModel();
            //Step 4: Trigger the POST Request
            //Now check the mode
            if(this.mode === "Update"){
                oDataModel.update("/ProductSet('" + payload.PRODUCT_ID + "')", payload, {
                    //Step 5: success - in case the odata request was successful
                    success: function(data){
                        MessageToast.show("Your product has been Updated successfully");
                    },
                    //Step 6: error - in case the odata request was failed
                    error: function(oErr){
                        debugger;
                        MessageBox.error("An error occurred - " + JSON.parse(oErr.responseText).error.innererror.errordetails[0].message);
                    }
                });
            }else{
                oDataModel.create("/ProductSet", payload, {
                    //Step 5: success - in case the odata request was successful
                    success: function(data){
                        MessageToast.show("Your product has been created successfully");
                    },
                    //Step 6: error - in case the odata request was failed
                    error: function(oErr){
                        debugger;
                        MessageBox.error("An error occurred - " + JSON.parse(oErr.responseText).error.innererror.errordetails[0].message);
                    }
                });
            }
            
            

        }
    });
});