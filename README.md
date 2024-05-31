## Deadnet

Dead Net is a game where players must distinguish between human and AI chat bots to combat the rise of malicious AI.

## About the Project

In the future, we believe that there will be an increase of bad actors programming malicious AI to scam, defraud, and misinform the general population. We are developing a game where players must distinguish between human and AI chat bots to combat the rise of malicious AI. We believe that a gaming environment is the best way to teach people strategies on how to detect AI-generated content because games will provide consistent positive feedback to users, which helps to reinforce their behaviour regarding AI.

## How to Install

1. Download and install Visual Studio Code
2. Clone the repository
    ```sh
    git clone https://github.com/Beijzum/2800-202410-DTC04.git
    ```
3. Go to cmd/terminal and locate the directory of the cloned project
4. Open the command terminal and type:
    ```sh
    npm install
    ```
5. Create a MongoDb server and grab the relevant information
6. Create Cloudinary server and grab the relevant information
7. Create a GeminiAPI key
8. Create an .env file in the project directory
    ```sh
    PORT=3000 (or any other number)
    MONGO_URI=[MongoDB URi]
    GEMINI_API_KEY=[Your Gemini API]
    MONGODB_PROTOCOL=mongodb+srv
    MONGODB_USER=[MongoDB User]
    MONGODB_PASSWORD=[MongoDB User Password]
    MONGODB_HOST=deadnet.vfbs8jn.mongodb.net
    MONGODB_DATABASE=userdata
    NODE_SESSION_SECRET=Javascript_is_Cool (Recommended to use a UID Generator)
    MONGODB_SESSION_SECRET=MongoDB_is_Cool (Recommended to use a UID Generator)
    CLOUDINARY_CLOUD_NAME=[Cloudinary Cloud Name]
    CLOUDINARY_CLOUD_KEY=[Cloudinary Cloud Key]
    CLOUDINARY_CLOUD_SECRET=Cloudinary_is_Cool (Recommended to use a UID Generator)
    COURIER_TOKEN=Cloudinary_is_always_Cool (Recommended to use a UID Generator)
    ```
9. Open the command terminal while in the project directory and type
    ```
    nodemon server.js
    or
    npm run dev
    ```
10. Go to your local browser (Chrome, Edge, Firefox. etc.) and go to
    localhost:3000 (your chosen port number)

## Technologies Used

The technologies that we used for the app.

### Front end:

1. ejs: Server-side rendering of HTML templates.
2. flowbite: Tailwind CSS component library.
3. tailwind: CSS framework.
4. tailwindcss: Tailwind CSS framework.
5. postcss: Transforms styles with JavaScript plugins.
6. autoprefixer: PostCSS plugin to parse CSS and add vendor prefixes.
7. vite: A frontend build tool.

### Back end:

1. @google/generative-ai: Google’s generative AI.
2. @trycourier/courier: Sending notifications via Courier.
3. bcrypt: Hashing passwords.
4. cloudinary: Managing and optimizing media assets.
5. connect-mongo: MongoDB session store for Express.
6. cors: Enables CORS (Cross-Origin Resource Sharing).
7. dayjs: Formatting dates.
8. dotenv: Loading environment variables from a .env file.
9. events: Node.js module for event-driven programming.
10. express: Web framework for Node.js.
11. express-session: Middleware for managing sessions in Express.
12. fs: Node.js module for filesystem operations.
13. http: Node.js module for HTTP server and client functionality.
14. joi: Data validation library.
15. multer: Handles multipart/form-data, which is used for file uploads.
16. nodemon: Restarts the server when file changes are detected.
17. socket.io: Real-time, bidirectional communication between web clients and servers.

### Database

1. mongodb: MongoDB driver for Node.js.

## Features

Features found in the app.

### Artificial Intelligence

GeminiAI, Google’s generative AI, is one of our main features in this web app. AI chatbots are used as core game mechanic in our game flow. They are used to create AI-generated responses depending on the prompt it is given during the course of the game.

We have also programmed the AI to receive instructions, which essentially creates personalities for the AI. Some instructions we created for the chatbots can replicate human language and speech patterns. Other chatbots will have instructions that make it easier to detect, so that players of all levels can enjoy the game. 

### Customizable player profiles

Players are able to change their picture profiles, change their password, and check their stats in their profile page.

### Leaderboards

There is a leaderboard ranking for players with the highest amount of wins.

### Chatroom

Players can socialize in a pre-game chatroom if they are waiting for the game to start.

### Prompt game mode

In this game mode, players receive a prompt and they have to make a response to that prompt. All players and AIs have to respond to the prompt. Players must determine the AI responses and vote them out.

## How to Start Playing

Instructions on how to get started on playing the game.

### Account creation:

You must register an account using a valid email. Emails must be a valid email (e.g. email@email.com)

Passwords must be at least 5 characters long and include at least one lowercase letter, one uppercase letter, one special character (@#$%^&+!.=), and one number. (e.g Asd!23)

### Confirm your account

You will receive an email confirmation in your inbox. Click confirm and you will be redirected to a confirmation page in the web app.

### Log into your account

You must be logged in to play Dead Net.

### Enter the pre-game chat lobby

Once you click on the "Play" button in the landing page or in the navbar, you will be redirected to a chat lobby where you can socialize with other players while you wait for the game to start. Once a minimum of **three** players is in the lobby and they have pressed the ready button, they will be redirected to a game instance after a countdown.

## Playing the Game

Instructions for playing the game.

### Writing phase

One random prompt will be shared with all players and AIs in the game session. Everyone will type **one** response to that prompt and submit the response before the time runs out.

### Voting phase

Players will have to decide which response seems like the most AI-generated. You may only vote for **one** player.

### Results phase

The most voted player will be **eliminated** from the game. If players vote all the AIs out, then they win.

If there are still AIs present in the game, then the AIs will randomly choose a player to eliminate from the game. The AIs will win when there are more AIs than humans.

Afterwards, the game will continue into the next round with a new random prompt until the humans or AIs claim victory.

## About Us

Team Name: DTC-04
Team Members :

-   Jason Chow - jchow149@my.bcit.ca
-   Jonathan Liu - jliu483@my.bcit.ca
-   Alex Park - spark329@my.bcit.ca
-   Richard Maceda - rmaceda1@my.bcit.ca
-   Jaiden Duncan

## Contributing/Suggestions

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Licensing

## Refenrences

[NodeJs](https://nodejs.org/docs/latest/api/)
[GeminiAI](https://ai.google.dev/gemini-api/docs)
[Sockets.io](https://socket.io/docs/v4/)
[ExpressEJS](https://expressjs.com/en/api.html)
[MonogDB](https://www.mongodb.com/docs/)
[MongoDB with NodeJs](https://learn.mongodb.com/learning-paths/using-mongodb-with-nodejs?_ga=2.245863168.561494376.1717162913-1483954595.1714368702)
[Cloudinary](https://cloudinary.com/documentation/image_upload_api_reference)

## List of file contents

Root Directory:.
| .env
| .gitignore
| .jshintrc
| database.js
| emailNotification.js
| gameHandler.js
| geminiAI.js
| joiValidation.js
| middleware.js
| package-lock.json
| package.json
| pageRoutes.js
| postcss.config.js
| README.md
| server.js
| socketConstants.js
| tailwind.config.js
| websocket.js
|  
+---documentation
| bugsList.md
| gameDoc.md
|  
+---public
| | chatModal.js
| | chatroom.js
| | forgotpass.js
| | game.js
| | index.js
| | lobby.js
| | login.js
| | memes.js
| | navbar.js
| | postGameModal.js
| | profile.js
| | registerSuccess.js
| | reset.js
| | signUp.js
| | style.css
| | windowHandler.js
| |  
| +---images
| | 01bg.gif
| | 404.gif
| | avatar0.jpg
| | avatar1.jpg
| | avatar10.jpg
| | avatar11.jpg
| | avatar12.png
| | avatar13.png
| | avatar14.jpg
| | avatar15.jpg
| | avatar16.jpg
| | avatar17.jpg
| | avatar18.jpg
| | avatar19.jpg
| | avatar2.jpg
| | avatar20.jpg
| | avatar21.png
| | avatar22.png
| | avatar23.png
| | avatar24.png
| | avatar3.jpg
| | avatar4.jpg
| | avatar5.jpg
| | avatar6.jpg
| | avatar7.jpg
| | avatar8.jpg
| | avatar9.jpg
| | deadPicture.gif
| | defaultProfilePicture.webp
| | defeat.jpg
| | game1.png
| | game2.png
| | game3.png
| | game4.png
| | game5.png
| | heli.gif
| | heli.png
| | imHuman.jpg
| | lobby1.png
| | lobby2.png
| | logo.png
| | meme0.png
| | meme1.jpg
| | meme2.gif
| | muteMusicIcon.png
| | noGameRunning.gif
| | playerListIcon.png
| | playMusicIcon.png
| | trapCard.jpg
| | victory.jpg
| | voteTransitionAnimation.gif
| | waitTransitionAnimation.gif
| |  
| \---sfx
| button_sound_effect_1.mp3
| button_sound_effect_2.mp3
| button_sound_effect_3.mp3
| emergency_sound_effect.mp3
| gameLose.mp3
| gameWin.mp3
| heliAudio.mp3
| jazz.mp3
| lobby_music_1.mp3
| lobby_music_2.mp3
| nextGen.mp3
| no.mp3
| robot.mp3
| suspicious.mp3
| trapCard.mp3
| vote_intense_music_1.mp3
| vote_music_1.mp3
|  
+---socketTemplates
| noGame.ejs
| result.ejs
| statusBar.ejs
| transition.ejs
| vote.ejs
| wait.ejs
| write.ejs
|  
\---views
| 404.ejs
| defeat.ejs
| error.ejs
| forgotpass.ejs
| forgotPassSuccess.ejs
| game.ejs
| howToPlay.ejs
| index.ejs
| leaderboard.ejs
| lobby.ejs
| login.ejs
| memes.ejs
| privacy.ejs
| profile.ejs
| registerSuccess.ejs
| reset.ejs
| signUp.ejs
| verify.ejs
| victory.ejs
| votingScreenSample.ejs
|  
 \---templates
chatBar.ejs
credentialField.ejs
footer.ejs
formSubmitButton.ejs
gameNavbar.ejs
header.ejs
inGameNavbarElements.ejs
leaderboardEntry.ejs
lobbyGameNavbarElements.ejs
navbar.ejs
navbarItem.ejs
postGameModalLose.ejs
postGameModalWin.ejs
responseCard.ejs
websocketImport.ejs
