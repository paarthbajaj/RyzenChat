import React, { useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyCZtArIn3XlJKG3eQCudty5VFz4yLAdHTM",
  authDomain: "ryzenchat.firebaseapp.com",
  projectId: "ryzenchat",
  storageBucket: "ryzenchat.appspot.com",
  messagingSenderId: "495642742355",
  appId: "1:495642742355:web:d13a74a8502faaeec500a6",
});

const auth = firebase.auth(); //(1)refrence to auth and firebase sdk as global variable
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth); //(2)useAuthstate hook to detect if user is logged in or not
  //if user is logged in, then user is an object which stores id, mail etc but if user is logged out, it will be null
  return (
    <div className="App">
      <header className="App-header">
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />} </section>
      {/* (3)this will check if user has some value and display component according to that */}
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider(); //(4)googleauthprovider is for popped ot window which asks user to sign in via google
    auth.signInWithPopup(provider);
  };
  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button> //auth.signout is predefined for signout
  );
}

function ChatRoom() {
  const dummy = useRef(); //(17)
  const messagesRef = firestore.collection("messages"); //(5)this line is creating a refernce to firestore collection
  const query = messagesRef.orderBy("createdAt").limit(25); //(6)query for subset of documents which is ordered by timestamp in order to show recent messages
  const [messages] = useCollectionData(query, { idField: "id" }); //(7)query that listerns to any update in data in realtime with usecolllectiondata hook, this returns an array of objects where each object is chat message in database and changes will reflect in realtime

  const [formValue, setFormValue] = useState(""); //(12)

  const sendMessage = async (e) => {
    //(14) onsubmit button will write the value to firestore
    e.preventDefault(); //prevent refresh

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      //(15)this will write  or create new document in firestore and it takes js obj as its arguments

      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" }); //(18)
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        {/* (8)this is mapping over the array of messages or loop over each document, and for each message I am using another component to which I am passing key and message prop that have message id and document data as msg  */}

        <span ref={dummy}></span>
        {/* (16) */}
      </main>

      <form onSubmit={sendMessage}>
        <input //(11)this form is the way user is sending messages, see at bottom of app
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)} //(13)binding of state to form input from (12)
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          📬
        </button>
      </form>
    </>
  );
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received"; // (9) to distinguish b/w sent and received messages, by comparing userId on firestore document to the currently logged in user, if equal then React will know that current user have sent the message

  return (
    <>
      <div className={`message ${messageClass}`}>
        {/* (10)this messageClass will get value sent or received upon checking from (9), and then className will get modified */}
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
