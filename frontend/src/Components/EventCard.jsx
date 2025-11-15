import { useNavigate } from 'react-router'
import { useState, useEffect } from 'react';
import '../css/EventCard.css'

export default function EventCard({event}) {
    const navigate = useNavigate();
    
    const [imgSrc, setImgSrc] = useState(null);
    useEffect(() => {
        if (event.eventPictureFileId) {
            setImgSrc(`data:image/${event.imageFileExtension};base64,${event.imageBase64}`)
        }
    }, [event.eventPictureFileId]);

    console.log(event);
    return <button type="button" className="event" onClick={() => {navigate(`/event/${event.eventId}`)}}>
        <div className="event-promo">
            <img src={imgSrc} alt="event promo"/>
        </div>
        <div className="event-info">
            <h3>{event.title}</h3>
            <p>
                <b>Location: {event.eventLocation}</b>
                <br></br>
                <b>Time: {(new Date(event.eventTime)).toLocaleString()}</b>
                <br></br>
                <br></br>
                Admission: ${event.ticketPrice}
            </p>
        </div>
    </button>
}