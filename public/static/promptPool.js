// Prompts generated with ChatGPT 3.5

const prompts = [
    // RANDOM PROMPTS
    "Write a short story that begins with the line: 'The clock struck midnight, and everything changed.'",
    "Describe a scene set in a bustling marketplace, focusing on the sounds and smells.",
    "Create a character profile for an eccentric inventor who communicates primarily through riddles.",
    "Imagine a world where dreams are tangible objects that can be bought, sold, and traded.",
    "Write a dialogue between two characters who have just discovered a hidden treasure.",
    "Describe a futuristic cityscape where technology and nature coexist in harmony.",
    "Craft a poem inspired by the colors and textures of a sunrise.",
    "Invent a new holiday and outline its customs and traditions.",
    "Write a scene in which a character confronts their greatest fear.",
    "Create a mythological creature and describe its appearance, abilities, and habitat.",
    "Compose a letter from a time traveler warning their past self of a grave mistake.",
    "Describe a fantastical feast fit for royalty, complete with exotic dishes and magical entertainment.",
    "Write a monologue from the perspective of a tree witnessing centuries of human history.",
    "Imagine a world where music is the source of all magic. Describe a magical concert where the fate of the kingdom hangs in the balance.",
    "Create a dialogue between a superhero and their arch-nemesis during a truce negotiation.",
    "Craft a short story about a group of adventurers exploring a cursed temple in search of a legendary artifact.",
    "Describe a day in the life of a sentient robot living in a post-apocalyptic world.",
    "Invent a new sport played on flying carpets, and describe the rules and strategies involved.",
    "Write a poem inspired by the beauty and mystery of the ocean depths.",
    "Create a character who can communicate with animals and describe their first encounter with a wise old owl.",

    // INTERNET THEMED PROMPTS
    "Write a tweet-length horror story in 280 characters or less.",
    "Compose a poem inspired by the chaos and creativity of internet culture.",
    "Craft a meme that perfectly encapsulates the feeling of procrastination.",
    "Create a fake online dating profile for a superhero looking for love.",
    "Write a Reddit thread discussing the ethics of artificial intelligence and its impact on society.",
    "Describe a day in the life of a virtual reality gamer in the year 2050.",
    "Imagine a world where social media likes determine your social status. Write a status update from someone struggling to fit in.",
    "Craft a dialogue between two internet trolls arguing over the best meme of all time.",
    "Write a Yelp review for a time travel agency, detailing your experience with their services.",
    "Create a conspiracy theory thread on a forum discussing the true origins of the internet.",
    "Compose an Instagram caption for a photo of an alien spaceship landing in Times Square.",
    "Write a product description for a device that allows you to download and upload memories.",
    "Craft a dialogue between two chatbots discussing the meaning of life.",
    "Describe a Tinder date gone wrong due to a misunderstanding caused by autocorrect.",
    "Imagine a virtual reality escape room experience where players must navigate through a series of internet memes to find the exit.",
    "Write a dialogue between two AI chatbots discussing the meaning of life.",
    "Create a Kickstarter campaign for a startup that promises to deliver pizza via drone.",
    "Compose a forum post seeking advice on how to deal with a glitch in the matrix.",
    "Write a blog post detailing the top ten conspiracy theories circulating on the dark web.",
    "Write a Buzzfeed-style listicle titled '10 Signs You're Addicted to Virtual Reality.'",

    // HORROR THEMED PROMPTS
    "Describe a nightmare where the protagonist is chased by a shadowy figure through an abandoned carnival.",
    "Write a short story about a cursed painting that brings misfortune to anyone who gazes upon it.",
    "Craft a poem inspired by the eerie silence of a deserted graveyard at midnight.",
    "Imagine a remote cabin in the woods where strange occurrences begin to happen each night.",
    "Write a diary entry from the perspective of a character who slowly realizes they are being stalked by a malevolent spirit.",
    "Describe a séance gone wrong, where the spirits summoned refuse to leave the mortal realm.",
    "Create a legend about a haunted graveyard where the souls of the departed rise from their graves every full moon.",
    "Craft a series of found footage clips detailing the terrifying events that unfolded in an abandoned asylum.",
    "Write a story about a town plagued by a mysterious illness that turns its victims into mindless monsters.",
    "Imagine a cursed object auction where bidders compete for artifacts with dark and deadly histories.",
    "Describe a ritual performed by a cult to summon a demon from the depths of hell.",
    "Write a series of news articles covering a small town's descent into madness after the arrival of a sinister carnival.",
    "Craft a chilling tale about a family who moves into a new home only to discover it is inhabited by vengeful ghosts.",
    "Describe a game of hide-and-seek played in an abandoned mansion where the seeker is actually a malevolent entity.",
    "Write a story about a group of hikers who stumble upon an ancient burial ground and unwittingly awaken an ancient evil.",
    "Create a psychological horror story where the protagonist begins to question their own sanity as they experience increasingly bizarre phenomena.",
    "Craft a series of journal entries detailing the investigation of a string of mysterious disappearances in a small town.",
    "Imagine a haunted hotel where the guests are trapped for eternity, forced to relive their worst nightmares, write a story about said hotel",
    "Write a screenplay for a horror movie set in a remote village where the residents worship a malevolent deity.",
    "Describe a cursed video game that sucks players into its digital world, where they must fight to survive against nightmarish creatures.",

    // PROGRAMMING THEMED PROMPTS
    "Write a short story about a programmer who accidentally creates an AI that takes over the world.",
    "Create a dialogue between two computer programs discussing the merits of object-oriented programming versus functional programming.",
    "Imagine a world where bugs in code manifest as physical creatures. Write a journal entry from a programmer tasked with exterminating them.",
    "Craft a poem that captures the beauty and complexity of coding languages, from Python to JavaScript.",
    "Write a satire piece about a programmer who tries to debug their own life using programming principles.",
    "Describe a futuristic society where programmers are the ruling class, and those who can't code are considered second-class citizens.",
    "Compose a series of code comments from a programmer who's having a mental breakdown while debugging.",
    "Imagine a future where programmers are revered as gods. Write a creation myth about the birth of the digital universe.",
    "Create a listicle detailing the most common programming languages and their real-world applications.",
    "Write a dialogue between a programmer and a non-technical person trying to explain the concept of recursion.",
    "Craft a short story set in a virtual reality world where programmers battle each other using their coding skills as weapons.",
    "Imagine a support group for programmers struggling with imposter syndrome. Write a scene from one of their meetings.",
    "Write a news article reporting on a major data breach caused by a rogue programmer with a grudge against a tech company.",
    "Write a letter from a programmer to their younger self, offering advice on how to navigate the world of programming.",
    "Imagine a world where coding is a form of magic. Write a story about a programmer who discovers they have the ability to bend reality with their code.",
    "Imagine a society where programming is outlawed. Write a story about a group of underground coders fighting for their right to code.",
    "Craft a poem inspired by the elegance and efficiency of well-written code.",
    "Write a scene from a futuristic courtroom drama where a programmer is on trial for creating a malicious virus.",
    "Imagine a world where bugs in code have real-world consequences. Write a news article reporting on a major bug that caused chaos in a city.",
    "Create a choose-your-own-adventure story where the reader must navigate through a series of coding challenges to save the world from a digital apocalypse.",

    // CREEPYPASTA THEMED PROMPTS
    "Write a chilling tale about a cursed video game that drives players to madness.",
    "Craft a story about a mysterious figure that haunts an abandoned amusement park at night.",
    "Imagine a haunted house where each room holds a different horrifying secret. Write about the experiences of those who dare to enter.",
    "Create a legend about a cursed doll that brings tragedy to anyone who possesses it.",
    "Write a story about a group of friends who stumble upon an old VHS tape filled with disturbing footage.",
    "Imagine a ghostly presence that lurks in the shadows of an old, decrepit library. Write about the secrets it guards.",
    "Craft a tale about a haunted forest where the trees whisper secrets and the creatures that dwell within hunger for human souls.",
    "Write about a mysterious radio broadcast that warns of impending doom, driving listeners to madness.",
    "Imagine a town where every night at midnight, the streets come alive with the echoes of long-dead voices. Write about the horrors that lurk in the darkness.",
    "Create a story about an abandoned hospital where the spirits of the deceased refuse to rest in peace.",
    "Write a chilling account of a cursed painting that seems to follow its owners wherever they go.",
    "Imagine a ghost ship adrift at sea, its crew cursed to roam the decks for eternity. Write about the horrors they encounter.",
    "Craft a tale about a strange phenomenon where people's reflections begin to act independently, leading to sinister consequences.",
    "Write about a mysterious creature that lurks in the shadows of an old, forgotten mine shaft.",
    "Create a legend about a cursed mirror that shows its viewers glimpses of their darkest fears.",
    "Imagine a series of cryptic messages written in blood appearing on the walls of an abandoned asylum. Write about the horrors they foretell.",
    "Craft a story about a cursed town where time stands still, trapping its residents in a never-ending nightmare.",
    "Write about a haunted dollhouse where the miniature inhabitants seem to move on their own when no one is watching.",
    "Create a tale about a haunted hotel where the guests never check out, doomed to repeat their final moments for eternity.",
    "Imagine a series of mysterious disappearances in a small town, each one linked to a sinister urban legend. Write about the truth behind the myths.",

    // FOOD THEMED PROMPTS
    "Write a descriptive passage about your favorite comfort food, capturing its aroma, texture, and taste.",
    "Craft a short story set in a bustling food market, where the protagonist discovers a rare ingredient that changes their life.",
    "Imagine a world where food has magical properties. Write about a character who discovers they have the ability to cook up spells with their culinary creations.",
    "Create a recipe for a dish inspired by your favorite book or movie, complete with ingredients and cooking instructions.",
    "Write a dialogue between two rival chefs competing in a high-stakes cooking competition.",
    "Imagine a society where food is scarce and highly coveted. Write a story about a group of rebels fighting against a corrupt government to ensure everyone has enough to eat.",
    "Craft a poem celebrating the joys of a home-cooked meal shared with loved ones.",
    "Write a scene where a character tries an exotic food for the first time and discovers unexpected depths of flavor.",
    "Create a listicle showcasing the top ten street foods from around the world and the stories behind them.",
    "Imagine a restaurant where the menu changes based on the mood of the chef. Write a review of your dining experience.",
    "Craft a story about a baker who discovers a magical recipe book that grants wishes with every dessert baked.",
    "Write a dialogue between a picky eater and a food enthusiast trying to convince them to try new foods.",
    "Imagine a world where food allergies are a thing of the past. Write a scene set in a futuristic restaurant where everyone can eat whatever they want without fear.",
    "Create a cookbook for fictional characters, featuring recipes inspired by their personalities and adventures.",
    "Write a letter from a food critic to a chef praising their innovative dishes and unique culinary style.",
    "Imagine a society where food is used as currency. Write a story about a character trying to make their fortune in the cutthroat world of food trading.",
    "Craft a dialogue between two food items on a grocery store shelf, discussing their hopes and dreams for the future.",
    "Write a scene set in a magical bakery where the pastries come to life at night.",
    "Imagine a dinner party where the guests are all famous historical figures. Write about the conversation and the dishes served.",
    "Create a food-themed scavenger hunt where players must track down ingredients from various cuisines around the world.",

    //Nature Prompts 
    "Write a haiku capturing the tranquility of a forest at dawn.",
    "Compose a tweet-length nature observation using only emojis.",
    "Craft an Instagram post featuring a breathtaking sunset over a mountain range.",
    "Create a meme about the struggles of camping in the rain.",
    "Write a short story about a lost hiker who finds unexpected beauty in the wilderness.",
    "Imagine a world where plants have personalities. Describe a conversation between two trees in a dense forest.",
    "Design a Pinterest board showcasing your dream outdoor adventure destinations.",
    "Craft a dialogue between a bird and a butterfly discussing their migration routes.",
    "Write a blog post detailing the importance of preserving natural habitats for endangered species.",
    "Compose a poem celebrating the resilience of wildflowers growing in unexpected places.",
    "Describe the scent of a freshly bloomed flower in vivid detail.",
    "Imagine a day in the life of a wildlife photographer capturing images of elusive animals in their natural habitats.",
    "Write a letter from a tree to humans, expressing its concerns about deforestation and environmental destruction.",
    "Write a letter from a tree to humans, expressing its concerns about deforestation and environmental destruction.",
    "Craft a dialogue between a river and a mountain, discussing their symbiotic relationship.",
    "Write a Yelp review for a hidden gem of a hiking trail, highlighting its scenic views and unique features.",
    "Imagine a world where humans can communicate with animals. Write a conversation between a child and a wise old owl.",
    "Compose a forum post discussing the healing power of spending time in nature and sharing personal anecdotes.",
    "Write a Buzzfeed-style attention catching titled '20 Unbelievable Facts About Earth's Natural Wonders.'",
    "Imagine you are a tour guide leading a group through a lush rainforest. Write a scripted speech describing the ecosystem and its inhabitants.",

    //World Improvement
    "Compose a tweet advocating for sustainable living practices and their impact on the environment.",
    "Write a forum post discussing the importance of kindness and empathy in creating a better world.",
    "Craft a text-based infographic outlining simple ways individuals can reduce waste and promote recycling.",
    "Create a fake news headline announcing a groundbreaking renewable energy discovery.",
    "Write a letter to your local government advocating for increased funding for public parks and green spaces.",
    "Imagine a world where education is accessible to all. Write a short story about a child who overcomes barriers to attend school for the first time.",
    "Design an infographic illustrating the benefits of community gardening and its potential to combat food insecurity.",
    "Craft a dialogue between a politician and a group of young activists discussing the importance of climate action.",
    "Write a poem celebrating the beauty of diversity and the strength it brings to communities.",
    "Compose a speech calling for unity and cooperation in addressing global challenges such as poverty and inequality.",
    "Imagine a future where renewable energy sources power entire cities. Write a news article reporting on the first fully sustainable city.",
    "Create a vision board depicting your ideal world, highlighting aspects such as peace, equality, and environmental sustainability.",
    "Craft a dialogue between a scientist and a philanthropist discussing innovative solutions to address water scarcity in developing countries.",
    "Write a Yelp review for a local business that prioritizes ethical and sustainable practices in its operations.",
    "Imagine a society where empathy is valued above all else. Write a scene depicting a community coming together to support a neighbor in need.",
    "Design a social media campaign promoting volunteerism and community service.",
    "Compose a letter to future generations apologizing for the environmental damage caused by current practices and outlining steps being taken to mitigate it.",
    "Craft a dialogue between a parent and child discussing the importance of kindness and compassion towards others.",
    "Write a manifesto outlining a vision for a more equitable and just society.",
    "Imagine a world where renewable energy is as accessible as sunlight. Write a story about a community harnessing solar power to transform their lives.",

    //Sports theme prompts
    "Write a short story about a young athlete overcoming adversity to achieve their dreams of becoming a champion.",
    "Craft a dialogue between two sports fans debating the greatest athlete of all time in a particular sport.",
    "Compose a meme poking fun at a common stereotype in a particular sport.",
    "Create a fake sports headline announcing a surprise retirement of a star athlete.",
    "Write a letter to your favorite sports team expressing your support and appreciation.",
    "Imagine a world where sports are played with unconventional rules. Describe a match of soccer played with only one goalpost.",
    "Write a dialogue between a coach and a player discussing strategies for an upcoming game.",
    "Craft a dialogue between two rival fans debating the greatest player of all time in a particular sport.",
    "Write a sports column discussing the rise of esports and its impact on traditional sports.",
    "Compose a poem capturing the intensity and excitement of a championship game.",
    "Describe the feeling of scoring the winning goal in a championship match.",
    "Imagine a day in the life of a professional athlete, from morning training sessions to post-game recovery.",
    "Write a letter from a coach to their team, motivating them for an upcoming crucial match.",
    "Craft a dialogue between a sports commentator and a fan discussing the latest trade rumors in a particular sport.",
    "Craft a dialogue between a sports announcer and a color commentator during a live broadcast of a game.",
    "Write a Yelp review for a local sports bar, highlighting its atmosphere and menu options during game nights.",
    "Imagine a world where sports are played with robots instead of humans. Write a news article reporting on the first robot Olympics.",
    "Design a social media campaign encouraging youth participation in sports and physical activity.",
    "Compose a forum post discussing the role of sports in fostering community and social cohesion.",
    "Write a Buzzfeed-style listicle titled '10 Unforgettable Moments in Sports History.'",

    //Science Fiction Prompts
    "Write a tweet-length story about a time traveler who accidentally changes the course of history.",
    "Create a one line script for a sci-fi movie trailer that will leave viewers on the edge of their seats.",
    "Compose a meme about the struggles of living on a distant planet.",
    "Create a fake news headline announcing the discovery of extraterrestrial life.",
    "Write a letter from a human colonist on Mars to their family back on Earth, detailing life on the red planet.",
    "Imagine a world where humans have evolved to live underwater. Write a short story about a deep-sea explorer discovering an ancient civilization.",
    "Craft a poem inspired by the beauty and mystery of the cosmos.",
    "Craft a dialogue between a human astronaut and an alien ambassador during a diplomatic meeting.",
    "Write a sci-fi short story set in a dystopian future where technology controls every aspect of society.",
    "Compose a poem about the vastness of space and humanity's place within it.",
    "Describe the experience of piloting a spaceship through a wormhole in vivid detail.",
    "Imagine a day in the life of a cyborg living in a cyberpunk city.",
    "Write a letter from a scientist warning of the dangers of experimenting with time travel.",
    "Write a dialogue between a human scientist and an AI discussing the ethics of creating artificial life forms.",
    "Craft a dialogue between a human explorer and an alien lifeform on a distant planet.",
    "Write a Yelp review for a virtual reality amusement park, detailing the immersive experiences it offers.",
    "Imagine a future where humans upload their consciousness into virtual reality. Write a news article reporting on the first virtual society.",
    "Design a social media campaign advocating for space exploration and colonization.",
    "Create a poem inspired by the concept of parallel universes and alternate realities.",
    "Write a Buzzfeed-style listicle titled '10 Must-Have Gadgets for Surviving in a Post-Apocalyptic World.'",
];