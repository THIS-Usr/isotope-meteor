// if the database is empty on server start, create some sample data.
//I mess here
Meteor.startup(function () {
  if (Lists.find().count() === 0) {
    var data = [
      {name: "Meteor Principles",
       contents: [
         ["Data on the Wire", "Simplicity", "Better UX", "Fun"],
         ["One Language", "Simplicity", "Fun"],
         ["Database Everywhere", "Simplicity"],
         ["Latency Compensation", "Better UX"],
         ["Full Stack Reactivity", "Better UX", "Fun"],
         ["Embrace the Ecosystem", "Fun"],
         ["Simplicity Equals Productivity", "Simplicity", "Fun"]
       ],
       classification: [
         ["metal"]               
                        ],
       attributes: [
         ["property1"],
         ["property2"]
                    ],
      url: [
         ["url1"],
         ["url2"]
                   ],
       namespace: [
         ["uri1"],
         ["uri2"]
                  ]
      },
      {name: "Languages",
       contents: [
         ["Lisp", "GC"],
         ["C", "Linked"],
         ["C++", "Objects", "Linked"],
         ["Python", "GC", "Objects"],
         ["Ruby", "GC", "Objects"],
         ["JavaScript", "GC", "Objects"],
         ["Scala", "GC", "Objects"],
         ["Erlang", "GC"],
         ["6502 Assembly", "Linked"]
         ],
         classification: [
          ["metal"]               
                         ],
        attributes: [
          ["property1"],
          ["property2"]
                     ],
       url: [
          ["url1"],
          ["url2"]
                    ],
        namespace: [
          ["uri1"],
          ["uri2"]
                   ]
      },
      {name: "Favorite Scientists",
       contents: [
         ["Ada Lovelace", "Computer Science"],
         ["Grace Hopper", "Computer Science"],
         ["Marie Curie", "Physics", "Chemistry"],
         ["Carl Friedrich Gauss", "Math", "Physics"],
         ["Nikola Tesla", "Physics"],
         ["Claude Shannon", "Math", "Computer Science"]
       ],
       classification: [
            ["metal"]               
                           ],
	   attributes: [
	        ["property1"],
	        ["property2"]
	                   ],
	   url: [
	        ["url1"],
	        ["url2"]
	                  ],
	   namespace: [
	        ["uri1"],
	        ["uri2"]
                     ]
      }
    ];

    var timestamp = (new Date()).getTime();
    for (var i = 0; i < data.length; i++) {
      var list_id = Lists.insert({name: data[i].name});
      for (var j = 0; j < data[i].contents.length; j++) {
        var info = data[i].contents[j];
        if(j < data[i].contents.length){
        var cclass = data[i].classification[j];
        //var attributes = data[i].attributes[j];
        //var urls = data[i].url[j];
        //var uris = data[i].uri[j];
        };
        Todos.insert({list_id: list_id,
                      text: info[0], // atom
                      timestamp: timestamp,
                      tags: info.slice(1),
                      type: cclass//,
                      //property: attributes,
                      //url: urls,
                      //ns: uris
                      });
        timestamp += 1; // ensure unique timestamp.
      }
    }
  }
});
