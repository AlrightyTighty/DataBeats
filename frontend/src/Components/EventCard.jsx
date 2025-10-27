import { useNavigate } from 'react-router'
import '../css/EventCard.css'

export default function EventCard({event}) {
    const navigate = useNavigate();

    return <button type="button" className="event" onClick={() => navigate('')}>
        <h3>{event.name}</h3>
        <p>
            <b>{event.location}</b>
            <br></br>
            {event.date_time}
        </p>
    </button>
}