import { useParams } from 'react-router';               // returns an object of key-value pairs of the dynamic params from the current URL that were matched by the routes
import { useState, useEffect } from 'react';            // react hooks - functions that let you "hook into" (access) React state and other features from components w/o using classes
import '../css/MusicianDashboard.css';
import Topnav from '../Components/Topnav';
import AlbumCard from '../Components/AlbumCard';
import EventCard from '../Components/EventCard';
import MusicianPicName from '../Components/MusicianPicName';
import Bio from '../Components/Bio';

export default function MusicianDashboard() {
    // get musician id from path params - useParams returns an object containing the dynamic route parameters
    // if route /musician-dashboard/:id is matched by /musician-dashboard/17 then useParams() will return {id: '17'}, an object with all the route params as key-value pairs
    const musicianId = useParams();

    // api endpoint urls
    const musicianURL = `http://localhost:5062/api/musician/${musicianId.id}`;      // access id from musicianId object returned by useParams() and append to api url

    // useState hook allows you to track state in a component; it accepts an initial state and returns two values, current state and function to update state
    // destructuring returned values from useState so that [current state, function to update state] = useState(set initial value of state)
    const [musician, setMusician] = useState('');
    // useEffect allows you to synchronize component with external system - perform side effects like fetching data, directly updating the DOM, etc. in componenets
    // side effects run after the component has rendered and can be anything that affects something outside the scope of the current function
    // useEffect accepts two arguments, 2nd is opt - useEffect(function, dependency)
    useEffect(() => {
        // useEffect cannot accept async functions bc async functions return a Promise
        // react expects the function passed to useEffect to return either void or a cleanup function, and cleanup functions need to be sync to ensure they run at the correct time
        // need to wrap the async function inside the effect
        (async () => {
            // fetch info from db via api call with fetch(endpoint) ... endpoint routes specified in controllers
            // fetch api fetches url and returns a Promise, need to await for it to resolve or use .then to synchronize
            const response = await fetch(musicianURL);
            if (!response.ok) {
                console.log("Failed to load musician data...");
            }
            else {
                // convert server's response to json object - json method also returns a Promise; need to await or use .then
                // finally, set values for musician based on data received
                response.json().then(data => setMusician(data));
            }
        })();
    }, []);                                                     // useEffect runs after every render by default; empty array [] as 2nd param (dependency) means it runs once after first render - i.e. run this effect only if the values in [] have changed since last render
    
    // state to store array of albums by a musician
    // albums is an array of Album object, each containing the albumId, albumTitle, albumArtImage, releaseDate, etc. of the album
    const [albums, setAlbums] = useState([]);
    useEffect(() => {
        (async () => {
            const response = await fetch(`http://localhost:5062/api/album/by-musician/${musicianId.id}`);
            if (!response.ok) {
                console.log("Error fetching artist's albums...");
            }
            else {
                response.json().then(data => setAlbums(data));
            }
        })();
    }, []);

    // state to store array of events hosted by a musician
    // events is an array of Event objects, each containing the eventId, title, eventDescription, eventPictureFileId, eventTime, ticketPrice, musicianName, etc. of the Event
    const [events, setEvents] = useState([]);
    useEffect(() => {
        (async () => {
            const response = await fetch(`http://localhost:5062/api/event/by-musician/${musicianId.id}`);
            if (!response.ok) {
                console.log("Error fetching artist's events...");
            }
            else {
                response.json().then(data => setEvents(data));
            }
        })();
    }, []);
    
    return (
        <div className="dashboard">
            <Topnav />
            <div className="stats">
                <div className="followers">
                    <h1>{musician.followerCount}</h1>
                    <p>FOLLOWERS</p>
                </div>
                <div className="monthly">
                    <h1>{musician.monthlyListenerCount}</h1>
                    <p>MONTHLY LISTENERS</p>
                </div>
            </div>
            <div className="albums-events">
                <div className="albums">
                    <div className="albums-section-title">
                        <h2>Albums</h2>
                    </div>
                    <div className="album-cards">
                        {albums.map((album) => {
                            return <AlbumCard album={album}/>;
                        })}
                    </div>
                </div>
                <div className="events">
                    <div className="events-section-title">
                        <h2>Events</h2>
                    </div>
                    <div className="event-cards">
                        {events.map((event) => {
                            return <EventCard event={event}/>;
                        })}
                    </div>
                </div>
            </div>
            <div className="artist-info">
                <div className="name-pfp">
                    <MusicianPicName musician={musician} api={musicianURL}/>
                </div>
                <div className="label">
                    <h3>{musician.label}</h3>
                </div>
                <div className="musician-bio">
                    <Bio musician={musician} api={musicianURL}/>
                </div>
                <div className="share">
                    <a href={`http://localhost:5173/artist/${musician.musicianId}`}>http://localhost:5173/artist/{musician.musicianId}</a>
                </div>
            </div>
        </div>
    )
}