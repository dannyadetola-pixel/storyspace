// scripts/demo-data.mjs
// Demo content for StorySpace. Edit the stories here; the seeding script reads them.
// Every demo account's username starts with "demo_", so the seeder only removes its own data.

export const PREFIX = "demo_";
export const DOMAIN = "demo.storyspace.local";
export const PASSWORD = "demo-password-123";
export const FREE_CHAPTERS = 2; // each book's first two chapters are free
export const LOCKED_PRICE_KOBO = 50000; // ₦500 for the rest

export const creators = [
  { username: "demo_ada", name: "Ada Mensah", bio: "Slow-burn romance and small-town stories.", verified: true },
  { username: "demo_tunde", name: "Tunde Bello", bio: "Fantasy, thrillers and sea adventures.", verified: false },
  { username: "demo_zara", name: "Zara Lewis", bio: "Literary fiction, photography and everyday life.", verified: true },
  { username: "demo_kofi", name: "Kofi Asante", bio: "Science fiction and things that go bump in the night.", verified: false },
  { username: "demo_nia", name: "Nia Okonjo", bio: "Mysteries and family drama.", verified: true },
];

export const readers = Array.from({ length: 10 }, (_, i) => ({
  username: `demo_reader${i + 1}`,
  name: `Demo Reader ${i + 1}`,
  bio: "",
  verified: false,
}));

export const books = [
  {
    owner: "demo_ada",
    title: "The Quiet Harbour",
    genre: "Romance",
    description: "When a marine biologist returns to her coastal hometown, an old rivalry becomes something she didn't plan for.",
    cover: "/hero/2.jpg",
    tags: ["romance", "small-town", "slow-burn"],
    chapters: [
      {
        title: "The Return",
        paragraphs: [
          "The ferry was late again, so Nia walked the last mile with her bag over one shoulder. The harbour looked smaller than she remembered, but the smell of salt and diesel had not changed at all.",
          "Her father's house still stood at the top of the hill, its shutters painted the same faded blue. She waited at the gate for a long moment before she lifted the latch.",
        ],
      },
      {
        title: "Low Tide",
        paragraphs: [
          "Mr. Owusu still ran the fish market, and he still greeted her by the name she had used as a child. She bought mackerel she did not need, just to hear him say it.",
          "Across the water, a figure was mending a net on the old pier. She knew the set of those shoulders before she could make out a face.",
        ],
      },
      {
        title: "The Letter",
        paragraphs: [
          "The letter arrived three weeks after the funeral, with no return address. Inside was one line about the lighthouse, and the words beneath had been crossed out so hard the paper tore.",
          "She folded it back into its envelope. Tomorrow she would walk out to the lighthouse and find out who had written it.",
        ],
      },
      {
        title: "Salt and Rope",
        paragraphs: [
          "The lighthouse door was unlocked, which should not have surprised her in a town where nobody locked anything. Inside, a lamp was burning on the stairs.",
          "At the top, Daniel was waiting with two mugs of tea, as if he had known she would come and had decided not to be surprised by it.",
        ],
      },
    ],
  },
  {
    owner: "demo_tunde",
    title: "Ashes of the Iron Crown",
    genre: "Fantasy",
    description: "Nine years after the gates closed, a disgraced guard is asked to swear an oath that will cost him his name.",
    cover: "/hero/3.jpg",
    tags: ["fantasy", "epic", "political"],
    chapters: [
      {
        title: "The Gate",
        paragraphs: [
          "The city gates had not opened in nine years, and the guards on the walls were older than the boys who had once dared to climb them. Kael watched from the shadow of the aqueduct, counting torches.",
          "He carried his grandmother's sword and a map missing its final third. Neither was enough, but he had stopped expecting enough a long time ago.",
        ],
      },
      {
        title: "The Oath",
        paragraphs: [
          "The council met in the drowned chapel, where the water rose to the altar steps. Nobody spoke until the oldest member lit a single candle and set it floating in the basin.",
          "Kael was asked to swear on the iron crown itself, and he understood at once that the oath would cost him his name.",
        ],
      },
      {
        title: "Blood on the Stairs",
        paragraphs: [
          "The stairs were slick, and the torches guttered in the draught from the broken windows. Kael heard the first shout below and pressed his back to the cold stone.",
          "Someone had already been killed here. The blood on the third step was still warm when he touched it.",
        ],
      },
      {
        title: "The Road North",
        paragraphs: [
          "They rode out before dawn, five riders and a cart of grain that nobody would admit to paying for. The road north was empty, and the villages along it had shuttered their windows.",
          "At the first ford, a girl of perhaps twelve stood alone in the water, holding a lantern. She said Kael's name before he had given it to anyone.",
        ],
      },
      {
        title: "The Crown Remembers",
        paragraphs: [
          "The crown was heavier than it looked, and it seemed to grow heavier the closer they came to the mountain. Kael began to hear voices in it, soft and patient, like a rumour told twice.",
          "They told him where the last king had hidden his heir. They also told him what the heir had become, and why nobody had dared to say it aloud.",
        ],
      },
      {
        title: "The Name",
        paragraphs: [
          "At the summit the wind stopped completely. Kael unbuckled the sword and laid it on the stone, and the crown went still in his hands.",
          "He spoke his name for the first time in nine years, and the mountain answered in the voice of his grandmother, telling him to go home.",
        ],
      },
    ],
  },
  {
    owner: "demo_zara",
    title: "Negatives",
    genre: "Literary Fiction",
    description: "A photographer rediscovers her grandfather's darkroom, and the pictures inside it tell a story she never knew.",
    cover: "/hero/1.jpg",
    tags: ["photography", "family", "literary"],
    chapters: [
      {
        title: "Developing",
        paragraphs: [
          "The darkroom had been her grandfather's, and it still smelled of stop bath and old paper. Lena switched on the red safelight and slid the first negative into the tray.",
          "The image came up slowly, the way it always did: a shape first, then a face, then the small wrinkle of a smile she had forgotten she'd captured.",
        ],
      },
      {
        title: "The Exhibit",
        paragraphs: [
          "The gallery on Marsh Street had agreed to show twelve prints, on the condition that she would stand beside them for the opening. Lena spent the morning choosing frames and cursing the cheap hooks.",
          "Her oldest print hung in the middle of the wall, the one of her mother asleep on the train. Nobody else had noticed it yet, and she was glad.",
        ],
      },
      {
        title: "Overexposed",
        paragraphs: [
          "The roll had been left in the car for a week, and every frame came out washed to white. Lena held the strip to the window and tried to decide whether it was ruined or simply finished.",
          "Then she saw the frame near the end, where the light had burned through just enough to show a hand reaching for hers.",
        ],
      },
      {
        title: "Contact Sheet",
        paragraphs: [
          "She laid the whole roll out on the table and studied it under the magnifier, frame by frame, the way her grandfather had taught her. The story was there, scattered across thirty-six small squares.",
          "In every picture, someone was standing just outside the frame, and in every picture, the same woman was looking straight at the camera.",
        ],
      },
    ],
  },
  {
    owner: "demo_kofi",
    title: "Second Season",
    genre: "Romance",
    description: "A backup goalkeeper and the new team physiotherapist discover that the hardest match of their lives happens off the pitch.",
    cover: "/hero/4.jpg",
    tags: ["sports", "romance", "friends-to-lovers"],
    chapters: [
      {
        title: "Pre-season",
        paragraphs: [
          "Eli had been the team's backup goalkeeper for three seasons, which meant he spent most matches watching from the bench. He liked it that way, mostly.",
          "Then the new physiotherapist arrived, and suddenly the bench felt a great deal less comfortable.",
        ],
      },
      {
        title: "First Session",
        paragraphs: [
          "Maya did not believe in motivational speeches. She believed in stretching, and she made Eli hold every position until his legs shook.",
          "By the end of the hour he was furious, sore, and laughing, which annoyed him more than the stretching did.",
        ],
      },
      {
        title: "Away Game",
        paragraphs: [
          "The bus to the coast was long, and the seat beside Maya was the only one left. Eli pretended to read his phone and watched her sleep instead.",
          "When she woke, she caught him looking. Neither of them mentioned it for the next two hundred miles.",
        ],
      },
      {
        title: "Injury Time",
        paragraphs: [
          "In the final minute, Eli took a knock that bent his wrist the wrong way. Maya was on the pitch before the referee blew the whistle.",
          "She did not say a word while she worked. She only held his hand a little longer than the treatment needed.",
        ],
      },
      {
        title: "Second Season",
        paragraphs: [
          "The new season began with fresh kits and new faces, but Eli arrived early every morning, just in case Maya was already there.",
          "She was. She always was, with two coffees and a clipboard, and this time she asked him to stay for breakfast.",
        ],
      },
    ],
  },
  {
    owner: "demo_nia",
    title: "The Glass Orchard",
    genre: "Mystery",
    description: "A detective returns to a sealed orchard where nine children once posed for a photograph, and one of them was her grandmother.",
    cover: "/hero/5.jpg",
    tags: ["mystery", "small-town", "family-secrets"],
    chapters: [
      {
        title: "The Greenhouse",
        paragraphs: [
          "The orchard at Halden House had been locked for eleven years, and nobody in the village would say why. Detective Ruth Adeyemi noticed that the glass panes were cracked in one neat line, as if something had passed through them on purpose.",
          "The caretaker's cottage was empty, but someone had set a teacup on the windowsill and left it there to go cold.",
        ],
      },
      {
        title: "Records",
        paragraphs: [
          "The county archive kept a register of every orchard sale for a hundred years. Ruth found Halden House listed three times, always under a different owner's name.",
          "The last name had been crossed out in pencil, and written beneath it, in the same hand, was the word 'replant'.",
        ],
      },
      {
        title: "The Gardener",
        paragraphs: [
          "Old Jonah had tended the orchard as a boy, and he remembered the night the trees were cut down. He spoke slowly, choosing each word as if it might break.",
          "'They were never meant to bear fruit,' he said. 'They were meant to hide something under the roots.'",
        ],
      },
      {
        title: "Under the Roots",
        paragraphs: [
          "The digging took two days and a borrowed excavator. On the second afternoon the bucket struck metal, and the whole crew fell silent at once.",
          "The box inside was small, its lid sealed with wax. Ruth did not open it. She called the station and waited, her hands shaking.",
        ],
      },
      {
        title: "The Photograph",
        paragraphs: [
          "The box held ledgers, a set of keys, and a photograph of nine children standing in front of the orchard gate. Ruth recognised one face in the centre.",
          "It was her own grandmother, twelve years old and not smiling. On the back, someone had written her name with a question mark.",
        ],
      },
      {
        title: "Replanting",
        paragraphs: [
          "Ruth went back to the orchard in spring, when the new saplings had leaves. She stood among them for a long time without speaking.",
          "Jonah was already there, watering the roots. 'You're late,' he said, not unkindly. 'We've been waiting for you to ask the right question.'",
        ],
      },
    ],
  },
  {
    owner: "demo_tunde",
    title: "Midnight Ferry",
    genre: "Thriller",
    description: "A sergeant boards the last ferry of the night to find a witness, and finds that one of the passengers has been hiding in plain sight.",
    cover: "/hero/6.jpg",
    tags: ["thriller", "crime", "twist"],
    chapters: [
      {
        title: "Last Crossing",
        paragraphs: [
          "The midnight ferry left the mainland with eleven passengers and one locked cabin. Sergeant Obi Okafor had boarded because a witness had told him to, and he had not yet decided whether to trust the witness.",
          "The engine hummed low under the deck. Somewhere forward, a woman laughed too loudly at a joke nobody else had heard.",
        ],
      },
      {
        title: "The Cabin",
        paragraphs: [
          "The cabin key was missing from the purser's board. When Obi finally forced the door, the bunk was made up neatly and the window was open to the cold air.",
          "On the pillow lay a single playing card, the queen of salt, and beneath it a note with a time written on it: 2:14.",
        ],
      },
      {
        title: "Manifest",
        paragraphs: [
          "Eleven names on the manifest, and only ten faces he could match. The eleventh had boarded at the last moment and paid in cash.",
          "Obi checked the security footage. The man had walked straight through the crowd without once looking at a camera.",
        ],
      },
      {
        title: "Two-Fourteen",
        paragraphs: [
          "At 2:14 the lights flickered across the entire lower deck. In the dark, someone brushed past Obi, close enough to leave a trace of lemon and smoke.",
          "When the lights came back, the woman who had laughed earlier was gone, and the rail on the port side was wet.",
        ],
      },
      {
        title: "Harbour Lights",
        paragraphs: [
          "Dawn came up grey over the harbour. Obi stood at the gangway and watched the passengers disembark one by one, searching for the missing face.",
          "He found it at last: the eleventh passenger, now wearing the purser's jacket and carrying the woman's bag.",
        ],
      },
    ],
  },
  {
    owner: "demo_nia",
    title: "Letters to Lagos",
    genre: "Drama",
    description: "A young man writes home from the city, and the letters his mother sends back say more than she intends.",
    cover: "/hero/7.jpg",
    tags: ["family", "letters", "coming-of-age"],
    chapters: [
      {
        title: "First Letter",
        paragraphs: [
          "Dear Mama, the flat is smaller than the photos suggested, but the window faces east, so the mornings are bright enough to make up for it.",
          "I have found work at the bookshop on Tinubu Street. They pay in cash and let me take home any book I haven't finished.",
        ],
      },
      {
        title: "Second Letter",
        paragraphs: [
          "Dear Mama, I know you asked me to come home for the holidays. I wanted to, but the trains were full and the money was not enough.",
          "Tell Papa the garden is safe. I think of it often, especially the mango tree he planted the year I was born.",
        ],
      },
      {
        title: "Reply",
        paragraphs: [
          "Dear Chidi, your letter arrived on a Tuesday, and I read it three times before I could tell your father. He pretended not to be moved, which is how he always shows it.",
          "Come home when you can. The garden has grown wild without you, but the tree is still standing, and so are we.",
        ],
      },
    ],
  },
  {
    owner: "demo_kofi",
    title: "The Last Signal",
    genre: "Science Fiction",
    description: "A starship crew receives a repeating signal from deep space, and the reply they send back changes everything they thought they knew.",
    cover: "/hero/8.jpg",
    tags: ["sci-fi", "space", "first-contact"],
    chapters: [
      {
        title: "Static",
        paragraphs: [
          "The signal arrived at 04:12 ship time, a repeating sequence of prime numbers that no one aboard the Meridian had programmed. Captain Ife Balogun woke to the alarm and read the numbers twice before she believed them.",
          "The crew gathered on the observation deck, their faces lit by the faint blue of the distant star they were orbiting.",
        ],
      },
      {
        title: "Decoding",
        paragraphs: [
          "Lio, the ship's engineer, spent the night matching the pattern against every catalogue they carried. Nothing fit, until she tried the sequence as coordinates.",
          "The answer was a point in empty space, twelve light-hours away, and it was moving toward them.",
        ],
      },
      {
        title: "The Vote",
        paragraphs: [
          "The crew argued for six hours. Some wanted to turn back, and some wanted to answer. Ife listened to every voice before she spoke.",
          "'We came out here to find out whether we were alone,' she said. 'I think we're about to find out.'",
        ],
      },
      {
        title: "Crossing",
        paragraphs: [
          "The Meridian's engines burned for nine days. Ife spent most of them in the navigation room, watching the moving point grow from a dot into a shape.",
          "On the seventh day the shape turned, and every instrument on the bridge went quiet at once.",
        ],
      },
      {
        title: "Contact",
        paragraphs: [
          "The object was not a ship. It was a lattice of thin filaments, arranged like the rungs of a ladder, and every rung was pulsing with the same prime sequence.",
          "Lio reached out to touch the display, and the sequence stopped. In its place a new pattern began, shorter this time and clearly a reply.",
        ],
      },
      {
        title: "Reply",
        paragraphs: [
          "The crew spent the next week learning the new signal, one symbol at a time. Each word brought a new question, and each answer led to another.",
          "On the last night, Ife sent the Meridian's own sequence back into the dark. Somewhere far off, something answered, and the ship's clocks began to count again.",
        ],
      },
    ],
  },
  {
    owner: "demo_zara",
    title: "Kitchen Table Stories",
    genre: "Slice of Life",
    description: "Every Sunday, one family gathers around the same scratched table, and every week someone has a story they have been waiting to tell.",
    cover: "/hero/1.jpg",
    tags: ["family", "food", "everyday"],
    chapters: [
      {
        title: "Sunday",
        paragraphs: [
          "Every Sunday the Adeyemi family ate at the same scratched table, under the same yellow light, while the kettle complained on the stove.",
          "Mama insisted on cooking for twelve, even when only five of them were home. The leftovers went to the neighbours, and nobody ever argued.",
        ],
      },
      {
        title: "The Recipe Book",
        paragraphs: [
          "Grandma's recipe book had no measurements, only notes in the margins: 'enough salt', 'a little more heat', 'until it smells right'.",
          "Ada tried to write them down properly one afternoon and gave up after three pages. Some things, she decided, were only learned by standing beside someone.",
        ],
      },
      {
        title: "Argument",
        paragraphs: [
          "The argument started over the jollof, which had turned out slightly burnt, and quickly became about everything else. Dad blamed the stove. Tomi blamed the stove and Dad.",
          "Eventually Mama laughed, and the whole table went quiet, because nobody had heard her laugh like that in months.",
        ],
      },
      {
        title: "Clearing Up",
        paragraphs: [
          "After dinner the children washed the dishes and the adults cleared the table, which was the only rule that had never changed. The window steamed up slowly.",
          "Ada dried the last plate and noticed her grandmother's handwriting on the inside of the cupboard door: a shopping list from a year nobody could quite remember.",
        ],
      },
    ],
  },
  {
    owner: "demo_tunde",
    title: "The Salt Road",
    genre: "Adventure",
    description: "A caravan crosses a desert on a road that no longer appears on any map, and the people waiting at the far end have been expecting it for years.",
    cover: "/hero/2.jpg",
    tags: ["adventure", "desert", "journey"],
    chapters: [
      {
        title: "Departure",
        paragraphs: [
          "The caravan left the coast before sunrise: twelve camels and a dozen men who had agreed to take the old salt road. Dayo rode at the back, where the dust was thickest.",
          "Nobody had told him why they were going, only that the price was good and the road was closed to everyone else.",
        ],
      },
      {
        title: "The Well",
        paragraphs: [
          "On the third day the water ran low, and the leader turned the caravan towards a well marked on no map Dayo had ever seen.",
          "The rope was new, and someone had hung a clay jar beside the bucket, with a message scratched into its base: 'Take only what you need.'",
        ],
      },
      {
        title: "Sandstorm",
        paragraphs: [
          "The storm came from the east in a wall of gold. The men tied scarves over their faces and pressed the animals into a tight circle.",
          "When it passed, the path ahead had moved, and a line of stones led off to the south, too straight to have been made by wind.",
        ],
      },
      {
        title: "Stone Line",
        paragraphs: [
          "The stones ended at the mouth of a canyon, and the canyon opened onto a valley where green things grew. Dayo had not known such a place existed.",
          "An old man was waiting at the edge of the fields, leaning on a staff and smiling as though he had been expecting them for years.",
        ],
      },
      {
        title: "Return",
        paragraphs: [
          "They stayed for a month, trading salt for grain and learning the names of the people who lived there. When the time came to leave, nobody wanted to go.",
          "Dayo promised to return with the next caravan. The old man only nodded and said, 'The road will still be here, but you may not be the same.'",
        ],
      },
    ],
  },
  {
    owner: "demo_ada",
    title: "Borrowed Time",
    genre: "Romance",
    description: "A library book comes back with a train ticket inside it, and the reader has a week to find out who left it there.",
    cover: "/hero/3.jpg",
    tags: ["romance", "library", "mystery-lite"],
    chapters: [
      {
        title: "Overdue",
        paragraphs: [
          "The library book was three weeks overdue, and Ife had been ignoring the letters for two of them. The last one had a handwritten note asking her to come in and talk.",
          "She went on Saturday, expecting a fine. Instead she found the librarian behind the desk with a stack of returned books and a look of mild amusement.",
        ],
      },
      {
        title: "The Other Name",
        paragraphs: [
          "The book had been returned by someone else, under Ife's own card, with a bookmark halfway through a chapter. The bookmark was a train ticket for a journey she had never taken.",
          "Her name was written on the ticket in handwriting she did not recognise, and beneath it were the words 'same time next week'.",
        ],
      },
      {
        title: "Next Week",
        paragraphs: [
          "She came back the following Saturday, half hoping and half dreading. The library was quiet, and the chair by the window was already taken by a man reading a worn copy of the same book.",
          "He looked up, closed the book, and smiled. 'You're late,' he said. 'I was starting to think I had the wrong week.'",
        ],
      },
    ],
  },
  {
    owner: "demo_kofi",
    title: "Hollow Bells",
    genre: "Horror",
    description: "A village with one bell tower goes silent for forty years, until a newcomer climbs the tower and answers the bell.",
    cover: "/hero/4.jpg",
    tags: ["horror", "village", "supernatural"],
    chapters: [
      {
        title: "The Village",
        paragraphs: [
          "Ashford had one church, one shop, and a bell tower that had not rung in forty years. Mara arrived in late October, when the fog came down so thick the car lights barely reached the hedges.",
          "The landlady offered her a room above the shop and a warning: do not answer the bell if it rings after dark.",
        ],
      },
      {
        title: "The Silence",
        paragraphs: [
          "The bell stayed silent all week, and Mara began to think the landlady was simply eccentric. The children did not play in the square, and the adults looked at the tower as they passed.",
          "On the seventh night she heard the first chime, faint and far away, from a bell that should have rusted solid.",
        ],
      },
      {
        title: "The Register",
        paragraphs: [
          "The parish register went back three centuries. Every entry listed a birth, a marriage, or a death, except for the last page, which held a single name repeated in careful ink.",
          "The name was her own.",
        ],
      },
      {
        title: "The Tower",
        paragraphs: [
          "Mara climbed the tower stairs in the dark, counting each step to keep her thoughts steady. At the top the bell hung still, its rope coiled neatly on the floor.",
          "Someone had tied a ribbon to the rope. It was the same green as the ribbon her mother had worn the day she left home.",
        ],
      },
      {
        title: "The Chime",
        paragraphs: [
          "The bell rang once, and the fog outside turned from grey to white. Through the window Mara saw the village rise out of the ground, its houses standing where the fields had been.",
          "The people in the square were waiting for her, and every one of them was wearing her face.",
        ],
      },
      {
        title: "Answering",
        paragraphs: [
          "She could have walked away. Instead she took hold of the rope and pulled, and the sound that followed was not a bell at all, but a voice calling her by name.",
          "The village went quiet, and for the first time in forty years, Ashford woke up.",
        ],
      },
    ],
  },
  {
    owner: "demo_nia",
    title: "The Name in the Margin",
    genre: "Mystery",
    description: "A secondhand novel is full of pencilled notes that point to a woman who vanished twelve years ago.",
    cover: "/hero/5.jpg",
    tags: ["mystery", "books", "missing-person"],
    chapters: [
      {
        title: "The Book Sale",
        paragraphs: [
          "Tolu bought the battered novel for fifty naira at a church sale, mainly for the cover. Inside, someone had written in pencil in the margins of every chapter.",
          "The notes were not literary. They were directions, times, and a single name that appeared on every page: Gbemi.",
        ],
      },
      {
        title: "Gbemi",
        paragraphs: [
          "The name belonged to a girl who had vanished from the university twelve years earlier. Tolu found her photograph in an old student newspaper, smiling in front of the library.",
          "The notes stopped on the final page, with an address in the corner and a line beneath it: 'If you're reading this, come find me.'",
        ],
      },
      {
        title: "The Address",
        paragraphs: [
          "The address was a flat above a closed laundry in the old market. Tolu knocked for ten minutes before a neighbour leaned out and told her to try the back stairs.",
          "The door was unlocked. On the table inside, a pencil lay beside a fresh copy of the same novel, open to the first page.",
        ],
      },
      {
        title: "Margins",
        paragraphs: [
          "The margins in the second copy were full of new notes, dated last week, in the same careful hand. Tolu realised Gbemi had been writing to her all along.",
          "The last note read simply: 'You came. Now read the chapter you skipped.'",
        ],
      },
    ],
  },
  {
    owner: "demo_zara",
    title: "Small Hours",
    genre: "Short Fiction",
    description: "A night-shift baker, a city that never sleeps, and the stories people tell only when the rest of the world is asleep.",
    cover: "/hero/6.jpg",
    tags: ["short-stories", "city", "night"],
    chapters: [
      {
        title: "Insomnia",
        paragraphs: [
          "At three in the morning the city sounded like a room somebody had left running. Hana made tea she would not drink and stood at the window until the streetlights blurred.",
          "She wrote the first line of a story on the back of a receipt, then folded it into her pocket and went back to bed.",
        ],
      },
      {
        title: "Night Shift",
        paragraphs: [
          "The bakery on the corner opened at four, and the first customers were always the same: a taxi driver, a nurse, and a man who never gave his name.",
          "Hana loved them for their quiet. In the small hours people stopped pretending, and sometimes they told her things they would never tell in daylight.",
        ],
      },
      {
        title: "Morning",
        paragraphs: [
          "By six the sky had turned the colour of weak milk. Hana walked home past the empty square, the receipt still in her pocket, the story finished at last.",
          "She did not read it again. She simply left it on the kitchen table, where the morning light would find it first.",
        ],
      },
    ],
  },
];

// Eight photo posts. The seeder gives each one a different age, so the feed row
// has an order.
export const postData = [
  { owner: "demo_zara", image: "/hero/1.jpg", caption: "Morning light on the shelves." },
  { owner: "demo_ada", image: "/hero/2.jpg", caption: "Chapter one is done. Thank you for the early reads." },
  { owner: "demo_tunde", image: "/hero/4.jpg", caption: "Writing the next chapter at the kitchen table." },
  { owner: "demo_nia", image: "/hero/5.jpg", caption: "Forty likes in one afternoon. Thank you, all of you." },
  { owner: "demo_kofi", image: "/hero/6.jpg", caption: "Reading on the commute, one chapter at a time." },
  { owner: "demo_tunde", image: "/hero/7.jpg", caption: "New cover art for The Salt Road." },
  { owner: "demo_zara", image: "/hero/3.jpg", caption: "Quiet afternoon with a good book." },
  { owner: "demo_ada", image: "/hero/8.jpg", caption: "Support the writers you love." },
];
