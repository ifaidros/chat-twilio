require('dotenv').config()
const express = require('express')
const path = require('path')
const helmet = require('helmet')

const app = express()
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(helmet())
app.use(express.json())
app.use(express.static(publicDirectoryPath))

let availableUsers = [{'username': 'User 1'}, {'username': 'User 2'}]
let arrayss = []

app.get('/token/:username', (req, res) => {
    const id = req.params.username

    availableUsers = availableUsers.filter((user) => {
        return !(req.params.username === user.username)
    })

    console.log('eventually the available users are', availableUsers)

    const token = createToken(id)
    console.log('the token is ' + token.token)
    // res.set({'Access-Control-Allow-Origin': '*'})
    // res.setHeader('Content-Type', 'application/json')
    res.send(token)
})

//"Token Server" 
function createToken(id) {    
    const AccessToken = require('twilio').jwt.AccessToken;
    const ChatGrant = AccessToken.ChatGrant;
    // Used when generating any kind of tokens
    const twilioAccountSid = process.env.ACCOUNT_SID
    const twilioApiKey = process.env.SID
    const twilioApiSecret = process.env.SECRET
    // Used specifically for creating Chat tokens
    const serviceSid = process.env.SERVICE_SID
    const identity = id
    //const identity = 'user@example.com';
    // Create a "grant" which enables a client to use Chat as a given user,
    // on a given device
    const chatGrant = new ChatGrant({
        serviceSid: serviceSid,
    });
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, ttl=7200);

    token.addGrant(chatGrant);
    token.identity = identity;
    // Serialize the token to a JWT string
    return {
        identity: token.identity,
        token: token.toJwt()
    }
}

app.get('/users', (req, res) => {
    console.log('User availability request arrived')
    //availableUsers = [{'username': 'User 1'}, {'username': 'User 2'}]
    // res.set({'Access-Control-Allow-Origin': '*'})
    // res.setHeader('Content-Type', 'application/json')
    res.send(availableUsers)
})




app.get('*', (req, res) => {
    res.send('<h1>404 PAGE</h1>')
})

app.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

console.log('__dirname', __dirname)