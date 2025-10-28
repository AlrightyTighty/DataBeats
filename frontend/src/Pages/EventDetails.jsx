import '../css/EventDetails.css'
import Topnav from '../Components/Topnav';

// pull from db
import promoImg from '../dummy-data-imgs/eventcover.jpg'

export default function EventDetails() {

    // pull from db
    const event = {
        id: 'aiobveaegwboive',                              // UNUSED
        img: promoImg,
        name: 'Another Concert Teeheehehehehehehhe',
        type: 'Concert',
        location: 'New York City, NY',
        date_time: 'February 12, 2024 @ 7:00pm',
        ticket_price: 80,
    }

    return <div className="event-details">
        <Topnav />
        <div className="banner">
            <img src={promoImg} alt="concertpromo" />
            <h1>{event.name}</h1>
        </div>
        <div className="info">
            <h3 className="event-type">{event.type}</h3>
            <div className="place-time-price">
                <h2>
                    {event.location}
                    <br></br>
                    {event.date_time}
                    <br></br>
                    <br></br>
                    ${event.ticket_price}
                </h2>
            </div>
        </div>
    </div>
}