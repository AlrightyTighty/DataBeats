import Topnav from '../Components/Topnav';
import EditButton from '../Components/EditButton'
import '../css/EventDetails.css'

// pull from db
import promoImg from '../dummy-data-imgs/eventcover.jpg'

export default function EventDetails() {

    // pull from db
    const event = {
        id: 4,
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
            <EditButton />
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
            <EditButton />
            <div className="share-link">
                <a href={`https://yadiyadiya.com/share?link=${event.id}`}>https://yadiyadiya.com/share?link={event.id}</a>
            </div>
        </div>
    </div>
}