/*

user_id (creator) :  User
building_id:  Building ref

lease_name : String
rental_status : Selector
rent : Number,
last_significant_renovation : Number

lease_usage : Selector // Possible d'ajouter une value >> trad ?

area_by_usage : Number
nb_floors_by_usage : Number
IGH : Selector

erp_status : Selector
erp_category : Selector

dpe_energy_consuption_grade : Selector
dpe_energy_consuption_value : Number

dpe_co2_emission_grade : Selector
dpe_co2_emission_value : Number,

fluid_consumption_meter : [{
     fluid_id : Fluid ref
     yearly_subscription : Number
     first_year_value : Number,
     yearly_cost : Number
}]

consumption_by_end_use : {
     categories : [{
          end_use_id : End_use ref
          fluid_id : Fluid ref
          first_year_value : Number,
     }],
     total : Number
},

certifications: [{
    cert_id:  Certifications ref,
    comments: String, default: 'Version, détails :'
  }],

comfort_qualitative_assessment {
    acoustic: Selector,
    visual: Selector,
    thermic: Selector,
    global_comfort_index: Number
    comments: String
}

// Faire le fichier de Data à injecter + les Selectors
technical_compliance: {
    categories: [{
          name: String
          lifetime: Selector,
          conformity: Selector
          desc: String
    }],
    global_lifetime: String,
    global_conformity: String
    comments: String,
  }

conformity_info: [{
     name: String
     eligibility: Boolean
     due_date: {
          periodicity: Selector,
          due_date_value: Date } // l'un des 2 champs
     conformity: Selector
     last_diagnostic: Date
     diagnostic_alert: Boolean
     comments: String
     files: File ref [ ]
  }]
*/

if(typeof Schema === "undefined") {
    Schema = {};
}

var comfort_values = [
                {label : transr("good"), value: "good" },
                {label : transr("average"), value: "average" },
                {label : transr("bad"), value: "bad" }
                ];

// The two var below are now in the OVERLORD utils (but can be used here)

// var conformity_options = ["compliant", "not_compliant_minor", "not_compliant_major"] ;

// var technical_compliance_items = ["core_and_shell", "facade", "roof_terrasse", "heat_production", "chiller", "power_supply", "electrical_delivery", "thermal_delivery", "heating_terminal", "chiller_terminal", "lighting_terminal", "GTC/GTB", "air_system", "ventilation_system", "hot_water_production", "hot_water_delivery"]


consumption_by_end_use = new SimpleSchema({
    end_use_name: {
        type: String,
        autoform: {
            afFieldInput: {
                class:"end_use_name" // makes it easier to select
            }
        },
        // optional:true, // ToDo : retirer et faire le link avec le EndUse
    },
    fluid_id: {
        type: String,
        autoform: {
            type: "select",
            options: function () {
                return getFluids();
            }
        }
    },
    first_year_value: {
        type: Number,
        label: transr("first_year_value"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwhEF"),
            }
        }
    }
});

Schema.consumption_by_end_use = consumption_by_end_use;

fluidConsumptionMeterSchema = new SimpleSchema({
    fluid_id: {
        type: String,
        optional: true, // ToDo : a dynamiser
        label: transr("fluid"),
        autoform: {
            type: "select",
            options: function () {
                return getFluids();
            },
            class:"fluidConsumptionMeter_fluidID"
        }
    },
    yearly_subscription: {
        type: Number,
        label: transr("yearly_subscription"),
        defaultValue: 0,
        autoform: {
            class:"fluidConsumptionMeter_yearlySubscription"
        }
    },
    first_year_value: {
        type: Number,
        label: transr("first_year_value"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                // readonly:"true",
            }
        }
    },
    yearly_cost: {
        type: Number,
        label: transr("yearly_cost"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro"),
                // readonly:"true",
            }
        }
    },
});

certificationsSchema = new SimpleSchema({
    cert_id: {
        type: String,
        label: transr("cert_id"),
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('certifications');
            }
        }
    },
    cert_comments: {
        type: String,
        label: transr("cert_comments"),
        // defaultValue: "Version, détails :",
        autoform: {
            rows: 3
        },
        optional:true,
    },
});

Schema.certifications = certificationsSchema;


customCertificationsSchema = new SimpleSchema({
    cert_name: {
        type: String,
        label: transr("name"),
        autoform: {
            type: "text",
        }
    },
    visual: {
        type: String,
        label: transr("custom_visual"),
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: 'Images'
            }
        },
    },
    cert_comments: {
        type: String,
        label: transr("cert_comments"),
        // defaultValue: "Version, détails :",
        autoform: {
            rows: 3
        },
        optional:true,
    },
});

Schema.customCertifications = customCertificationsSchema;



technical_compliance_categorySchema = new SimpleSchema({
    lifetime: {
        type: String,
        label: transr("lifetime"),
        autoform: {
            afFieldInput: {
                type: "select",
                options: function () {
                    return buildOptions(["new_dvr", "good_dvr", "average_dvr", "bad_dvr"]);
                },
                class:"tcc_lifetime", // makes it easier to select
            },
            afFormGroup: {
                label:false
            }
        }
    },
    conformity: {
        type: String,
        label: transr("conformity"),
        autoform: {
            afFieldInput: {
                type: "select",
                options: function () {
                    return getSelectors('conformity_options');
                },
                class:"tcc_conformity" // makes it easier to select
            },
            afFormGroup: {
                label:false
            }
        }
    },
    description: {
        type: String,
        label: transr("description"),
        // defaultValue: "Version, détails :",
        optional: true,
        autoform: {
            afFormGroup: {
                label:false
            }
        }
    },
});
Schema.categories2 = technical_compliance_categorySchema;


conformity_infoSchema = new SimpleSchema({
    eligibility: {
        type: Boolean,
        label: transr("is_eligibile"),
        autoform: {
            // template:'eportfolio-horizontal',
            /*type: "select-checkbox",
            options: function () {
                return buildOptions(["yes"]);
            }*/
        },
        optional: true,
    },
    periodicity: {
        type: String,
        label: transr("periodicity"),
        autoform: {
            afFieldInput: {
                type: "select",
                options: function () {
                    return buildOptions(["monthly", "quaterly", "bi_annual", "yearly", "2_years", "5_years", "7_years", "10_years"]);
                },
            },
            // afFormGroup:{
            //     style: "display: inline-block; width: 45%;"
            // }
        },
        optional: true,
    },
    due_date: {
        type: Date,
        label: transr("due_date"),
        autoform: {
            afFieldInput: {
                type: "date",
            },
            // afFormGroup:{
            //     style: "display: inline-block; width: 45%; float: right;"
            // }
        },
        optional: true,
    },
    conformity: {
        type: String,
        label: transr("conformity"),
        autoform: {
            type: "select",
            options: function () {
                return getSelectors('conformity_options');
            }
        },
        optional: true,
    },
    last_diagnostic: {
        type: Date,
        label: transr("last_diagnostic"),
        autoform: {
            type: "date",
        },
        optional: true,

    },
    diagnostic_alert: {
        type: Boolean,
        autoform: {
            // template: 'eportfolio-horizontal',
            omit:true
        },
        optional:true,
    },
    comments_small: {
        type: String,
        label: transr("comments_small"),
        optional:true,
    },
    files: {
        type: [String],
        label: transr("Files"),
        optional:true,
        autoform: {
            // template: 'eportfolio-horizontal',
        }
    },
    "files.$": {
        autoform: {
            afFieldInput: {
                type: 'fileUpload',
                collection: 'Images'
            }
        },
        optional:true,
    },
});

Schema.conformity_information = conformity_infoSchema;
// conformity_info: [{
//      name: String
//      eligibility: Boolean
//      due_date: {
//           periodicity: Selector,
//           due_date_value: Date } // l'un des 2 champs
//      conformity: Selector
//      last_diagnostic: Date
//      diagnostic_alert: Boolean
//      comments: String
//      files: File ref [ ]
//   }]


Leases = new Mongo.Collection("leases");


Leases.attachSchema(new SimpleSchema({
    building_id: {
        type: String,
        //optional: true, // ToDo : a retirer
        autoform: {
            omit:true
        }
    },
    lease_name: {
        type: String,
        label: transr("lease_name"),
        // Test to check if defaultValue can be used with session vars -> yes
        // defaultValue: function() {
        //     return Session.get('current_estate_doc')._id;
        // }
    },
    rental_status: {
        type: String,
        label: transr("rental_status"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["empty", "rented", "multitenant"])
            }
        }
        // autoform: {
        //     type: "select",
        //      options: function () {
        //         return getSelectors('rental_status'); ;
        //     }
        // }

    },
    rent: {
        type: Number,
        label: transr("rent"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_euro_m2"),
            }
        }
    },
    last_significant_renovation: {
        type: Number,
        label: transr("last_significant_renovation"),
        defaultValue: 0,
    },
    lease_usage: {
        type: String,
        label: transr("lease_usage"),
        optional: function () {
            return debugMode;
        },
        autoform: {
            type: "select",
             options: function () {
                return getSelectors('lease_usage');
            }
        }
    },
    area_by_usage: {
        type: Number,
        label: transr("area_by_usage"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_m2"),
            }
        }
    },
    lease_nb_floors: {
        type: Number,
        label: transr("lease_nb_floors"),
        defaultValue: 0,
    },
    igh: {
        type: String,
        label: transr("igh"),
        optional: function () {
            return debugMode;
        },
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["yes", "no"])
            }
        }
    },
    erp_status: {
        type: String,
        label: transr("erp_status"),
        optional: function () {
            return debugMode;
        },
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["NA", "erp_J", "erp_L", "erp_M", "erp_N", "erp_O", "erp_P", "erp_R", "erp_S", "erp_T", "erp_U", "erp_V", "erp_W", "erp_X", "erp_Y"])
            }
        }
    },
    erp_category: {
        type: String,
        label: transr("erp_category"),
        optional: function () {
            return debugMode;
        },
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["erp_1", "erp_2", "erp_3", "erp_4", "erp_5"])
            }
        }
    },
    headcount:{
        type: Number,
        label: transr("headcount"),
    },
    dpe_type:{
        type: String,
        label: transr("dpe_type"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["housing", "tertiary_building_private", "tertiary_building_public_std", "tertiary_building_public_continuously_occ", "tertiary_building_public_other_types"])
            }
        }
    },
    dpe_energy_consuption: {
        type: Object,
        optional: function () {
            return debugMode;
        },
        label: transr("dpe_energy_consuption")
    },
    'dpe_energy_consuption.grade': {
        type: String,
        label: transr("grade"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["dpe_A", "dpe_B", "dpe_C", "dpe_D", "dpe_E"])
            }
        },
        optional: function () {
            return debugMode;
        },
    },
    'dpe_energy_consuption.value': {
        type: Number,
        label: transr("value"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwh_m2_year_primEnergy")
            }
        }
    },
    dpe_co2_emission: {
        type: Object,
        label: transr("dpe_co2_emission"),
        optional: function () {
            return debugMode;
        },
    },
    'dpe_co2_emission.grade': {
        type: String,
        label: transr("grade"),
        autoform: {
            type: "select",
            options: function() {
                return buildOptions(["dpe_A", "dpe_B", "dpe_C", "dpe_D", "dpe_E"])
            }
        },
        optional: function () {
            return debugMode;
        },
    },
    'dpe_co2_emission.value': {
        type: Number,
        label: transr("value"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kg_eqC02_m2_year"),

            }
        }
    },
    fluid_consumption_meter: {
        type: [fluidConsumptionMeterSchema],
        label: transr("fluid_consumption_meter"),
        minCount: 3,
        autoform: {
            template:"fluidConsumptionMeter"
        },
        optional: function () {
            return debugMode;
        },
    },

// EVOL MODEL -> get total out of object
// consumption_by_end_use : {
//      categories : [{
//           end_use_id : End_use ref
//           fluid_id : Fluid ref
//           first_year_value : Number,
//      }],
//      total : Number
// },
    consumption_by_end_use: {
        type: [consumption_by_end_use],
        label: transr("consumption_by_end_use"),
        minCount: 7,
        autoform: {
            // template:"consumptionByEndUse"
        },
        optional: function () {
            return debugMode;
        },
    },
    consumption_by_end_use_total: {
        type: Number,
        label: transr("consumption_by_end_use_total"),
        defaultValue: 0,
        autoform: {
            afFieldInput: {
                type: 'number_u',
                unit: transr("u_kwhEF"),

            }
        }
    },
    certifications: {
        type: [certificationsSchema],
        label: transr("certifications"),
        autoform: {
            // template:"consumptionByEndUse"
        },
        optional: true,
    },
    customCertifications: {
        type: [customCertificationsSchema],
        label: transr("custom_certifications"),
        autoform: {
            // template:"consumptionByEndUse"
        },
        optional: true,
    },

    comfort_qualitative_assessment: {
        type: Object,
        label: transr("comfort_qualitative_assessment"),
        autoform: {
             template:"inline"
        },
        optional: function () {
            return debugMode;
        },
    },
    'comfort_qualitative_assessment.acoustic': {
        type: String,
        label: transr("acoustic"),
        optional: true,
        autoform: {
            type: "select",
            options: comfort_values
        }
    },
    'comfort_qualitative_assessment.visual': {
        type: String,
        label: transr("visual"),
        optional: true,
        autoform: {
            type: "select",
            options: comfort_values
        }
    },
    'comfort_qualitative_assessment.thermic': {
        type: String,
        label: transr("thermic"),
        optional: true,
        autoform: {
            type: "select",
            options: comfort_values
        }
    },
    'comfort_qualitative_assessment.global_comfort_index': {
        type: Number,
        decimal: true,
        label: transr("global_comfort_index"),
        defaultValue:0,
        autoform: {
            afFieldInput: {
                readonly:"true",
                value: function() {
                    var acoustic = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.acoustic");
                    var visual = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.visual");
                    var thermic = AutoForm.getFieldValue("insertLeaseForm", "comfort_qualitative_assessment.thermic");

                    return calc_qualitative_assessment(acoustic, visual, thermic);

                }
            }
        }
    },
    'comfort_qualitative_assessment.comments': {
        type: String,
        label: transr("comments"),
        // defaultValue: "Version, détails :",
        autoform: {
            rows: 6,
            // placeholder:"schemaLabel"
        },
        optional: function () {
            return debugMode;
        },
    },

    technical_compliance: {
        type: Object,
        label: transr("technical_compliance"),
        autoform: {
            // template:"consumptionByEndUse"
        },
        optional: function () {
            return debugMode;
        },
    },
    'technical_compliance.categories': {
        type: Object,
        // label: transr("technical_compliance"),
        autoform: {
            template:"technical_compliance_category_Block",
            afFormGroup: {
                label:false
            },
        },
        optional: function () {
            return debugMode;
        },
    },
    'technical_compliance.categories.core_and_shell': {
        type: technical_compliance_categorySchema,
        label: transr("core_and_shell"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.facade': {
        type: technical_compliance_categorySchema,
        label: transr("facade"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.roof_terrasse': {
        type: technical_compliance_categorySchema,
        label: transr("roof_terrasse"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.heat_production': {
        type: technical_compliance_categorySchema,
        label: transr("heat_production"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.chiller': {
        type: technical_compliance_categorySchema,
        label: transr("chiller"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.power_supply': {
        type: technical_compliance_categorySchema,
        label: transr("power_supply"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.electrical_delivery': {
        type: technical_compliance_categorySchema,
        label: transr("electrical_delivery"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.thermal_delivery': {
        type: technical_compliance_categorySchema,
        label: transr("thermal_delivery"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.heating_terminal': {
        type: technical_compliance_categorySchema,
        label: transr("heating_terminal"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.chiller_terminal': {
        type: technical_compliance_categorySchema,
        label: transr("chiller_terminal"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.lighting_terminal': {
        type: technical_compliance_categorySchema,
        label: transr("lighting_terminal"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.GTC_GTB': {
        type: technical_compliance_categorySchema,
        label: transr("GTC_GTB"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },

    'technical_compliance.categories.air_system': {
        type: technical_compliance_categorySchema,
        label: transr("air_system"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.ventilation_system': {
        type: technical_compliance_categorySchema,
        label: transr("ventilation_system"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.hot_water_production': {
        type: technical_compliance_categorySchema,
        label: transr("hot_water_production"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.hot_water_delivery': {
        type: technical_compliance_categorySchema,
        label: transr("hot_water_delivery"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },
    'technical_compliance.categories.fire_security': {
        type: technical_compliance_categorySchema,
        label: transr("fire_security"),
        autoform: {
            template: 'technical_compliance_category'
        }
    },

    'technical_compliance.global_lifetime': {
        type: Number,
        decimal: true,
        label: transr("global_lifetime"),
        autoform: {
            afFieldInput: {
                readonly:"true",
            }
        }
    },
    'technical_compliance.global_conformity': {
        type: Number,
        decimal: true,
        label: transr("global_conformity"),
        autoform: {
            readonly:"true",
            // template:"consumptionByEndUse"
        }
    },
    'technical_compliance.tc_comments': {
        type: String,
        label: transr("tc_comment"),
        autoform: {
            rows: 6,
            // template:"consumptionByEndUse"
        },
        optional: true,
    },


    conformity_information: {
        type: Object,
        label: transr("conformity_information"),
        // minCount: 14,
        // maxCount: 14,
        autoform: {
            afObjectField:{
                template:"conformity_infoBlock"
            },
            // afFormGroup:{
            //     template:"conformity_infoSchema"
            // },
            // afArrayField:{
            //     template:"conformity_infoSchema"
            // },
        },
    },
    'conformity_information.accessibility': {
        type: conformity_infoSchema,
        label: transr("accessibility"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.elevators': {
        type: conformity_infoSchema,
        label: transr("elevators"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.ssi': {
        type: conformity_infoSchema,
        label: transr("ssi"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.asbestos': {
        type: conformity_infoSchema,
        label: transr("asbestos"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.lead': {
        type: conformity_infoSchema,
        label: transr("lead"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.legionella': {
        type: conformity_infoSchema,
        label: transr("legionella"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.electrical_installation': {
        type: conformity_infoSchema,
        label: transr("electrical_installation"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.dpe': {
        type: conformity_infoSchema,
        label: transr("dpe"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.indoor_air_quality': {
        type: conformity_infoSchema,
        label: transr("indoor_air_quality"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.radon': {
        type: conformity_infoSchema,
        label: transr("radon"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.chiller_terminal': {
        type: conformity_infoSchema,
        label: transr("chiller_terminal"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.lead_disconnector': {
        type: conformity_infoSchema,
        label: transr("lead_disconnector"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.automatic_doors': {
        type: conformity_infoSchema,
        label: transr("automatic_doors"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },
    'conformity_information.chiller_system': {
        type: conformity_infoSchema,
        label: transr("chiller_system"),
        autoform: {
            afObjectField:{
                template:"conformity_infoSchema"
            },
        },
    },

// conformity_information_items = ["accessibility", "elevators", "ssi", "asbestos", "lead", "legionella", "electrical_installation", "DPE", "indoor_air_quality", "radon", "chiller_terminal", "lead_disconnector", "automatic_doors", "chiller_system"];

// conformity_info: [{
//      name: String
//      eligibility: Boolean
//      due_date: {
//           periodicity: Selector,
//           due_date_value: Date } // l'un des 2 champs
//      compliance: Selector
//      last_diagnostic: Date
//      diagnostic_alert: Boolean
//      comments_small: String
//      files: File ref [ ]
//   }]





}));
