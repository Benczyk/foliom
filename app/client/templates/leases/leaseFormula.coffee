@isERP = (param) ->
  if param is "" or param is "NA" then false
  else true

@periodicityToMoment = (param) ->
  result = switch
    when param is "monthly" then {months:1}
    when param is "quaterly" then {quarters:1}
    when param is "bi_annual" then {quarters:2}
    when param is "yearly" then {years:1}
    when param is "2_years" then {years:2}
    when param is "5_years" then {years:5}
    when param is "7_years" then {years:7}
    when param is "10_years" then {years:10}

# calc_qualitative_assessment_array
# class must be jQuery selector, eg. ".comformt_QA"
# same for target, eg. '[name=\'comfort_qualitative_assessment.global_comfort_index\']'
@class_to_calc_qualitative_assessment_array = (class_param, target) ->
  array = []
  $(class_param).change =>
    array = $(class_param).get().map( (item) ->
      $(item).val()
    )
    $(target).val(calc_qualitative_assessment_array(array)).change()
  return

# Hide/show or auto-fill some fields
@leaseFieldRules = (newLease) ->
  # Only display 'rent' if 'rental_status' is 'rented'
  $('[name="rental_status"]').change ->
    hideDependingOnOtherField('rent', $(@).val(), 'rented')
  # Trigger one change at render to hide or show the field
  $('[name="rental_status"]').change()

  # If newLease
  if newLease is true
    # Set the last_significant_renovation to the building creating date
    $('[name="last_significant_renovation"]').val(
      Session.get('current_building_doc').building_info.construction_year
    )
    # If only one lease to create
    if Session.get('nbLeases_2create_onlyOne')
      # lease_name = building_name (and hide field)
      $('[name="lease_name"]').val(
        Session.get('current_building_doc').building_name
      )
      $("[name='lease_name']").parents(".form-group").hide()
      # area_by_usage = building_info.area_useful (and hide field)
      $('[name="area_by_usage"]').val(
        Session.get('current_building_doc').building_info.area_useful
      )
      $("[name='area_by_usage']").parents(".form-group").hide()
      # lease_nb_floors = building_info.building_nb_floors (and hide field)
      $('[name="lease_nb_floors"]').val(
        Session.get('current_building_doc').building_info.building_nb_floors
      )
      $("[name='lease_nb_floors']").parents(".form-group").hide()


@hideDependingOnOtherField = (fieldToHide, sourceValue, sourceCriterion) ->
  if sourceValue isnt sourceCriterion
    $("[name='#{fieldToHide}']").parents(".form-group").hide()
  else
    $("[name='#{fieldToHide}']").parents(".form-group").show()


@alertManager = () ->
  ### ALERTS for conformity_information_items

  conformity_information_items = ['accessibility', 'elevators', 'ssi', 'asbestos', 'lead', 'legionella', 'electrical_installation', 'dpe', 'indoor_air_quality', 'radon', 'chiller_terminal', 'lead_disconnector', 'automatic_doors', 'chiller_system'];

  Alert cases (only to be triggered IF eligibility is true)
  IF (last_diagnostic + periodicity) < today
  OR IF due_date >= last_diagnostic
  OR IF last_diagnostic is empty

  Could have been done with Autoform/ But as of April 2015, the performances of Autoform.getFieldValue() in Autoform5 are way worse than what they used to be in Autoform4. Thus the solution in jQuery.
  ###

  conformity_information_items_div = $('.CiS_block')

  _.each conformity_information_items, (item) ->

    eligibility_selector = '[name="conformity_information.' + item + '.eligibility"]'
    last_diagnostic_selector = '[name="conformity_information.' + item + '.last_diagnostic"]'
    diagnostic_alert_selector = '[name="conformity_information.' + item + '.diagnostic_alert"]'
    periodicity_selector = '[name="conformity_information.' + item + '.periodicity"]'
    due_date_selector = '[name="conformity_information.' + item + '.due_date"]'

    # Monitor 'change' event for all items, on relevant fields
    conformity_information_items_div.on 'change', (eligibility_selector + ',' + last_diagnostic_selector + ',' + periodicity_selector + ',' + due_date_selector), ->

      eligibility = conformity_information_items_div.find(eligibility_selector).prop('checked')
      span_item = $(last_diagnostic_selector).siblings('span')
      # Only trigger alerts if eligibility is true
      if eligibility == true
        last_diagnostic_val = conformity_information_items_div.find(last_diagnostic_selector).val()
        periodicity = conformity_information_items_div.find(periodicity_selector).val()
        due_date = conformity_information_items_div.find(due_date_selector).val()
        last_diagnostic_moment = moment(last_diagnostic_val)
        periodicity_moment = periodicityToMoment(periodicity)
        due_date_moment = moment(due_date)
        today = moment()
        # Apply Alert cases:
        if last_diagnostic_moment.add(periodicity_moment) < today or due_date >= last_diagnostic_val or last_diagnostic_val == null
          warning_text = transr('last_diagnostic_obsolete')
          span_item.text(warning_text).css 'color', 'red'
          $(diagnostic_alert_selector).val true
        else
          # Remove alert and the message
          span_item.text ''
          $(diagnostic_alert_selector).val false
      else
        # Remove alert and the message
        span_item.text ''
        $(diagnostic_alert_selector).val false
    # End of on.change()

    # Trigger a change a first time, so that the Alerts are checked at render
    $('[name^="conformity_information."][name$=".eligibility"]').change()

    return



### Auto-values: used to auto-fill part of the form - for dev. purposes ###
@fillLeaseForm = (activate) ->
  if activate
    $('[name^=\'fluid_consumption_meter.\'][name$=\'.first_year_value\']').each (index) ->
      $(this).val randomIntFromInterval(0, 100)
      return
    $('[name^=\'fluid_consumption_meter.\'][name$=\'.yearly_subscription\']').each (index) ->
      $(this).val randomIntFromInterval(0, 100)
      return
    $('[name^=\'technical_compliance.categories.\'][name$=\'.lifetime\']').each (index) ->
      $(this).val 'bad_dvr'
      return
    $('[name^=\'technical_compliance.categories.\'][name$=\'.conformity\']').each (index) ->
      $(this).val 'compliant'
      return
    $('[name^=\'conformity_information.\'][name$=\'.eligibility\']').each (index) ->
      if randomIntFromInterval(0, 1) > 0
        $(this).prop 'checked', true
      return

    fakeOptionInput = (name1, name2) ->
      options = $('[name=\'' + name1 + '.0.' + name2 + '\'] option').map(->
        $(this).val()
      )
      $('[name^=\'' + name1 + '.\'][name$=\'.' + name2 + '\']').each (index) ->
        $(this).val options[randomIntFromInterval(1, options.length - 1)]
        return
      return

    fakeOptionInput 'conformity_information', 'periodicity'
    fakeOptionInput 'conformity_information', 'conformity'
    $('[name^=\'conformity_information.\'][name$=\'.due_date\']').each (index) ->
      $(this).val '2015-01-16'
      return
    $('[name^=\'conformity_information.\'][name$=\'.last_diagnostic\']').each (index) ->
      $(this).val '2015-01-16'
      return
    options = $('[name=\'consumption_by_end_use.0.fluid_id\'] option').map(->
      $(this).val()
    )
    $('[name^=\'consumption_by_end_use.\'][name$=\'.fluid_id\']').each (index) ->
      $(this).val options[3]
      return
