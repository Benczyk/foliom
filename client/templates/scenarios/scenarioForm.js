Template.scenarioForm.helpers({
  name_pl: function() {
    return TAPi18n.__('name');
  },
  duration_pl: function() {
    return TAPi18n.__('In') + " " + TAPi18n.__('u_years');
  },
  total_expenditure_pl: function() {
    return TAPi18n.__('In') + " " + TAPi18n.__('u_euros');
  }
});

Template.scenarioForm.rendered = function() {
    $( "#sortable" ).sortable();
    $( "#sortable" ).disableSelection();
};

Template.scenarioForm.helpers({
    isCheckbox: function(type){
        return (type == "checkbox") ? true : false;
    },
    getCriterion: function(){
        return [
            {"label": "yearly_expense_max"},
            {"label": "energy_consum_atLeast_in_E_year"},
            {"label": "wait_for_obsolescence", "type":"checkbox", "desc": "wait_for_obsolescence_desc"},
            {"label": "priority_to_gobal_obsolescence", "type":"checkbox", "desc": "priority_to_gobal_obsolescence_desc"}
            ];
    },
});