// if the database is empty on server start, create some sample data.
Meteor.startup(function () {
	if (Meteor.users.find().count() === 0) {
		console.log("creating user test");
    var testUser = Accounts.createUser({
      profile: {
        username: "test"
      },
      email: "test@test.com",
      password: "test"
    });

    var Admin = Accounts.createUser({
      profile:{
        username: "admin"
      },
      email: "admin@test.com",
      password: "admin"
    });

    Roles.addUsersToRoles(testUser, ['user']);
    Roles.addUsersToRoles(Admin, ['admin']);
	}
	if(Configurations.find().count() === 0) {
		var tmpConfig = {
        	master: true,
        	creation_date: new Date(),
        	indexes: [],
        	project_type_static_index: {
            	classic: 0,
            	cpe: 0,
            	cr: 0,
            	crem: 0,
            	ppp: 0,
            	cpi: 0,
        	},
        	fluids: [],
        	mailing_list: "eggre",
          yearly_values: [{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},{value: Math.floor(Math.random()*11)},]
		};
		Configurations.insert(tmpConfig);
		console.log('created master configuration');
	}
    if(Estates.find().count() === 0) {
        var tmpConfig = {
            estate_name: "77",
        };
        Estates.insert(tmpConfig);
        console.log('inserted estate 77');
    }
    if(Selectors.find().count() === 0) {
        var tmpSelectorList = [
                // selector: {name : 'control_full'}
                // devrait marcher, mais ne marche pas...
                // {
                //     name: 'building_control',
                //     labels: [
                //         {label : 'control_full'},
                //         {label : 'control_shared'} ]
                // }
                {
                    name: 'building_control',
                    labels: ['control_full', 'control_shared' ]
                },
                {
                    name: 'fluid_type',
                    labels: ["fluid_electricity", "fluid_water", "fluid_heat" ],
                    portfolio_id: ""
                },
                {
                    name: 'fluid_provider',
                    labels: ["EDF", "Poweo"],
                    portfolio_id: ""
                }];

        _.each(tmpSelectorList, function(item) {
            Selectors.insert(
                    item
                    // estate_id: item.estate_id
                );

            // var list_id = Lists.insert({name: list.name,
            //     incompleteCount: list.items.length});

            // _.each(list.items, function(text) {
            //     Todos.insert({listId: list_id,
            //                   text: text,
            //                   createdAt: new Date(timestamp)});
            //     timestamp += 1; // ensure unique timestamp.
            //   });
        });

        console.log('created first Selector list - 2 items!');

    }

  if (Lists.find().count() === 0) {
    var data = [
      {name: "Meteor Principles",
       items: ["Data on the Wire",
         "One Language",
         "Database Everywhere",
         "Latency Compensation",
         "Full Stack Reactivity",
         "Embrace the Ecosystem",
         "Simplicity Equals Productivity"
       ]
      },
      {name: "Languages",
       items: ["Lisp",
         "C",
         "C++",
         "Python",
         "Ruby",
         "JavaScript",
         "Scala",
         "Erlang",
         "6502 Assembly"
         ]
      },
      {name: "Favorite Scientists",
       items: ["Ada Lovelace",
         "Grace Hopper",
         "Marie Curie",
         "Carl Friedrich Gauss",
         "Nikola Tesla",
         "Claude Shannon"
       ]
      }
    ];

    var timestamp = (new Date()).getTime();
    _.each(data, function(list) {
      var list_id = Lists.insert({name: list.name,
        incompleteCount: list.items.length});

      _.each(list.items, function(text) {
        Todos.insert({listId: list_id,
                      text: text,
                      createdAt: new Date(timestamp)});
        timestamp += 1; // ensure unique timestamp.
      });
    });
    Meteor.methods({
        addUser: function(user){
           return Accounts.createUser(user);
        },
        addRole: function(user, roles){
          return Roles.addUsersToRoles(Meteor.users.findOne({_id:user}), roles);
        }
  });
  }
});
