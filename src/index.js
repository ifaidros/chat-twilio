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

app.get('/token/:username', (req, res) => {
    const id = req.params.username
    const token = createToken(id)
    console.log('the token is ' + token.token)
    // res.set({'Access-Control-Allow-Origin': '*'})
    // res.setHeader('Content-Type', 'application/json')
    res.send(token)
})
 
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






app.get('*', (req, res) => {
    res.send('<h1>404 PAGE</h1>')
})

app.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})

console.log('__dirname', __dirname)