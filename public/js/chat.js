console.log('chat.js loaded')

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const mine = document.querySelector('button')

let ACCESS_TOKEN = ''
let chatClient = ''
let chatChannel = ''

document.querySelector('#btnGetToken').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('btnGetToken clicked')
    const getToken = () => {
        return fetch('/token/' + 'User1').
        then((response) => {
            if (response.status === 200) {          
              return response.json()
            } else {
                throw new Error('Unable to fetch token')
            }
        }).then((tokenObject) => {
            return tokenObject.token
        })
    }
    getToken().then((token) => {
        ACCESS_TOKEN = token
        console.log('*****Access Token:*****', ACCESS_TOKEN)         
        })
})

document.querySelector('#btnCreateClientGetToken').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('*****Chat client created:*****')
    Twilio.Chat.Client.create(ACCESS_TOKEN).then(client => {
        chatClient = client
        console.log(chatClient)
    });
})

document.querySelector('#btnGetPublicChannelDescr').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('*****Public Channel Descriptors:*****')
    chatClient.getPublicChannelDescriptors().then(function(paginator) {
        for (i = 0; i < paginator.items.length; i++) {
          const channel = paginator.items[i];
          console.log('Channel: ' + channel.friendlyName);
          chatChannel = channel
          console.log(chatChannel)
        }
      });
})



document.querySelector('#btnGetUserChannelDescr').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('*****User Channel Descriptors:*****')
    chatClient.getUserChannelDescriptors().then(function(paginator) {
        console.log(paginator.items.length)
        for (i = 0; i < paginator.items.length; i++) {
          const channel = paginator.items[i];
          console.log('Channel: ' + channel.friendlyName);          
        }
      });  
})

document.querySelector('#btnJoinChannel').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('**********************************', chatChannel)
    console.log('*****Joining Channel:*****')
    chatChannel.getChannel().then((channel) => {
        chatChannel = channel
        console.log('chatChannel is now :', chatChannel)

        chatChannel.join().then((result) => {console.log('joining the channel' + result)}).catch((err) => {
            console.log("Couldn't join channel " + chatChannel.friendlyName + ' because ' + err)
        }) 
    })
    // Join a previously created channel
    chatClient.on('channelJoined', function(channel) {
        console.log('Joined channel ' + channel.friendlyName);
    });

    chatClient.on('messageAdded', function(message) {
        console.log('messages added ', message.body);
        let divOutput = document.querySelector('#output')
        divOutput.insertAdjacentHTML('beforeend', '<p>' + message.dateUpdated.toLocaleString() + '  ' + message.author + '  ' + message.body + '</p>')
    })
})

document.querySelector('#btnLeaveChannel').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('*****Leave Channel*****')
    chatChannel.leave().then((result) => {console.log('leaving the channel ' + result.friendlyName)}).catch((err) => {
    console.log("Couldn't leave channel " + chatChannel.friendlyName + ' because ' + err)
    })  
})

document.querySelector('#btnGetMessages').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('*****Get Messages*****')
    // Get Messages for a previously created channel
    chatChannel.getMessages().then(function(messages) {        
        let divOutput = document.querySelector('#output')
        const totalMessages = messages.items.length
        for (i = 0; i < totalMessages; i++) {
        const message = messages.items[i];
        divOutput.insertAdjacentHTML('beforeend', '<p>' + message.author + '  ' + message.body + '</p>')        
      }
      console.log('Total Messages:' + totalMessages);
    });
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()
    chatChannel.sendMessage(e.target.elements.message.value)
    document.querySelector('#input_txt').value = ''
    document.querySelector('#input_txt').focus()      
})
   

// socket.on('message', (message) => {
//     console.log(message)
//     let divOutput = document.querySelector('#output')
//     //output.innerHTML += '<p>' + message + '</p>'
//     divOutput.insertAdjacentHTML('beforeend', '<p>' + moment(message.createdAt).format('h:mm a') + '   ' + message.text + '</p>')
// })

