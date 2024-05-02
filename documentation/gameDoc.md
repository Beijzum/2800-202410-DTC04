# Dead Net

The following is a comprehensive game design document intended for the developers of the game. Similar to the Dead Internet Theory conspiracy theory, *Dead Net* seeks to emulate an internet in which online social interactions are tinged with the uncertainty of AI. We will utilize modern chatbot AIs to masquerade as real players, and players must deduce who is real and who is AI. Not many games of today utilize AI as a core mechanic, most utilize AI during the ideation phase, or for asset development. *Dead Net* is intended to be a proof of concept of how AI could be used as core mechanics.

# Game Design

This section will focus on the game logic, details, and implementation at a high-level view.

## Overview

*Dead Net* is a social deduction chat room game where players are in a lobby with AI players. Similar to games like *Mafia*, players are tasked with deducing who are AI players and collectively vote them out. The game will take place in a chat room, in which players are given 3 minutes to discuss amongst themselves via text messages in the chat room. 

Actions players can take include sending text messages in the chat room, and possibly a role specific actions that will be outlined behind in the *Roles* section under *Gameplay*. Players who have roles specific actions can only use their action once per game on any other player.

Each chat room lobby can have a maximum of up to 30 players (not including AI players). For every 3 players in the game, there will be 1 AI added into the lobby. Due to the nature of the game being a party game, *Dead Net* will require a minimum of 3 players to play.

Since *Dead Net* focuses on anonymity, the game is best played online with random people online, but due to *Dead Net* being new and unknown, this will be difficult to achieve. For now, we recommend that players set their own house rules to prevent trivializing the game. We recommend banning messages that easily identifies an individual within a group such as "I am Joe".

 ## Setting

*Dead Net* is set 30 years into the future, where the epidemic of social reclusiveness is rampant in the population. AI has advanced to the point where it is almost impossible to tell who is real and who is not. Malicious actors now automate phishing attacks by sending chat bots to befriend targetted individuals. Due to the social recluse epidemic, many people are starved for social interaction and are susceptible to such targeted attacks.

Players are in the role of netizens trying to meet new people online in a newly released anonymous chat room. However, despite its new release, chat bots have been slowly seeping into the chat room ecosystem. It is up to the real users (players) to identify who are bots, and ban them as a collective.

## Gameplay

The following will outline a walk-through of the game and features the game will have.

### Walkthrough

This section will focus on what to expect for a typical fresh player.

***Note:** The following section will use the term bot instead of AI, both are interchangable for our purposes.*

***Landing Page***

Upon navigating to our website that hosts the game, there will be two buttons for a player to click. A sign in button and a join lobby button. When the user clicks sign in, they will be redirected to a login page in which they will enter their credentials. The login page will consists of the standard login page (email, password, and submit button) and a link to sign up for an account should the player not one. 

Clicking the sign up button will redirect the player to the sign up page, which will consist of the standard sign up information to fill (username, email, password, confirm password, submit). Should the player fail to login or sign up, they will be met with an error message on the login/sign up screen without any redirection, that highlights the fields that were wrong. Upon both successful login or sign up, they will be redirected back to the home page, where only the join lobby button is now present.

***Pre-Game Lobby***

Clicking the join lobby button, the player will be put into a pre-game lobby in which they will be waiting for more players to join. If the player is the first to join an empty lobby, they will be designated as the "game host" and will decide when to start the game. The "game host" can only start the game once the minimum players count has been met, which is 3.

The pre-game lobby will consist of a chat room and a list of current players in the lobby, where players can communicate with each other and set any house rules should they want to. The player list will display every player's username for their account. If the player is not logged in but is in the lobby, then they will be displayed as "Anonymous [Animal Here]". For the "game host", there will be an extra button underneath the player list labeled start game, where they can click it to immediately begin the game. Additionally, should the player not be logged in, the top of the pre-game lobby will show a message that telling the players that they are not logged in, and that they are missing features such as stat tracking and unlockable rewards.

***Game Start***

Once the game starts, the lobby will be populated with bots of different personalities at a 3:1 ratio, where every 3 players will generate 1 bot rounded up. For example, should there be 7 players, then 7/3 = 2.33, so 3 bots will be populated in the lobby. The player will then receive an anonymous name and an anonymous role, and will be asked to wait 30 seconds for the bots to make their move. During this time, there is a possibility that the player is eliminated immediately.

Once the 30 seconds are up, the player will then have the opportunity to send chat messages in the chat room. The player will have 3 minutes to discuss amongst the group to deduce who is a bot. During this time, should the player have a role that has an associated action, then they have the option to use such action on another player. Once those 3 minutes are up, the player chat is disabled, and they will be given a 20 second opportunity to vote for another player out of the game. 

If the majority of real players vote one player, then that one player will be eliminated. For example, should 4 players distribute their vote equally amongst all players, and 3 players vote another specific player, the player with 3 votes will not be eliminated since the majority did not vote for that one player. Additionally, there is no confirmation whether the player that got voted out was a bot, or a real player.

After the voting period ends, the player will then be asked to wait 30 seconds again for the bots to make their move again. This loop will repeat until either real players win, or bots win. 

***Player Eliminated***

Should the player be eliminated from the game, they will become spectators of the game. When spectating, the player will not be able to interact with anyone still present in the game. Should time allow for it, the player can still send messages that are only visible to other eliminated players. Otherwise spectators will have their chat disabled and will be unable to send any messages.

In the scenario in which the player joins a lobby that has already started a game, they will automatically become a spectator, and must wait until the current session is complete.

***Players Win***

Every real player will win the game if all bots been eliminated from the lobby. This includes real players that have been eliminated before every bot was removed. Upon wininng, players that are logged in will increase their account win counter by one.

***Bots Win***

Bots will win the game if there are an equal amount of bots as there are players in the lobby. When this occurs, every real player will increase their loss counter by one.

***Post-Game***

Upon the completion of a match, the player will be shown an overlay with either a win or loss screen. If the player is logged in, then the screen will display their current win loss stats, otherwise it will only show the result of the game. The overlay will also have a button to close said overlay.

Behind the overlay, the chat room will revert back to the pre-game lobby, in which the player will have the opportunity to send messages to other players. The lobby will then have to wait for the "game host" to start the game again, repeating everything from the *Game Start* section.

### Objective

Real players must identify who are the AI players and collectively vote them out. During every turn, a random real player will be eliminated from the game until an equal amount of AI players are present as real players. The game ends when either all AI players are eliminated, or the aforementioned player ratio is reached.

### Roles

Due to time constraints, we will limit roles to real players only, therefore the following section is not applied to AI players. Each role will be randomly assigned to a player, with no role duplication (outside of the chatter role). Additionally, all actions listed below can only be used once per game.

**Moderator** - This role can choose to give a player (including themselves) vote immunity, in which the selected player cannot be voted out of the game for that one turn.

**Programmer** - This role can choose another player to identify whether they are AI or real.

**Hacker** - This role can choose a player to eliminate should they be eliminated themselves (whether through votes or by AI players).

**Chatter** - This role has no associated actions.

### Anonymity

When the game starts, players are assigned random first and last names taken from an internal pool of names, and a random avatar icon taken from an internal pool of images. This is applied to both AI players and real players.

### Game Modes

Our current game outlined above will be the only game mode we will implement due to the time constraints. However, should the chat bots be too obvious, then we will adjust the game mode accordingly. This document will be updated to reflect such changes.

### AI Personalities

This section will outline AI personalities which we wish to implement into the game. However, given both the time constraints and our unfamiliarity with chatbots, some of these personalities might not make the cut. This document will be updated to reflect such changes.

**Memer** - This personality will have the tendency to communicate with internet slang. They will contribute to discussions but will not take anything seriously.

**Silent** - This personality will not send any messages unless actively called out. When sending messages they will try to minimize their message length.

**Serious** - This personality will attempt to play the game sincerely, and will contribute to discussions. Their contributions to discussions will attempt to purposely misdirect to real players.

**Toxic** - This personality will constantly complain about other players and the game. They will not contribute to discussions and will verbally attack anyone who angers it.

**Troll** - This personality will purposely expose itself as an AI, and will mock anyone who does not believe it. It will actively try to mess with other players and their deduction, and attempt to be a nuisance to discussions.

**Petty** - This personality will choose any player (fellow AIs included) at the start of the game, and fixate on slandering the targetted player. If the targetted player is voted out, they will pause their aggression until another player has earned its ire.

## Profile

The following will outline how user profiles will be used.

### Career Stats

Players will have win lose counters that are associated with their account. They will not be able to adjust/reset their counters.

### Leaderboards

Should time allow for it, we will implement a global leader board, in which players with the highest number of wins to losses will be displayed at the top of the global leader board. This number is calculated by: Wins - Loss = Score.

# Specifications

This section will focus on specific technologies, and how mechanics should be implemented when programming. This document section will update along with project progression, as implementation details are difficult to consider during phases of development.

## Chat bot

- To be researched

## Frontend

- Vanilla JavaScript (Subject to Change)
- HTML5
- CSS

## Backend 

*NodeJS Modules*
- Express
- MongoDB
- Mongo-Connect
- Express-session
- Bcrypt
- socket.io
- http
- dotenv

## Mechanics

*AI Players Eliminating Real Players*

- Generate a random integer and use said integer as the index to find the random player to be eliminated

*AI Players*

- AI players only functionality is chatting via chat bot, all other "player actions" will be simulated externally

*Votes*

- Vote counter is internal, the only UI element available to players is the background color of a player's selection box, where more votes increases the alpha value of the background color, this is done in order to obscure vote count.


# Development

This section will focus on development logistics.

## Workflow

Our group will be utilizing the centralized workflow, where each member will focus one aspect/feature of the game.

## Priority

The features that we must integrate to be considered as a minimum viable product is as follows:

- Working websockets that allow for chat room functionality
- AI chat bots that can directly send messages into the chat room
- Core game mechanics, which includes player voting, player elimination, win/lose conditions
- Populating a chat room lobby with chat bots
- Workable UI that is informative and responsive
- Profile functionality (login/logout, sign up, stat tracking)

## Ideal Timeline

**April 29 - May 3**
```
- Research Technologies
- Ideation
- Game Document
- Video Pitch
- Wireframe
```

**May 6 - May 10**
```
- Begin Coding
- Set up chat room websocket
- Create all html elements and their correct routing
- Get chat bots to send message to chat room
- Finish profile features (connecting to mongoDB, login/logout/sign up, sessions)
- Begin CSS
```

**May 13 - May 17**
```
- Begin implementation of game logic
- Finish majority of CSS
- Customize chat bot
```

**May 20 - May 24**
```
- Wrap up implementation of game logic
- If extra time, implement extra mechanics
- Test game
```

**May 27 - May 31**
```
- Wrapping up coding
- Fix Bugs
- Clean Up Codebase
- Polish CSS
- Preparing presentation
```

## Future Considerations

Due to the tight time constraints, there will likely be many features that will have to be omitted in order for our team to deliver the minimum viable product on time. Listed below are features which we would implement in the feature, if give more time.

**Different Game Modes** - Game modes with different win/lose conditions to allow for more variety in gameplay.

**Customizable Rulesets** - Allow players to customize their own rulesets such as allowing players to see vote counts.

**Multiple Game Lobbies** - Allow the site to host multiple lobbies to support concurrent running games.

**More Roles** - Add more roles to the game to allow for a more chaotic environment.

**AI Roles** - Allow AIs to have roles and be smart with using said roles.

**Machine Learning** - Have the chat bots undergo machine learning via genetic algorithm in order to constantly adapt and improve their ability to blend in.

**Private Messaging** - Add the ability to private message specific players (including bots)

**Matchmaking** - Implement automatic matchmaking so that the ease of play is improve.

**Unlockables** - Add unlockables such as new random pseudonyms, random icons, and pre-game titles/achievements that is unlocked based on account win/loss rates.