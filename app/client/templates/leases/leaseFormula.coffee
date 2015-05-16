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

  # If newLease, then set the last_significant_renovation to the building creating date
  if newLease is true
    console.log "New Lease!"
    $('[name="last_significant_renovation"]').val(
      Session.get('current_building_doc').building_info.construction_year
    )


@hideDependingOnOtherField = (fieldToHide, sourceValue, sourceCriterion) ->
  if sourceValue isnt sourceCriterion
    $("[name='#{fieldToHide}']").parents(".form-group").hide()
  else
    $("[name='#{fieldToHide}']").parents(".form-group").show()


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
