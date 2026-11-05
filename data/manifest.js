/* Register a new set: add "set-N" to a topic's list, then create data/<slug>/set-N.js */
const BANK=[["english","English",[]],["ancient-history","Ancient History",["set-1"]],["medieval-history","Medieval History",[]],
["modern-history","Modern History",[]],["national-movement","Indian National Movement",[]],["indian-geography","Indian Geography",[]],
["world-geography","World & Physical Geography",[]],["arts-culture","Arts & Culture",[]],["west-bengal","West Bengal Specific",[]],
["polity","Indian Polity",["set-1"]],["economy","Indian Economy",[]],["physics","Physics",[]],["chemistry","Chemistry",[]],
["biology","Biology",[]],["environment","Environmental Studies",[]],["static-gk","Static GK",[]],["current-affairs","Current Affairs",[]],
["gma","General Mental Ability",[]]].map(([slug,name,sets])=>({slug,name,sets}));
const MOCK_COUNT=5; // numbered mocks shown (Mock 1..N)
const MOCK_PATTERN={totalMinutes:180,mpq:1,negative:0.25, // negative = fraction of a mark per wrong answer
 units:[
 {name:"English",total:25,from:{"english":25}},
 {name:"Science",total:25,from:{"physics":6,"chemistry":6,"biology":8,"environment":5}},
 {name:"Polity & Economy",total:25,from:{"polity":13,"economy":12}},
 {name:"History",total:25,from:{"ancient-history":6,"medieval-history":7,"modern-history":12}},
 {name:"Geography",total:25,from:{"indian-geography":9,"world-geography":8,"west-bengal":8}},
 {name:"National Movement & Arts",total:25,from:{"national-movement":15,"arts-culture":10}},
 {name:"Current Affairs & Static GK",total:25,from:{"current-affairs":15,"static-gk":10}},
 {name:"General Mental Ability",total:25,from:{"gma":25}}]};
