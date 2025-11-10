import { useState, useEffect } from 'react'
import API from '../lib/api.js'
import '../css/MusicianPicName.css'
import EditButton from './EditButton'

export default function MusicianPicName({musician, api}) {

    // states for name and pic as defined in musician
    const [name, setName] = useState('');
    const [pic, setPic] = useState(null);
    useEffect(() => {
        if (musician && musician.musicianName) {
            setName(musician.musicianName);
        }
        if (musician && musician.profilePictureFileId) {
            setPic(musician.profilePictureFileId);
        }
    }, [musician]);
    
    // temporary states to store changes to name and pic before saving to db
    const [editName, setEditName] = useState('');
    const [editPic, setEditPic] = useState(null);

    // state to store image source that will be loaded onto frontend using the pfp file id in pic state
    const [imgSrc, setImgSrc] = useState(null);
    useEffect(() => {
        // prevent 400 bad request received from api call to pfp table (/api/images/profile-picture/null) by fetching image from db only after state pic (pfp file id) is valid and has been set from first useEffect that loads the musician
        if (pic) {
            (async () => {
                const response = await fetch(`${API}/api/images/profile-picture/${pic}`);
                if (!response.ok) {
                    console.log("Failed to fetch image...");
                }
                else {
                    console.log("Image fetch successful!");
                    // get request to pfp file table returns json with profilePictureFileId, fileName, fileExtension, and fileData (where actual image bytes are stored) as defined in pfp file dto
                    const data = await response.json();
                    // create data url from json data response
                        // data: tells the browser that what follows is raw data, not a normal url
                        // image/${data.fileExtension} specifies the media type as image/jpeg, image/png, etc. - whatever the fileExtension of the image is as defined in the data json dto
                        // base64 indicates the data should be base64-decoded as fileData is a base64 string representing the binary contents of the image
                        // data.fileData is the base64 string representing the actual image data itself
                    setImgSrc(`data:image/${data.fileExtension};base64,${data.fileData}`);
                }
            })();
        }
    }, [pic]);

    // save new editName to musician instance in db and to state name, and/or post new editPic as record in pfp file table and link file id pk to musician record fk in db, and save new pfp file id to state pic
    const save = async () => {
        // keep track of whether changes were made
        let changed = false;

        // api call to save new editName to db as musicianName and to state 'name'
        if (editName != name) {
            const name_response = await fetch(api, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({musicianName: editName}),
                credentials: "include"
            });
            if (!name_response.ok) {
                console.log("Error saving new name...");
            }
            else {
                changed = true;
                console.log("New name saved!");
                setName(editName);
            }
        }

        // api call to add editPic as new row in pfp file table, link to musician pfp id fk, and update state 'pic'
        if (editPic != pic) {
            // upload image to pfp file table
            const formData = new FormData();            // FormData allows you to capture data from html forms and contruct them into key-value pairs (form fields and their values) so they can easily be sent to a server asynchronously using fetch api; uses same format a form would use if encoding type were set to "multipart/form-data"
            formData.append("file", editPic);           // add new key-value pair to FormData obj with "file" as key (must match param name in controller) and editPic as its value - IMPORTANT: field name needs to match param in controller for model binding purposes, so we use "file"
            const pic_response = await fetch(`${API}/api/images/profile-picture`, {
                method: "POST",
                // never set the {"Content-Type": "multipart/form-data"} header manually for form data - let browser handle it for you since we can't add the boundary separator needed in Content-Type ourselves (browser generates and adds it to send Content-Type + boundary in header automatically)
                body: formData,
                credentials: "include"
            });
            if (!pic_response.ok) {
                console.log("Error uploading image file...");
            }
            else {
                console.log("Image uploaded to database...");
                const data = await pic_response.json(); // server response from api (defined in dto) returns profilePictureFileId, fileName, fileExtension, fileData
                // link image from pfp file table to musician by assigning musician pfp file id fk to image id of newly uploaded image
                const link_response = await fetch(api, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({profilePictureFileId: data.profilePictureFileId}),
                    credentials: "include"
                })
                if (!link_response.ok) {
                    console.log("Error linking image upload to profile...")
                }
                else {
                    changed = true;
                    console.log("Profile picture updated!");
                    setEditPic(data.profilePictureFileId);
                    setPic(data.profilePictureFileId);
                }
            }
        }

        // no changes made
        if (!changed) {
            console.log("Nothing to save!");
        }
    }
    
    // state to track opening/closing of modal (popup window)
    const [show, setShow] = useState(false);
    const toggleModal = () => {
        setShow(!show);
        setEditName(name);
        setEditPic(pic);
    }

    return <div className="pic-name">
        <img src={imgSrc} alt="profile picture" />
        <h1>{name}</h1>            {/* element positioned last in html code is shown on top; want name (h1) to overlap above image */}
        <EditButton state={show} clickFunction={toggleModal} modal={
            <div className="modal-picname">
                <h2 className="name-section">Name</h2>
                <textarea
                    placeholder="What's your stage name?"
                    maxLength={50}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                />

                <h2 className="image-section">Artist Image</h2>
                <div className="image-container">
                    {/* <input> elements with type="file" lets user choose "any image file" (image/*) from device storage */}
                    {/* user-selected files are returned by element's HTMLInputElement.files property, which is a FileList object (behaves like an array) containing a list of File objects */}
                    {/* we store first file - files[0] - from array into editPic; after the user selects a file, editPic contains a File object describing the first file (since we aren't accepting multiple file uploads) they selected */}
                    {/* each File object contains name, lastModified, lastModifiedDate, size, type, webkitRelativePath properties */}
                    <input type="file" accept="image/*" onChange={(e) => {setEditPic(e.target.files[0]); console.log(e.target.files[0])}} />
                </div>
                
                <button type="button" className="save" onClick={save}>SAVE</button>
                <button type="button" className="done" onClick={toggleModal}>DONE</button>
            </div>
        } />
    </div>
}