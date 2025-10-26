import '../css/EventCard.css'

export default function EventCard({event}) {
    return <div className="event">
        <h3>{event.name}</h3>
        <p>
            <b>{event.location}</b>
            <br></br>
            {event.date_time}
        </p>
    </div>
}