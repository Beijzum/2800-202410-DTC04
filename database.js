const databaseLink = `${process.env.MONGODB_PROTOCOL}://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}`;

require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require("bcrypt");
const MongoStore = require("connect-mongo");
const { search } = require("./pageRoutes");

const storage = MongoStore.create({
    mongoUrl: databaseLink,
    crypto: { secret: process.env.MONGODB_SESSION_SECRET }
})

const client = new MongoClient(databaseLink, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function signUpUser(requestBody) {
    return new Promise(async (res, rej) => {
        try {
            let errorList = [];
            
            // check if email and username are taken
            let existingUserWithSameName = await findUser({username: requestBody.username});
            if (existingUserWithSameName)
                errorList.push({usernameField: `${existingUserWithSameName.username} is taken`});
  
            let existingUserWithSameEmail = await findUser({email: requestBody.email});
            if (existingUserWithSameEmail) 
                errorList.push({emailField: `${existingUserWithSameEmail.email} is already associated with an account`});

            if (errorList.length !== 0) {
                res(errorList);
                return;
            }

            let database = client.db(process.env.MONGODB_DATABASE);
            let users = database.collection("users");

            let salt = await bcrypt.genSalt(10);
            let hashedPassword = await bcrypt.hash(requestBody.password, salt);

            let writeQuery = {
                username: requestBody.username,
                email: requestBody.email,
                password: hashedPassword,
                winCount: 0,
                loseCount: 0
            }

            await users.insertOne(writeQuery);
            console.log(`${requestBody.username} has successfully been registered`);
            res(null);

        } catch (e) {
            rej(e);
        }
    });
}

async function loginUser(requestBody) {
    return new Promise(async (res, rej) => {
        try {
            let result = await findUser({email: requestBody.email});
            if (result) {
                let passwordMatches = await bcrypt.compare(requestBody.password, result.password);
                if (passwordMatches) {
                    res(result);
                    return;
                }
            }
            else res(null);

        } catch (e) {
            rej(e);
        }
    });
}

async function findUser(searchParams) {
    return new Promise(async (res, rej) => {
        try {
            let database = client.db(process.env.MONGODB_DATABASE);
            let users = database.collection("users");

            let result = await users.findOne(searchParams);
            res(result);

        } catch (e) {
            rej(e);
        }
    });
}

async function findLeaderboard() {

}

async function updateUserStats() {

}

function createErrorObjectBase() {
    return {error: {}};
}

module.exports = {
    client: client,
    mongoSessionStorage: storage,
    signUpUser: signUpUser,
    loginUser: loginUser,
    findUser: findUser,
    findLeaderboard: findLeaderboard,
    updateUserStats: updateUserStats
}