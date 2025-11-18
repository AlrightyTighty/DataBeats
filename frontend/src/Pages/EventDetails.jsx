import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import API from '../lib/api.js';
import Topnav from '../Components/Topnav';
import EditButton from '../Components/EditButton';
import DeleteButton from '../Components/DeleteButton';
import '../css/EventDetails.css';
import useAuthentication from '../hooks/useAuthentication.js';

export default function EventDetails() {

    // get event id from route params
    const paramsEventId = useParams().id;

    // get user auth info
    const userInfo = useAuthentication();

    // api endpoint
    const api = `${API}/api/event/${paramsEventId}`;

    // allow for rerouting if event does not exist
    const navigate = useNavigate();

    // state to store event details
    const [event, setEvent] = useState({});
    useEffect(() => {
        (async () => {
            const response = await fetch(api);
            if (!response.ok) {
                console.log("Error loading event details... it may not exist or was deleted...");
                navigate('/page-not-found');
            }
            else {
                const data = await response.json();
                setEvent(data);
            }
        })();
    }, [paramsEventId]);

    // temporary states to hold edits made to event
    const [editTitle, setEditTitle] = useState('');
    const [editPicFileId, setEditPicFileId] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editPrice, setEditPrice] = useState('');

    // store image source
    const [imgSrc, setImgSrc] = useState(null);
    useEffect(() => {
        if (event.eventPictureFileId) {
            // api call to EventController endpoint returns EventDto which already returns all needed image data; can use image data directly from dto instead of querying event_picture_file table to fetch image data
            setImgSrc(`data:image/${event.imageFileExtension};base64,${event.imageBase64}`)
        }
    }, [event.eventPictureFileId]);

    // function to save changes to db and event state
    const save = async () => {
        let changed = false;
        
        if (editTitle != event.title) {
            const response = await fetch(api, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title: editTitle}),           // title matches field in UpdateEventDto
                credentials: "include"
            });
            if (!response.ok) {
                console.log("Error updating event title...");
            }
            else {
                changed = true;
                console.log("Event title updated!")
                setEvent(prev => ({
                    ...prev,                // fill in all values currently stored in event state
                    title: editTitle        // overwrite this property
                }));
            }
        }

        if (editPicFileId != event.eventPictureFileId) {
            // upload new pic to event_picture_file table in db
            const formData = new FormData();
            formData.append("file", editPicFileId);         // editPicFileId state holds a File object
            const pic_response = await fetch(`${API}/api/event/file`, {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            if (!pic_response.ok) {
                console.log("Error uploading image file...")
            }
            else {
                console.log("Image uploaded to database...");
                // link newly uploaded pic to this event using eventPictureFileId property from server's response to POST request
                const data = await pic_response.json();
                const link_response = await fetch(api, {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({eventPictureFileId: data.eventPictureFileId}),
                    credentials: "include"
                });
                if (!link_response.ok) {
                    console.log("Error linking image upload to event...");
                }
                else {
                    changed = true;
                    console.log("Event banner updated!");
                    setEditPicFileId(data.eventPictureFileId);

                    // imageBase64, imageFileExtension, and imageFileName in event dto automatically updated by EventController after reference to pic file id is changed
                    // but need to refetch dto from backend via api to so frontend reflects updated image data
                    const reload_response = await fetch(api);
                    if (!reload_response.ok) {
                        console.log("Error reloading event details...");
                    }
                    else {
                        console.log("Event details reloaded!");
                        const updated_event = await reload_response.json();
                        setEvent(updated_event);
                    }
                }
            }
        }
        
        if (editDesc != event.eventDescription) {
            const response = await fetch(api, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({eventDescription: editDesc}),
                credentials: "include"
            });
            if (!response.ok) {
                console.log("Error updating event description...");
            }
            else {
                changed = true;
                console.log("Event description updated!");
                setEvent(prev => ({
                    ...prev,
                    eventDescription: editDesc
                }));
            }
        }

        if (editLocation != event.eventLocation) {
            const response = await fetch(api, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({eventLocation: editLocation}),
                credentials: "include"
            });
            if (!response.ok) {
                console.log("Error updating event location...");
            }
            else {
                changed = true;
                console.log("Event location updated!");
                setEvent(prev => ({
                    ...prev,
                    eventLocation: editLocation
                }));
            }
        }

        if (editTime != event.eventTime) {
            const response = await fetch(api, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({eventTime: editTime}),
                credentials: "include"
            })
            if (!response.ok) {
                console.log("Error updating event date/time...");
            }
            else {
                changed = true;
                console.log("Event date/time updated!");
                setEvent(prev => ({
                    ...prev,
                    eventTime: editTime
                }));
            }
        }
        
        if (editPrice != event.ticketPrice) {
            const response = await fetch(api, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ticketPrice: editPrice}),
                credentials: "include"
            })
            if (!response.ok) {
                console.log("Error updating ticket price...")
            }
            else {
                changed = true;
                console.log("Ticket price updated!");
                setEvent(prev => ({
                    ...prev,
                    ticketPrice: parseFloat(editPrice).toFixed(2)       // don't wait for backend, convert to float with two dec places from frontend on save
                }));
            }
        }

        if (!changed) {
            console.log("Nothing to save!");
        }
    }
    
    // state for opening/closing editing modal
    const [showEdit, setShowEdit] = useState(false);
    const toggleEditModal = () => {
        setShowEdit(!showEdit);
        setEditTitle(event.title);
        setEditPicFileId(event.eventPictureFileId);
        setEditDesc(event.eventDescription);
        setEditLocation(event.eventLocation);
        setEditTime(event.eventTime);
        setEditPrice(event.ticketPrice);
    }

    // state for opening/closing delete modal
    const [showDelete, setShowDelete] = useState(false);
    const toggleDeleteModal = () => {
        setShowDelete(!showDelete);
    }

    // check user auth details
    const [isMusician, setIsMusician] = useState(false);
    useEffect(() => {
        if (userInfo === null) return;      // userInfo not yet loaded from db - wait for useEffect to run again after userInfo is loaded
        if (userInfo.musicianId == event.musicianId) {
            setIsMusician(true);
        }
    }, [paramsEventId, userInfo]);

    // conditional render depending on whether user is the event's hosting musician - regular listeners cannot edit or delete
    if (!isMusician) {
        return <div className="event-details">
            <Topnav />
            <div className="banner">
                <img src={imgSrc} alt="concert promo" />
                <h1>{event.title}</h1>
            </div>
            <div className="info">
                <h3 className="event-desc">{event.eventDescription}</h3>
                <div className="musician-loc-time-price">
                    <h2>
                        Host: {event.musicianName}
                        <br></br>
                        Location: {event.eventLocation}
                        <br></br>
                        Time: {(new Date(event.eventTime)).toLocaleString()}
                        <br></br>
                        <br></br>
                        Admission: ${event.ticketPrice}
                    </h2>
                </div>
            </div>
        </div>
    }

    // user is event's hosting musician - can edit and delete
    return <div className="event-details">
        <Topnav />
        <div className="banner">
            <img src={imgSrc} alt="concert promo" />
            <h1>{event.title}</h1>
        </div>
        <div className="info">
            <h3 className="event-desc">Details: {event.eventDescription}</h3>
            <div className="musician-loc-time-price">
                <h2>
                    Host: {event.musicianName}
                    <br></br>
                    Location: {event.eventLocation}
                    <br></br>
                    Time: {(new Date(event.eventTime)).toLocaleString()}
                    <br></br>
                    <br></br>
                    Admission: ${event.ticketPrice}
                </h2>
            </div>
            <EditButton state={showEdit} clickFunction={toggleEditModal} modal={
                <div className="modal-event">
                    <h2 className="event-title">Event Title</h2>
                    <textarea className="edit-title"
                        placeholder="What's the event called?"
                        maxLength={200}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                    />

                    <h2 className="event-promo">Event Banner</h2>
                    <div className="image-upload">
                        <input type="file" accept="image/*" onChange={(e) => {setEditPicFileId(e.target.files[0]); console.log(e.target.files[0])}} />
                    </div>

                    <h2 className="event-desc">Description</h2>
                    <textarea className="edit-description"
                        placeholder="Provide a brief description on the event..."
                        maxLength={500}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <div className="char-count">{editDesc.length} / 500</div>

                    <h2 className="event-loc">Location</h2>
                    <textarea className="edit-loc"
                        placeholder="Where will the event be held?"
                        maxLength={200}
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                    />

                    <h2 className="event-time">Date/Time</h2>
                    <input className="edit-datetime"
                        type="datetime-local"
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                    />

                    <h2 className="event-price">Price</h2>
                    <textarea className="edit-price"
                        placeholder="Adjust the ticket price for this event..."
                        maxLength={7}
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                    />
                    
                    <button type="button" className="save" onClick={save}>SAVE</button>
                    <button type="button" className="done" onClick={toggleEditModal}>DONE</button>
                </div>
            }/>
        </div>
        <DeleteButton strwhattodelete='event' api={api} state={showDelete} clickFunction={toggleDeleteModal}/>
    </div>
}