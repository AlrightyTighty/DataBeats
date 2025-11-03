import { useState, useEffect } from 'react'
import '../css/Bio.css'
import EditButton from './EditButton'

export default function Bio({musician, api}) {

    // store bio as state so it can be changed
    const [bio, setBio] = useState('');             // musician undefined at first due to async fetch api
    // useEffect runs once when component is rendered initially. then if [musician] changes, the effect will activate again and check if musician && musician.bio now exist so it can setBio if they are valid
    useEffect(() => {
        if (musician && musician.bio) {             // check if musician and musician.bio exist, i.e. are not null/undefined and have been fetched from api call to db
            setBio(musician.bio);
        }
    }, [musician]);                                 // effect will only activate if the values in the list change, i.e. the effect will run whenever musician changes

    // another state to keep track of edited version of bio
    const [editBio, setEditBio] = useState('');

    // function to save editBio state to original bio state and send back to db
    const save = async () => {
        if (editBio != bio) {
            const response = await fetch(api, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({Bio: editBio}),   // converts js value to json string, e.g. { x: 5, y: 6 } -> '{ "x": 5, "y": 6 }'
                credentials: "include"
            });
            if (!response.ok) {                         // ok property contains bool stating whetehr response was successful - status in range 200-299
                console.log("Error saving new bio...");
            }
            else {
                console.log("New bio saved!");
                setBio(editBio);
            }
        }
        else {
            console.log("Nothing to save!");
        }
    };

    // start with false since don't want to see modal until button is clicked
    const [show, setShow] = useState(false);

    // function to run when button is clicked
    const toggleModal = () => {
        // show contents of bio in modal box while editing state of editBio
        setEditBio(bio);
        // toggle modal state - switch between true/false by using setModal(opposite bool of current state)
        setShow(!show)
    };

    return <div className="bio">
        <h2>About</h2>
        <p>{bio}</p>
        <EditButton state={show} clickFunction={toggleModal} modal={
            <div className="modal-bio">
                <h2>About [Editing]</h2>

                {/* <textarea /> is a built-in browser componenet that lets u render a multi-line text input */}
                {/* controlled comoponents are form elements like input, textarea, or select that are managed by react state; the value of the form element is set and updated through react state */}
                {/* passing a value prop makes text area controlled - value controls the text inside the text area; when you pass value, you must also pass an onChange handler that updates the passed value */}
                {/* in the function passed to onChange:
                    e is the event object passed automatically by react whenever a dom event (e.g. typing into your keyboard) occurs
                    e.target is the dom element that triggered the event (e.g. <textarea>)
                    e.target.value is the current value inside e.target (e.g. the text inside <textarea>
                    so we're using setBio to change the value of the bio state to be the text value we're typing into the textarea element
                */}
                <textarea
                    placeholder="Provide a brief bio so your listeners can get to know you!"
                    value={editBio}
                    onChange={(e) => {setEditBio(e.target.value)}}
                />
                <button type="button" className="save" onClick={save}>SAVE</button>
                <button type="button" className="close" onClick={toggleModal}>CLOSE</button>
            </div>
        } />
    </div>
}