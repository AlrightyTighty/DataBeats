import Topnav from '../Components/Topnav';
import EditButton from '../Components/EditButton'
import '../css/EventDetails.css'

export default function EventDetails({event}) {
    return <div className="event-details">
        <Topnav />
        <div className="banner">
            <img src={event.eventPictureFileId} alt="concert promo" />
            <h1>{event.title}</h1>
            <EditButton />
        </div>
        <div className="info">
            <h3 className="event-desc">{event.eventDescription}</h3>
            <div className="musician-time-price">
                <h2>
                    {event.musicianName}
                    <br></br>
                    {event.eventTime}
                    <br></br>
                    <br></br>
                    ${event.ticketPrice}
                </h2>
            </div>
            <EditButton />
            <div className="share-link">
                <a href={`http://localhost:5173/event/${event.eventId}`}>http://localhost:5173/event/{event.eventId}</a>
            </div>
        </div>
    </div>
}