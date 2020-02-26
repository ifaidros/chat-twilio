console.log('chat.js loaded')

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const mine = document.querySelector('button')

let ACCESS_TOKEN = ''
let chatClient = ''
let chatChannel = ''
let userSelectionMenu = ''
let userSelectionMenuSelected = ''

document.querySelector('#btnGetToken').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('---->btnGetToken clicked')
    GetAvailableUsers()

    if (!userSelectionMenuSelected) {
        console.log('---->Please select a User')
        let h1Error = document.querySelector('#h1Error')
        h1Error.textContent = 'PLEASEDDDDDD'
        setInterval(() => {
            h1Error.textContent = ''
        }, 2000)
        
        return
    }   
    console.log('---->userSelectionMenuSelected', userSelectionMenuSelected)


    const getToken = () => {
        return fetch('/token/' + userSelectionMenuSelected).
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
        console.log('---->Access Token: ', ACCESS_TOKEN) 
        userSelectionMenu.remove()
        //GetAvailableUsers()        
        })
})

document.querySelector('#btnCreateClientGetToken').addEventListener('click', (e) => {
    e.preventDefault()    
    Twilio.Chat.Client.create(ACCESS_TOKEN).then(client => {
        chatClient = client
        console.log(chatClient)
    });
    console.log('---->Chat client created:', chatClient)
})

document.querySelector('#btnGetPublicChannelDescr').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('---->Public Channel Descriptors')
    chatClient.getPublicChannelDescriptors().then((paginator) => {
        for (i = 0; i < paginator.items.length; i++) {
          const channel = paginator.items[i];
          console.log('---->Channel: ' + channel.friendlyName);
          chatChannel = channel
          //console.log(chatChannel)
        }
      });
})

document.querySelector('#btnGetUserChannelDescr').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('---->User Channel Descriptors')
    chatClient.getUserChannelDescriptors().then((paginator) => {
        console.log('Number of User Channel Descriptors: ', paginator.items.length)
        for (i = 0; i < paginator.items.length; i++) {
          const channel = paginator.items[i];
          console.log('---->Channel: ' + channel.friendlyName);          
        }
      });  
})

document.querySelector('#btnJoinChannel').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('---->Attempting to join chatChannel: ', chatChannel.friendlyName)
    console.log('---->Joining Channel')
    //Getting channel object from channel descriptor chatChannel
    chatChannel.getChannel().then((channel) => {
        chatChannel = channel
        console.log('---->chatChannel is now :', chatChannel)

        chatChannel.join().then((result) => {console.log('---->Joined the channel ', result)}).catch((err) => {
            console.log("Couldn't join channel " + chatChannel.friendlyName + ' because ' + err)
        }) 


        chatChannel.on('typingStarted', function(member) {
            //process the member to show typing
            console.log('typing')
            //updateTypingIndicator(member, true);
        })
        
        //set  the listener for the typing ended Channel event
        chatChannel.on('typingEnded', function(member) {
            //process the member to stop showing typing
            console.log('typing')
            //updateTypingIndicator(member, false);
        })
    })

    chatClient.on('channelJoined', (channel) => {
        console.log('---->Joined channel message (from on channelJoined):' + channel.friendlyName);
    });

    chatClient.on('messageAdded', (message) => {
        console.log('---->messages added ', message.body);
        let divOutput = document.querySelector('#output')
        divOutput.insertAdjacentHTML('beforeend', '<p>' + message.dateUpdated.toLocaleString() + '  ' + message.author + '  ' + message.body + '</p>')
    })


})

document.querySelector('#btnLeaveChannel').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('---->Leave Channel')
    chatChannel.leave().then((result) => {
        console.log('---->Left the channel ' + result.friendlyName)
        
        
    }).then(userleft).catch((err) => {
    console.log("Couldn't leave channel " + chatChannel.friendlyName + ' because ' + err)
    })  
})

document.querySelector('#btnGetMessages').addEventListener('click', (e) => {
    e.preventDefault()
    console.log('---->Get Messages')
    // Get Messages for a previously created channel
    chatChannel.getMessages(50).then(function(messages) {        
        let divOutput = document.querySelector('#output')
        const totalMessages = messages.items.length
        for (i = 0; i < totalMessages; i++) {
        const message = messages.items[i];
        divOutput.insertAdjacentHTML('beforeend', '<p>' + message.author + '  ' + message.body + '</p>')        
      }
      console.log('---->Total Messages:' + totalMessages);
    });
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()
    chatChannel.sendMessage(e.target.elements.message.value)
    document.querySelector('#input_txt').value = ''
    document.querySelector('#input_txt').focus()      
})

document.querySelector('#input_txt').addEventListener('keydown', (e) => {
    //e.preventDefault()
    chatChannel.typing()
})
   



function GetAvailableUsers () {
    let availableUsers = '' 
    fetch('/users')
    .then((response) => {
        if (response.status === 200) {          
            return response.json()
        } else {
            throw new Error('Unable to fetch token')
        }
    }).then((availableUsers) => {
        console.log('---->Available Users:', availableUsers)
        let divUsers = document.querySelector('#users-list')
        if (userSelectionMenu) {
            userSelectionMenu.remove()
        }
        let h1Error = document.querySelector('#h1Error')
        h1Error.textContent = 'PLEASE SELECT USER'
        userSelectionMenu = document.createElement("select")
        userSelectionMenu.id = 'userSelectionMenuId'
        userSelectionMenu.name = 'selecteduser'
        userSelectionMenu.size = availableUsers.length

        availableUsers.map((user, i) => {
            const option = document.createElement("option")
            option.value = user.username
            option.text = user.username
            userSelectionMenu.add(option, null)
        })
        divUsers.appendChild(userSelectionMenu)
        //document.querySelector("#userSelectionMenuId").focus()


        document.querySelector('#userSelectionMenuId').addEventListener('click', (e) => {
            //e.preventDefault()    
            userSelectionMenuSelected = e.target.value 
            console.log('---->userSelectionMenuId', userSelectionMenuSelected)
        })

        console.log(userSelectionMenu)

        //return result
    })
}

function userleft () {
    let availableUsers = '' 
    return fetch('/userleft/' + userSelectionMenuSelected)
    .then((response) => {
        if (response.status === 200) {          
            return response.json()
        } else {
            throw new Error('Unable to fetch token')
        }
    }).then((result) => {
        userSelectionMenuSelected = ''
        console.log('---->User left', result)
        //return result
    })
}




// ***********Commented becasue the button joinbutton was removed
// document.querySelector('#joinbutton').addEventListener('click', (e) => {
//     e.preventDefault()
//     if (!userSelectionMenuSelected) {
//         console.log('---->Please select a User')
//     }   
//     console.log('---->userSelectionMenuSelected', userSelectionMenuSelected)
// })



//Leave the channel before leaving the page
window.onbeforeunload = function() {
    console.log('---->Leave Channel')
    chatChannel.leave().then((result) => {console.log('---->Leaving the channel ' + result.friendlyName)}).then(userleft).catch((err) => {
    console.log("Couldn't leave channel " + chatChannel.friendlyName + ' because ' + err)
    })  
};

// socket.on('message', (message) => {
//     console.log(message)
//     let divOutput = document.querySelector('#output')
//     //output.innerHTML += '<p>' + message + '</p>'
//     divOutput.insertAdjacentHTML('beforeend', '<p>' + moment(message.createdAt).format('h:mm a') + '   ' + message.text + '</p>')
// })

