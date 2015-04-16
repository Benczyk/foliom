Template.actionsList.rendered = function () {
  // init session vars
  Session.set('masterAction', null);
  Session.set('newActionType', null);
};


Template.actionsList.helpers({
  getGenericActions: function(){
    return Actions.find({
       "estate_id": { $exists: false },
       "action_type": "generic"
    }).fetch();
  },
  getUserTemplateActions: function(){
    return Actions.find({
       "estate_id": Session.get('current_estate_doc')._id,
       "action_type": "user_template"
    }).fetch();
  },
  getChildActions: function(){
    return Actions.find({
       "estate_id": Session.get('current_estate_doc')._id,
       "action_type": "child"
    }).fetch();
  },
  getActionLogo: function() {
    // console.log($(this));
    if(this.logo){
      // Check if the img URL links to images in the public folder
      if(this.logo.charAt(0) == "/") {
          return this.logo;
      }
      else { return "/cfs/files/images/"+ this.logo; }
    }
    return "";
  }


});


Template.actionsList.events({
    'click .newGenericActionBtn': function(e) {
        e.preventDefault();
        Session.set('newActionType', "generic");

        Router.go('action-form');
    },
    'click .newActionFromMaster': function(e) {
        e.preventDefault();
        if (!e.target.classList.contains("itemMenu") && !e.target.firstChild.classList.contains("itemMenu") ){ // Don't trigger these events if the pressed button was an itemMenu
          // Could be improved as the child element does not always exist
          Session.set('newActionType', "user_template");
          Session.set('masterAction', this);

          Router.go('action-form');
        }
    },
    'click .newUserTempalteAction': function(e) {
        e.preventDefault();
        Session.set('newActionType', "user_template");

        Router.go('action-form');
    },
    'click .editAction': function(e) { //Sends to the Action form for updating
        e.preventDefault();
        Session.set('updateAction', this);
        Router.go('action-form');
    },
    'click .dropdownBtn': function(e) {
        // e.preventDefault(); // Prevent other events
    },
});
