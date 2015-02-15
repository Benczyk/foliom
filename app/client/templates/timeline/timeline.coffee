# @TODO Planned action vs unplanned actions

# Isolate calculated value in a namespace
@TimelineVars =
  scenario: null
  buildings: []
  totalCost: 0
  minDate: null
  maxDate: null
  rxPlannedActions: new ReactiveVar
  rxTimelineActions: new ReactiveVar
  ###*
   * Perform all calculations and fill the global TimelineVars object.
  ###
  calculate: ->
    # Handle the portfolio and building filtering
    buildingFilter = Session.get 'timeline-filter-portfolio-or-building'
    buildingFilter = _.pluck TV.buildings, '_id' if buildingFilter is undefined
    # Reset the timelineAction
    timelineActions = []
    # Sort planned actions
    @scenario.planned_actions = _.sortBy @scenario.planned_actions, (item) ->
      (moment item.start).valueOf()
    # Reset charts that doesn't depends on actions
    @charts = { ticks: [], budget: [], consumption: [] }
    # Index on the actions table
    currentAction = 0
    # Build formatted data
    quarter = @minDate.clone()
    nextQuarter = quarter.clone().add 1, 'Q'
    while quarter.isBefore @maxDate
      # Parsing each year content
      currentYear = quarter.year()
      yearContent =
        yearValue: currentYear
        quarterContent: []
      while currentYear is quarter.year()
        # Parsing each quarter content
        quarterContent =
          value: quarter.quarter()
          quarterValue: JSON.stringify Q: quarter.quarter(), Y:currentYear
          tActions: []
        # Loop through actions utill they aren't in the current quarter
        loop
          # Get out of the loop if all actions have been checked
          break unless @scenario.planned_actions[currentAction]?
          paction = @scenario.planned_actions[currentAction]
          # Check if current action is contained in the current filter
          if paction.action.building_id in buildingFilter
            # Check if current action is contained in the current quarter
            break unless paction.start.isBetween quarter, nextQuarter
            # Set the current action in the current quarter
            quarterContent.tActions.push paction.action
            # Total costs
            @totalCost += paction.action.investment.cost
          # Check next action
          currentAction++
        # Group actions in quarter by name
        group = _.groupBy quarterContent.tActions, 'logo'
        quarterContent.tActions = []
        for key, value of group
          item =
            logo: key
            length: value.length
            buildingsToActions: JSON.stringify(for action in value
              building_id: action.building_id
              action_id: action._id
            )
          quarterContent.tActions.push item
        # Budget line for chart
        @charts.budget.push @scenario.total_expenditure
        # Labels for charts
        @charts.ticks.push \
          "#{TAPi18n.__ 'quarter_abbreviation'}#{quarter.format 'Q YYYY'}"
        # Current consumption for charts
        # @TODO Fake data
        @charts.consumption.push 3.5
        # Set year in the timeline
        yearContent.quarterContent.push quarterContent
        # Increment by 1 quarter
        quarter.add 1, 'Q'
        nextQuarter.add 1, 'Q'
      timelineActions.push yearContent
    # Generate suites for each action
    for paction, idx in @scenario.planned_actions
      # Denormalize date
      paction.quarter = \
        "#{TAPi18n.__ 'quarter_abbreviation'}#{paction.start.format 'Q YYYY'}"
      # Denormalize building's name and portfolio's id
      building = _.findWhere @buildings, _id: paction.action.building_id
      paction.buildingName = building.building_name
      paction.portfolioId = building.portfolio_id
      # Denormalize and format cost
      paction.formattedCost = (numeral \
        paction.action.investment.cost).format '0,0[.]00 $'
      # Prepare triggering dates
      paction.endDesign = paction.start.clone().add \
        paction.action.design_duration, 'M'
      paction.endWork = paction.endDesign.clone().add \
        paction.action.works_duration, 'M'
      paction.end = paction.endWork.clone().add \
        paction.action.action_lifetime, 'Y'
      paction.investmentSuite = []
      paction.investmentSubventionedSuite = []
      paction.consumptionCo2ModifierSuite = []
      paction.consumptionKwhModifierSuite = []
      # Iterate over the scenario duration
      quarter = @minDate.clone()
      nextQuarter = quarter.clone().add 1, 'Q'
      investment = 0
      investmentSubventioned = 0
      consumptionCo2Modifier = 0
      consumptionKwhModifier = 0
      while quarter.isBefore @maxDate
        if paction.start.isBetween quarter, nextQuarter
          investment = paction.action.investment.cost
          investmentSubventioned = paction.action.subventions.residual_cost
        if paction.endWork.isBetween quarter, nextQuarter
          # @TODO Fake modifiers
          consumptionCo2Modifier = -.5
          consumptionKwhModifier = -1
        paction.investmentSuite.push investment
        paction.investmentSubventionedSuite.push investmentSubventioned
        paction.consumptionCo2ModifierSuite.push consumptionCo2Modifier
        paction.consumptionKwhModifierSuite.push consumptionKwhModifier
        # Increment by 1 quarter
        quarter.add 1, 'Q'
        nextQuarter.add 1, 'Q'
    # Assign reactive vars
    TV.rxPlannedActions.set @scenario.planned_actions
    TV.rxTimelineActions.set timelineActions
    #console.table _.map TV.scenario.planned_actions, (paction) ->
    #  id: paction.action_id
    #  start: (moment paction.start).format 'Q YYYY'

# Local alias on the namespaced variables for the Timeline
TV = TimelineVars

###*
 * Prepare calculation at template creation.
###
Template.timeline.created = ->
  # Reset former state
  TV.totalCost = 0
  # @TODO fake : Fetch Scenario's data
  # TV.scenario = Scenarios.findOne _id: scenarioId
  TV.scenario = Scenarios.findOne()
  # @TODO check for unplanned actions
  # Get actions that matches the Ids in the Scenario
  pactions = TV.scenario.planned_actions
  actionIds = _.pluck pactions, 'action_id'
  actions = (Actions.find  _id: $in: actionIds).fetch()
  # Denormalize actions in the scenario and transform the start date as moment
  for paction in pactions
    paction.action = _.findWhere actions, _id: paction.action_id
    paction.start = moment paction.start
  # Get each buildings for each actions
  buildingIds = _.uniq _.pluck actions, 'building_id'
  TV.buildings = (Buildings.find _id: $in: buildingIds).fetch()
  # Get each portfolios for each buildings
  portfolioIds = _.uniq _.pluck TV.buildings, 'portfolio_id'
  TV.portfolios = (Portfolios.find _id: $in: portfolioIds).fetch()
  # Get all leases for all building, this action is done in a single DB call
  # for avoiding too much latency on the screen's creation
  leases = (Leases.find building_id: $in: buildingIds).fetch()
  # Now dernomalize leases and buildings, re-establishing document object
  # for each building
  for building in TV.buildings
    building.leases = _.where leases, building_id: building._id
  # Set minimum date on the creation date and maximum date 31 years later
  creationYear = (moment (Session.get 'current_config').creation_date).year()
  TV.minDate = moment year: creationYear
  TV.maxDate = moment day: 30, month: 11, year: creationYear + 31
  # Reactively perform calculations based on filter changes
  @autorun ->
    TV.calculate()

###*
 * Object containing helper keys for the template.
###
Template.timeline.helpers scenarioName: -> TV.scenario.name

Template.timeline.rendered = ->
  new WOW().init()
