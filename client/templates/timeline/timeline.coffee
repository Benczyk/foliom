# Chartist colors are extracted from:
# https://github.com/gionkunz/chartist-js/blob/develop/src/styles/settings/_chartist-settings.scss
CHARTIST_COLORS = ['#d70206', '#F05B4F', '#F4C63D', '#453D3F']

Template.timeline.helpers
  scenarioId: -> 1
  nbActions: -> 54
  amount: -> numeral(1950000).format '0,0[.]00 $'
  triGlobal: -> TAPi18n.__ 'calculating'
  energySaving: -> TAPi18n.__ 'calculating'
  # Legends are created as simple <table>
  consumptionLegend: -> [
    {
      round: "background-color: #{CHARTIST_COLORS[0]};"
      style: "color: #{CHARTIST_COLORS[0]};"
      name:  TAPi18n.__ 'consumption_noaction'
    }
    {
      round: "background-color: #{CHARTIST_COLORS[1]};"
      style: "color: #{CHARTIST_COLORS[1]};"
      name:  TAPi18n.__ 'consumption_action_co2'
    }
    {
      round: "background-color: #{CHARTIST_COLORS[2]};"
      style: "color: #{CHARTIST_COLORS[2]};"
      name:  TAPi18n.__ 'consumption_action_kwh'
    }
  ]
  planningBudgetLegend: -> [
    {
      round: "background-color: #{CHARTIST_COLORS[0]};"
      style: "color: #{CHARTIST_COLORS[0]};"
      name:  TAPi18n.__ 'planning_budget_global'
    }
    {
      round: "background-color: #{CHARTIST_COLORS[1]};"
      style: "color: #{CHARTIST_COLORS[1]};"
      name:  TAPi18n.__ 'planning_budget_investments'
    }
    {
      round: "background-color: #{CHARTIST_COLORS[2]};"
      style: "color: #{CHARTIST_COLORS[2]};"
      name:  TAPi18n.__ 'planning_budget_subventions'
    }
  ]

Template.timeline.rendered = ->
  timeline = ['S1 2015', 'S2 2015', 'S1 2016', 'S2 2016', 'S1 2017']
  consumptionData =
    labels: timeline
    series: [
      [3, 4, 4.5, 4.7, 5]
      [3, 3.5, 3.2, 3.1, 2]
      [3, 3.5, 4, 4.2, 4.5]
    ]
  planningBudgetData =
    labels: timeline
    series: [
      [5, 5, 5, 5, 5]
      [0, 1, 2, 4, 4.7]
      [0, .5, 1.2, 2.5, 3.5]
    ]
  new Chartist.Line '#consumption.ct-chart', consumptionData
  new Chartist.Line '#planning_budget.ct-chart', planningBudgetData