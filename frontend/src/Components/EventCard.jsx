import { useNavigate } from 'react-router'
import '../css/EventCard.css'

export default function EventCard({event}) {
    const navigate = useNavigate();

    return <button type="button" className="event" onClick={() => navigate(`/event/${event.eventId}`)}>
        <h3>{event.title}</h3>
        <p>
            <b>Time: {event.eventTime}</b>
            <br></br>
            <br></br>
            Admission: ${event.ticketPrice}
        </p>
    </button>
}