// React Imports
import React, { useEffect, useRef, useState } from 'react'

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

// CSS Styling
import './App.css'

firebase.initializeApp({
  apiKey: 'AIzaSyBO8nO42_nu9lE4QoztGstkLZ_O_nFP9U8',
  authDomain: 'fir-chat-app-ad4f8.firebaseapp.com',
  databaseURL: 'https://fir-chat-app-ad4f8.firebaseio.com',
  projectId: 'fir-chat-app-ad4f8',
  storageBucket: 'fir-chat-app-ad4f8.appspot.com',
  messagingSenderId: '17760635186',
  appId: '1:17760635186:web:a3c3e81c4d2c754bff2f2b',
  measurementId: 'G-JQSZM3NJ6K'
})
const auth = firebase.auth()
const firestore = firebase.firestore()

function App() {
  // Confirm user is logged in and successfully authenticated
  const [user] = useAuthState(auth)

  return (
    <div className='App'>
      <SignOut />
      <section>
        {/* If user is logged in the chat room is displayed elase the sign in page is displayed */}
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  )
}

// TODO: Refactor to separate component
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider()
    auth.signInWithPopup(provider)
  }
  return (
    <div className='sign-in-pop-up'>
      <button onClick={signInWithGoogle}>
        Sign In With Your Google Account
      </button>
    </div>
  )
}

// TODO: Refactor to separate component
function SignOut() {
  return (
    auth.currentUser && (
      <div className='sign-out'>
        <button onClick={() => auth.signOut()}>Sign Out</button>
      </div>
    )
  )
}
// TODO: Refactor to separate component

function ChatRoom() {
  // used to scroll to the bottom of the chat on page reload after new messages are sent
  const dummy = useRef()
  const messagesRef = firestore.collection('messages')
  const query = messagesRef.orderBy('createdAt', 'asc').limitToLast(25)

  // getting the message and sorting them by time of creation
  const [messages] = useCollectionData(query, { idField: 'id' })
  const [formValue, setFormValue] = useState('')

  const scrollToBottom = () => {
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])
  // TODO: Refactor to separate component
  const sendMessage = async e => {
    e.preventDefault()
    // request name, userID, uid, and pfp of logged in user
    const { displayName, uid, photoURL } = auth.currentUser

    await messagesRef.add({
      user: displayName,
      body: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      photoURL: photoURL
    })

    // Clear the form input value and scroll to bottom
    setFormValue('')
    dummy.current.scrollIntoView({ behavior: 'smooth' })
  }

  function ChatMessage(props) {
    const { user, body, uid, photoURL, createdAt } = props.message

    return (
      <div>
        <img
          src={photoURL || 'https://i.imgur.com/rFbS5ms.png'}
          alt="{user}'s picture"
        />
        <div>
          <p>{user}</p>
          <p>{body}</p>
        </div>
      </div>
    )
  }

  return (
    <div className=''>
      <div className=''>
        {/*  */}
        {messages &&
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </div>
      {/* Form input to type and submit messages */}
      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={e => setFormValue(e.target.value)}
          placeholder='Say hello!'
        />
        <button type='submit' disabled={!formValue}>
          send
        </button>
      </form>
    </div>
  )
}

export default App
