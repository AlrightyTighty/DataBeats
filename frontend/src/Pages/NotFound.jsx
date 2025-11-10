import { Link } from 'react-router'
import sadDanbo from '../assets/notfoundsadimage.png';
import '../css/NotFound.css';

export default function NotFound() {
    return <div className="not-found">
        <h1>Page Not Found!</h1>
        <h2>
            <Link to='/authtest'>Back to Home</Link>
        </h2>
        <img src={sadDanbo} alt="sad-danbo"/>
    </div>
}