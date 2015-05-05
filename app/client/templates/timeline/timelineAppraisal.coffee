# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Object containing helper keys for the template.
###
Template.timelineAppraisal.helpers
  nbActions: -> TV.scenario.planned_actions.length
  totalCost: -> "#{(numeral TV.totalCost).format '0,0[.]00'} €"
  triGlobal: ->
    unless TV.triGlobal is 0
      "#{TV.triGlobal} #{TAPi18n.__ 'u_years'}"
    else
      TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'
  waterSaving: -> TAPi18n.__ 'calculating'
  co2Saving: -> TAPi18n.__ 'calculating'
  budgetSaving: -> TAPi18n.__ 'calculating'
