// On Template rendered: make sure we display the Portfolios
Template.observatory.rendered = function () {
    Session.set('portfolio_level', true);

};

// Get list of all Portfolios for current Estate, sorted by alpha (on name)
Template.observatory.helpers({
    getPortfolioList: function(){

        var curr_est_doc = Estates.findOne(Session.get('current_estate_doc')._id)

        // only return smthg if Session.get('current_estate_doc') has a value
        if (curr_est_doc !== undefined && curr_est_doc.hasOwnProperty("portfolio_collection") ) {
            //console.log("I display current Portfolios");
            var result = Portfolios.find({_id: {$in : curr_est_doc.portfolio_collection} },
                    {sort: {name:1}}
                    ).fetch();
            console.log(result);
            return result;
        };
    },
    getBuildingList: function(){
        if ( Session.get('portfolio_level') !== undefined && !Session.get('portfolio_level') ) {
            return Buildings.find({portfolio_id: Session.get('current_portfolio_doc')._id },
                        {sort: {name:1}}
                        ).fetch();
        }
    },
    current_item: function(){
        if ( Session.get('portfolio_level') !== undefined && Session.get('portfolio_level') ) {
            //var curr_est_doc = Session.get('current_estate_doc');
            var curr_est_doc = Estates.findOne(Session.get('current_estate_doc')._id)

            // console.log(Portfolios.find().fetch().length);

            // only return smthg if Session.get('current_estate_doc') has a value
            if (curr_est_doc !== undefined && curr_est_doc.hasOwnProperty("portfolio_collection") ) {
                console.log("I display current Portfolios");
                var result = Portfolios.find({_id: {$in : curr_est_doc.portfolio_collection} },
                        {sort: {name:1}}
                        ).fetch();
                console.log(result);
                return result;
            };
        };
        if ( Session.get('portfolio_level') !== undefined && !Session.get('portfolio_level') ) {
            return Buildings.find({portfolio_id: Session.get('current_portfolio_doc')._id },
                        {sort: {name:1}}
                        ).fetch();
        }
    },
    displayName: function(){
        if ( Session.get('portfolio_level') !== undefined && Session.get('portfolio_level') ) {
            return this.name ;
        }
        if ( Session.get('portfolio_level') !== undefined && !Session.get('portfolio_level') ) {
            return this.building_name ;
        }
    },
    isBuilding: function(){
        if ( Session.get('portfolio_level') !== undefined && Session.get('portfolio_level') ) {
            return false ;
        }
        if ( Session.get('portfolio_level') !== undefined && !Session.get('portfolio_level') ) {
            return true ;
        }
    }
});

Template.observatory.events({
    'click .select_portfolio': function() {
        Session.set('current_portfolio_doc', this); // "this" is passed by Meteor - it's the current item

        // console.log("current Portfolio is: ");
        // console.log(this);

        //Session.set('portfolio_level', false);

        $( "#portfolio_list" ).fadeOut("fast", function() {
            Session.set('portfolio_level', false);
            $( "#building_list" ).fadeIn();
        });

        // Meteor.subscribe('configurations', this._id);
        // console.log('INSERT - update_estate_var is now: ' +  Session.get('update_estate_var'));
    },
    'click .back2portfolios': function() {
        Session.set('portfolio_level', true);

        $( "#building_list" ).fadeOut("fast", function() {
            Session.set('portfolio_level', true);
            $( "#portfolio_list" ).fadeIn();
        });
    },
    'click .select_building': function(e) {
        e.preventDefault();
        Session.set('current_building_doc', this); // "this" is passed by Meteor - it's the current item

        console.log("current Building is: ");
        console.log(this);

        Router.go('buildingDetail', this);
        // Router.go('/user');

        // $( "#portfolio_list" ).fadeOut("fast", function() {
        //     Session.set('portfolio_level', false);
        //     $( "#building_list" ).fadeIn();
        // });

    },

});
