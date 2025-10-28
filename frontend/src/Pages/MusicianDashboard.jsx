import '../css/MusicianDashboard.css'
import Topnav from '../Components/Topnav';
import AlbumCard from '../Components/AlbumCard';
import EventCard from '../Components/EventCard';
import MusicianPicName from '../Components/MusicianPicName'
import Bio from '../Components/Bio'
import EditButton from '../Components/EditButton'

// pull from db
import mickey from '../dummy-data-imgs/mickey.png'
import stars from '../dummy-data-imgs/stars.jpg'
import sun from '../dummy-data-imgs/sun.jpg'
import mountain from '../dummy-data-imgs/mountain.jpg'

function MusicianDashboard() {

    // pull from db
    const musician = {
        id: "woiga9wf22894109rwhpfv",
        pfp: mickey,
        name: "Mickey Mouse",
        label: "WeeWoo Studios",
        bio: `
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
            blah blah bleh bleh blah bleh blah bleh
        `,
    };

    // pull from db
    const albums = [
        {id: 1, title: "Stars", release_date: "2020", url: stars},
        {id: 2, title: "Sun", release_date: "2021", url: sun},
        {id: 3, title: "Mountain Mountain Mountain Mountain", release_date: "2022", url: mountain},
    ];

    // pull from db
    const events = [
        {id: 1, name: "Concert Weeeeee", location: "Houston, TX", date_time: "August 13, 2023 @ 7:00pm"},
        {id: 1, name: "Fan Meet & Greet", location: "Salt Lake City, UT", date_time: "May 6, 2025 @ 3:00pm"},
        {id: 1, name: "Collab Event", location: "Glenwood Springs, CO", date_time: "December 15, 2026 @ 6:00pm"},
        {id: 1, name: "Another Concert Teeheehehehehehehhe", location: "New York City, NY", date_time: "February 12, 2024 @ 7:00pm"},
    ]

    return (
        <div className="dashboard">
            <Topnav />
            <div className="stats">
                <div className="followers">
                    <h1>67,676,767</h1>
                    <p>FOLLOWERS</p>
                </div>
                <div className="monthly">
                    <h1>676,767</h1>
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
                    <MusicianPicName musician={musician} />
                </div>
                <div className="label">
                    <h3>{musician.label}</h3>
                </div>
                <div className="musician-bio">
                    <Bio musician={musician} />
                </div>
                <div className="share">
                    <a href={`https://yadiyadiya.com/share?link=${musician.id}`}>https://yadiyadiya.com/share?link={musician.id}</a>
                </div>
            </div>
        </div>
    )
}

export default MusicianDashboard