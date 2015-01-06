AutoForm.hooks({
    insertActionForm: {
        before: {
            insert: function(doc, template) {

                // Get the Action type
                doc.action_type = Session.get('newActionType');

                // If type is user_template, then save the EstateId
                if (Session.get('newActionType') == "user_template") {
                    doc.estate_id = Session.get('current_estate_doc')._id ;
                }

                return doc;
            }
            // update: function(docId, modifier, template) {},
            // "methodName": function(doc, template) {}

        },
        onSuccess: function(operation, result, template) {
            if (Session.get('childActionToEdit')) {
                // Session.set('childActionToEdit', null); // Always set "nul when template destroyed
                Router.go('applyActions');
            }
            else {
                // Session.set('newActionType', null); // Always set "nul when template destroyed
                Router.go('actionsList');
            }


        },
    }
});

Template.actionForm.destroyed = function () {
    Session.set('newActionType', null);
    Session.set('childActionToEdit', null);
    Session.set('updateAction', null);
    Session.set('masterAction', null);
};

Template.actionForm.helpers({
    getAction: function(){
        if( Session.get('newActionType') == "generic") {
            console.log("Creating a new Generic action");
            return null;
        }
        if( Session.get('masterAction') ) {
            console.log("Creating a UserTemplate action from a Generic action");
            return Session.get('masterAction');
        }
        if( Session.get('childActionToEdit') ) { // Child action update
            console.log('Editing a child action');
            return Session.get('childActionToEdit');
        }
        if ( Session.get('updateAction') ){ // Generic update case
            console.log("Editing a Generic or UserTemplate action");
            return Session.get('updateAction');
        }
    },
    getType: function(){
        if( Session.get('childActionToEdit') || Session.get('updateAction') ) {
            console.log("Type is: update");
            return "update";
        } else {
            console.log("Type is: insert");
            return "insert";
        }
    }
});

Template.actionForm.rendered = function () {
    // NOT NEEDED?
    // If updating a child Action, then prevent from changing the name
    // if ( Session.get('childActionToEdit') ) {
    //     $('[name="name"]').prop("readonly","readonly") ;
    // }

    // Only apply formulas if we're editing a child action
    if ( Session.get('childActionToEdit') ) {
        /* -------------- */
        /* EndUse formula */
        /* -------------- */
        allLeases = Leases.find(
                {building_id:Session.get('current_building_doc')._id},
                {sort: {lease_name:1}}
            ).fetch();
        firstLease = allLeases[1]; // ToDo : boucler sur tous les Leases
        var allEndUseData = [];
        var matchingEndUseInLease = [];
        var confFluidToUse =[] ;
        var confFluids = Session.get('current_config').fluids ;

        this.autorun(function () {
            // Have this loop monitor all opportunity Selectors
            // Being in an autoRun, it's reactive
            $("[name^='impact_assessment_fluids.'][name$='.opportunity']").each(function( index ) {

                var matchingEndUse = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".opportunity") ; // Use a reactive var

                if (matchingEndUse !== "") {
                    // Go through all Leases until we find the corresponding endUse in the Lease
                    // Note: could be better with a "break" when the EndUse is found
                    _.each(allLeases, function(lease, leaseIndex) {
                        _.each(lease.consumption_by_end_use, function(endUse) {
                            if(endUse.end_use_name == matchingEndUse){
                                endUse.lease_name = lease.lease_name ;
                                endUse.consumption_by_end_use_total = lease.consumption_by_end_use_total;

                                // For each EndUse found, we search for the corresponding Fluid in the conf
                                _.each(confFluids, function(fluid) {
                                    completeFluideName = fluid.fluid_provider + " - " + fluid.fluid_type ;
                                    if (completeFluideName == endUse.fluid_id) {
                                        endUse.fluid = fluid ; // We store the Fluid in the array
                                    }
                                });

                                matchingEndUseInLease[leaseIndex] = endUse;
                            }
                        });
                    });
                    console.log("matchingEndUseInLease: ");
                    console.log(matchingEndUseInLease);

                    allEndUseData[index] = matchingEndUseInLease;
                    console.log("allEndUseData: ");
                    console.log(allEndUseData);

                    /// HERE
                    var matchingPerCent = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".per_cent") ;
                    var matchingKWhEF = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".or_kwhef") ;

                    // Investment ratio and cost
                    // $("[name='investment.ratio'], [name='investment.cost']").change(function() {
                    //     var curr_field = $(this).val()*1;
                    //     var target, estimate;
                    //     var source = Session.get('current_building_doc').building_info.area_total ;

                    //     if( $(this).attr("name") == "investment.ratio") {
                    //         estimate = (curr_field * source).toFixed(2) ; //We're dealing with % and € so it's OK to only keep 2 decimals
                    //         target = $('[name="investment.cost"]');
                    //     } else {
                    //         estimate = (curr_field / source).toFixed(2) ;
                    //         target = $('[name="investment.ratio"]');
                    //     }

                    //     if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
                    //             target.val(estimate).change() ;
                    //     }
                    // });
                } else { console.log("ha, empty"); }
            });
        });

        // var matchingPerCent = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".per_cent") ;

        // // If first 2 fields are entered, then set the kWef and yearly_budget
        // if (matchingEndUse && matchingPerCent){
        //     var in_kwhef = matchingEndUseInLease.first_year_value * matchingPerCent/100 ;
        //     $("[name='impact_assessment_fluids." + index + ".or_kwhef']").val( in_kwhef ).change();

        //     $("[name='impact_assessment_fluids." + index + ".yearly_budget']").val(
        //         // Create loop for all YEARS here ??
        //         in_kwhef * confFluidToUse.yearly_values[0].cost
        //     ).change();
        // }

        // this.autorun(function () {
        //     // Have this loop monitor all opportunity Selectors (target: '.or_kwhef')
        //     // Being in an autoRun, it's reactive
        //     $("[name^='impact_assessment_fluids.'][name$='.or_kwhef']").each(function( index ) {

        //         var matchingEndUse = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".opportunity") ;
        //         var endUseInLease ;
        //         var meterInLease ;
        //         var confFluidToUse ;
        //         var matchingEndUseInLease ;

        //         if (matchingEndUse) {
        //             // find the corresponding endUse in the Lease
        //             _.each(firstLease.consumption_by_end_use, function(endUse) {
        //                 if(endUse.end_use_name == matchingEndUse){
        //                     matchingEndUseInLease = endUse; // Tableau ?
        //                     console.log("matchingEndUseInLease: ");
        //                     console.log(matchingEndUseInLease);
        //                 }
        //             });

        //             // NOT NECESSARILY USEFUL ???
        //             // find the corresponding fluid_consumption_meter in the Lease
        //             _.each(firstLease.fluid_consumption_meter, function(meter) {
        //                 if(meter.fluid_id == matchingEndUseInLease.fluid_id){
        //                     meterInLease = meter;
        //                     console.log("meter: ");
        //                     console.log(meter);
        //                 }
        //             });

        //             // find the corresponding fluid in the Conf
        //             confFluids = Session.get('current_config').fluids ;
        //             _.each(confFluids, function(fluid) {
        //                 completeFluideName = fluid.fluid_provider + " - " + fluid.fluid_type ;
        //                 if (completeFluideName == matchingEndUseInLease.fluid_id) {
        //                     confFluidToUse = fluid ; // Tableau ?
        //                 }
        //             });
        //             console.log("confFluidToUse") ;
        //             console.log(confFluidToUse) ;

        //         }

        //         var matchingPerCent = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".per_cent") ;

        //         // If first 2 fields are entered, then set the kWef and yearly_budget
        //         if (matchingEndUse && matchingPerCent){
        //             var in_kwhef = matchingEndUseInLease.first_year_value * matchingPerCent/100 ;
        //             $("[name='impact_assessment_fluids." + index + ".or_kwhef']").val( in_kwhef ).change();

        //             $("[name='impact_assessment_fluids." + index + ".yearly_budget']").val(
        //                 // Create loop for all YEARS here ??
        //                 in_kwhef * confFluidToUse.yearly_values[0].cost
        //             ).change();
        //         }

        //     });

        // });


        /* ------------------ */
        /* Other form formula */
        /* ------------------ */

        // Investment ratio and cost
        $("[name='investment.ratio'], [name='investment.cost']").change(function() {
            var curr_field = $(this).val()*1;
            var target, estimate;
            var source = Session.get('current_building_doc').building_info.area_total ;

            if( $(this).attr("name") == "investment.ratio") {
                estimate = (curr_field * source).toFixed(2) ; //We're dealing with % and € so it's OK to only keep 2 decimals
                target = $('[name="investment.cost"]');
            } else {
                estimate = (curr_field / source).toFixed(2) ;
                target = $('[name="investment.ratio"]');
            }

            if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
                    target.val(estimate).change() ;
            }
        });
        $("[name='investment.ratio'], [name='investment.cost']").change() ; // Execute once at form render

        this.autorun(function () {
            // Check: FULLY REACTIVE?
            // make sur that the investment cost change triggers the following formulas
            if (AutoForm.getFieldValue("insertActionForm", "investment.cost") ) {
                $("[name='subventions.ratio']").change();
                console.log("change!");
            }
        });
        // Subventions: ratio and cost in Euro
        $("[name='subventions.ratio'], [name='subventions.or_euro']").change(function() {
            var curr_field = $(this).val()*1;
            var target, estimate;
            // var source = $("[name='investment.cost']").val();
            var source = AutoForm.getFieldValue("insertActionForm", "investment.cost")*1 ;

            if( $(this).attr("name") == "subventions.ratio") {
                estimate = (curr_field/100 * source).toFixed(2) ;
                target = $('[name="subventions.or_euro"]');
            } else {
                estimate = (curr_field*100 / source).toFixed(2) ;
                target = $('[name="subventions.ratio"]');
            }

            if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
                    target.val(estimate).change() ;
            }
        });
        $("[name='subventions.ratio'], [name='subventions.or_euro']").change() ; // Execute once at form Load


        // Subventions: residual cost
        this.autorun(function () {
            investment_cost = AutoForm.getFieldValue("insertActionForm", "investment.cost")*1 ;
            sub_euro = AutoForm.getFieldValue("insertActionForm", "subventions.or_euro")*1 ;
            cee_opportunity = AutoForm.getFieldValue("insertActionForm", "subventions.CEE_opportunity")*1 ;

            $("[name='subventions.residual_cost']").val(
                investment_cost - sub_euro - cee_opportunity
            ).change();
        });

        /* ----------------------- */
        // Operating ratio and cost
        $("[name='operating.ratio'], [name='operating.cost']").change(function() {
            var curr_field = $(this).val()*1;
            var target, estimate;
            var source = Session.get('current_building_doc').building_info.area_total*1 ;

            if( $(this).attr("name") == "operating.ratio") {
                estimate = (curr_field * source).toFixed(2) ;
                target = $('[name="operating.cost"]');
            } else {
                estimate = (curr_field / source).toFixed(2) ;
                target = $('[name="operating.ratio"]');
            }

            if ( ( 1*target.val() ).toFixed(2) !== estimate ) {
                    target.val(estimate).change() ;
            }
        });
        $("[name='operating.ratio'], [name='operating.cost']").change() ; // Execute once at form render

        // --------------------------------------
        // savings_first_year.fluids.euro_peryear
        var totalSavings = [];
        this.autorun(function () {
            $("[name^='impact_assessment_fluids.'][name$='.yearly_budget']").each(function( index ) {
                var val = AutoForm.getFieldValue("insertActionForm", "impact_assessment_fluids." + index + ".yearly_budget") ;
                totalSavings[index] = val*1;
            });
            var totalSavingsValue = _.reduce(totalSavings, function(memo, num){ return memo + num; }, 0);

            $("[name='savings_first_year.fluids.euro_peryear']").val( totalSavingsValue ) ;
        });
        // target: savings_first_year.fluids.euro_peryear
        // impact_assessment_fluids.0.yearly_budget
    }
};



    // var current_building_doc_id = Session.get('current_building_doc')._id;
    // var allLeases = Leases.find({building_id:current_building_doc_id}).fetch();

    // // Build the text domain and the Data
    // _.each(allLeases, function(entry, i) {
    //     dataHolder[i] = {
    //         _id: entry._id
    //     };

    //     dataHolder[i].text_domain = entry.consumption_by_end_use.map(function(item){
    //         return item.end_use_name; // returns an array of the EndUse names
    //     });

// Template.actionForm.events({
//   'keyup [name="investment.ratio"]': function(event) {
//     // console.log("hi");
//     var curr_field = $('[name="investment.ratio"]').val();

//     // Need to associate the Action to the Building!
//     // var current_building = Buildings.find({id:Session.get('current_building_doc')}).fetch();

//     var estimate = curr_field * Session.get('current_building_doc');
//     var update_origin = $('[name="investment.cost"]');

//     if ( update_origin !== estimate ) {
//         $('[name="investment.cost"]').val(estimate) ;
//     }
//   },
//   'keyup [name="investment.cost"]': function(event) {
//     // console.log("KEYUP2");
//     var curr_field = $('[name="investment.cost"]').val();
//     var estimate = curr_field / 2 ;
//     $('[name="investment.ratio"]').val(estimate) ;
//   },

// });
