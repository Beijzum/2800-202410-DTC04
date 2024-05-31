## Deadnet
Dead Net is a game where players must distinguish between human and AI chat bots to combat the rise of malicious AI. 

## About the Project
In the future, we believe that there will be an increase of bad actors programming malicious AI to scam, defraud, and misinform the general population. We are developing a game where players must distinguish between human and AI chat bots to combat the rise of malicious AI. We believe that a gaming environment is the best way to teach people strategies on how to detect AI-generated content because games will provide consistent positive feedback to users, which helps to reinforce their behaviour regarding AI.

## How to Install 
1. Clone the Repo
    ```sh
    git clone https://github.com/Beijzum/2800-202410-DTC04.git
    ```
2. Go to cmd/terminal and locate the directory of the cloned project
3. Open terminal and Type
    ```sh
    npm install
    ```
4. Create a MongoDb Server
5. Create Cloudinary Server
6. Create an .env file 
    ```sh
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
7. Open Terminal while in the project directory and type
```nodemon server.js```
8. Go to your Local Browswer (Chrome, Edge, Firefox. etc..) and go to 
localhost:3000

## Technologies Used

### Front End:
1. ejs: Server-side rendering of HTML templates.
2. flowbite: Tailwind CSS component library.
3. tailwind: CSS framework.
4. tailwindcss: Tailwind CSS framework.
5. postcss: Transforms styles with JavaScript plugins.
6. autoprefixer: PostCSS plugin to parse CSS and add vendor prefixes. 
7. vite: A frontend build tool.

### Back End:
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


## How to Start Playing 

### Account Creation: 
You must register an account using a valid email.

### Confirm your Account
You will receive a confirmation in your inbox, click confirm and you will be redirected to the game.
### Play the Game 
Click on play, which you will be directed to the lobby while waiting for other players.

### During In Game 
You must answer the prompt given to you.

### Voting Phase
You will vote out who you think is an AI. 

### Cycle
The same process of writing prompts and voting will repeat until all players are voted out or all the AI are voted out 


## About Us
Team Name: DTC-04
Team Members: 
- Jason Chow
- Jonathan Liu
- Alex Park
- Richard Maceda
- Jaiden Duncan


## Licensing 
TBA


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


## List of file contents
Root Directory:.
|   .env
|   .gitignore
|   .jshintrc
|   database.js
|   emailNotification.js
|   gameHandler.js
|   geminiAI.js
|   joiValidation.js
|   middleware.js
|   package-lock.json
|   package.json
|   pageRoutes.js
|   postcss.config.js
|   README.md
|   server.js
|   socketConstants.js
|   tailwind.config.js
|   websocket.js
|   
+---documentation
|       bugsList.md
|       gameDoc.md
|       
+---public
|   |   chatModal.js
|   |   chatroom.js
|   |   forgotpass.js
|   |   game.js
|   |   index.js
|   |   lobby.js
|   |   login.js
|   |   memes.js
|   |   navbar.js
|   |   postGameModal.js
|   |   profile.js
|   |   registerSuccess.js
|   |   reset.js
|   |   signUp.js
|   |   style.css
|   |   windowHandler.js
|   |   
|   +---images
|   |       01bg.gif
|   |       404.gif
|   |       avatar0.jpg
|   |       avatar1.jpg
|   |       avatar10.jpg
|   |       avatar11.jpg
|   |       avatar12.png
|   |       avatar13.png
|   |       avatar14.jpg
|   |       avatar15.jpg
|   |       avatar16.jpg
|   |       avatar17.jpg
|   |       avatar18.jpg
|   |       avatar19.jpg
|   |       avatar2.jpg
|   |       avatar20.jpg
|   |       avatar21.png
|   |       avatar22.png
|   |       avatar23.png
|   |       avatar24.png
|   |       avatar3.jpg
|   |       avatar4.jpg
|   |       avatar5.jpg
|   |       avatar6.jpg
|   |       avatar7.jpg
|   |       avatar8.jpg
|   |       avatar9.jpg
|   |       deadPicture.gif
|   |       defaultProfilePicture.webp
|   |       defeat.jpg
|   |       game1.png
|   |       game2.png
|   |       game3.png
|   |       game4.png
|   |       game5.png
|   |       heli.gif
|   |       heli.png
|   |       imHuman.jpg
|   |       lobby1.png
|   |       lobby2.png
|   |       logo.png
|   |       meme0.png
|   |       meme1.jpg
|   |       meme2.gif
|   |       muteMusicIcon.png
|   |       noGameRunning.gif
|   |       playerListIcon.png
|   |       playMusicIcon.png
|   |       trapCard.jpg
|   |       victory.jpg
|   |       voteTransitionAnimation.gif
|   |       waitTransitionAnimation.gif
|   |       
|   \---sfx
|           button_sound_effect_1.mp3
|           button_sound_effect_2.mp3
|           button_sound_effect_3.mp3
|           emergency_sound_effect.mp3
|           gameLose.mp3
|           gameWin.mp3
|           heliAudio.mp3
|           jazz.mp3
|           lobby_music_1.mp3
|           lobby_music_2.mp3
|           nextGen.mp3
|           no.mp3
|           robot.mp3
|           suspicious.mp3
|           trapCard.mp3
|           vote_intense_music_1.mp3
|           vote_music_1.mp3
|           
+---socketTemplates
|       noGame.ejs
|       result.ejs
|       statusBar.ejs
|       transition.ejs
|       vote.ejs
|       wait.ejs
|       write.ejs
|       
\---views
    |   404.ejs
    |   defeat.ejs
    |   error.ejs
    |   forgotpass.ejs
    |   forgotPassSuccess.ejs
    |   game.ejs
    |   howToPlay.ejs
    |   index.ejs
    |   leaderboard.ejs
    |   lobby.ejs
    |   login.ejs
    |   memes.ejs
    |   privacy.ejs
    |   profile.ejs
    |   registerSuccess.ejs
    |   reset.ejs
    |   signUp.ejs
    |   verify.ejs
    |   victory.ejs
    |   votingScreenSample.ejs
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

## FAQ
TBA

## More details to come
TBA
