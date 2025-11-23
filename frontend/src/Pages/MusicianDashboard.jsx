import { useNavigate, useParams } from 'react-router';               // returns an object of key-value pairs of the dynamic params from the current URL that were matched by the routes
import { useState, useEffect, useCallback } from 'react';                         // react hooks - functions that let you "hook into" (access) React state and other features from components w/o using classes
import API from '../lib/api.js';
import '../css/MusicianDashboard.css';
import Topnav from '../Components/Topnav';
import AlbumCard from '../Components/AlbumCard';
import EventCard from '../Components/EventCard';
import MusicianPicName from '../Components/MusicianPicName';
import Bio from '../Components/Bio';
import AddButton from '../Components/AddButton';
import ViewStats from '../Components/ViewStatsButton.jsx';
import useAuthentication from '../hooks/useAuthentication.js';

export default function MusicianDashboard() {
    // get musician id from path params - useParams returns an object containing the dynamic route parameters
    // if route /musician-dashboard/:id is matched by /musician-dashboard/17 then useParams() will return {id: '17'}, an object with all the route params as key-value pairs
    const paramsMusicianId = useParams();

    // wait to load user info, then reroute if user not authorized
    const [loading, setLoading] = useState(true);
    const userInfo = useAuthentication();
    const navigate = useNavigate();
    useEffect(() => {
        // userInfo not yet loaded from api call -> wait
        if (userInfo === null) return;

        // passed userInfo null check -> userInfo loaded
        setLoading(false);

        // user is not the musician at this route
        if (userInfo.musicianId != paramsMusicianId.id) {
            console.log("Unauthorized!");
            navigate('/dashboard');
        }
    }, [paramsMusicianId, userInfo]);

    // api endpoint urls
    const musicianURL = `${API}/api/musician/${paramsMusicianId.id}`;      // access id from paramsMusicianId object returned by useParams() and append to api url

    // useState hook allows you to track state in a component; it accepts an initial state and returns two values, current state and function to update state
    // destructuring returned values from useState so that [current state, function to update state] = useState(set initial value of state)
    const [musician, setMusician] = useState({});
    const [followerCount, setFollowerCount] = useState(0);

    const loadFollowerCount = useCallback(async () => {
        if (!musician.userId) return;
        try {
            const followersRes = await fetch(`${API}/api/follow/followers/${musician.userId}`, {
                credentials: "include",
            });
            if (followersRes.ok) {
                const followers = await followersRes.json();
                setFollowerCount(Array.isArray(followers) ? followers.length : 0);
            } else {
                setFollowerCount(0);
            }
        } catch {
            setFollowerCount(0);
        }
    }, [musician.userId]);

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
                navigate('/page-not-found');
            }
            else {
                // convert server's response to json object - json method also returns a Promise; need to await or use .then
                // finally, set values for musician based on data received
                response.json().then(data => setMusician(data));
            }
        })();
    }, []);                                                     // useEffect runs after every render by default; empty array [] as 2nd param (dependency) means it runs once after first render - i.e. run this effect only if the values in [] have changed since last render

    // Load follower count when musician data is available
    useEffect(() => {
        loadFollowerCount();
    }, [loadFollowerCount]);
    
    // state to store array of albums by a musician
    // albums is an array of Album objects, each containing the albumId, albumTitle, albumArtImage, releaseDate, etc. of the album
    const [albums, setAlbums] = useState([]);
    useEffect(() => {
        (async () => {
            const response = await fetch(`${API}/api/album/by-musician/${paramsMusicianId.id}`);
            if (!response.ok) {
                console.log("Error fetching artist's albums...");
            }
            else {
                // set albums state to be the json data returned from the api - the array of Album objects - sorted by release date in ascending order
                response.json().then(data => setAlbums(data.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))));
            }
        })();
    }, []);

    // state to store array of events hosted by a musician
    // events is an array of Event objects, each containing the eventId, title, eventDescription, eventPictureFileId, eventLocation, eventTime, ticketPrice, musicianName, etc. of the Event
    const [events, setEvents] = useState([]);
    useEffect(() => {
        (async () => {
            const response = await fetch(`${API}/api/event/by-musician/${paramsMusicianId.id}`);
            if (!response.ok) {
                console.log("Error fetching artist's events...");
            }
            else {
                // set events state to be the json data returned from the api - the array of Event objects - sorted by event time in ascending order
                response.json().then(data => setEvents(data.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime))));
            }
        })();
    }, []);
    
    // don't render dashboard until user is authenticated - cannot conditionally call hooks; always call them but conditionally render content AFTER hooks run
    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard">
            <Topnav />
            <div className="stats">
                <div className="followers">
                    <h1>{followerCount}</h1>
                    <p>FOLLOWERS</p>
                </div>
                <div className="monthly">
                    <h1>{musician.monthlyListenerCount}</h1>
                    <p>MONTHLY LISTENERS</p>
                </div>
                <ViewStats pos="stats-button" route="/stats"/>
            </div>
            <div className="albums-events">
                <div className="albums">
                    <AddButton route={'/createalbum'}/>
                    <div className="albums-section-title">
                        <h2>Albums</h2>
                    </div>
                    <div className="album-cards">
                        {albums.map((album) => {
                            return <AlbumCard key={album.albumId} album={album}/>;
                        })}
                    </div>
                </div>
                <div className="events">
                    <AddButton route={'/createevent'}/>
                    <div className="events-section-title">
                        <h2>Events</h2>
                    </div>
                    <div className="event-cards">
                        {events.map((event) => {
                            return <EventCard key={event.eventId} event={event}/>;
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
            </div>
        </div>
    )
}