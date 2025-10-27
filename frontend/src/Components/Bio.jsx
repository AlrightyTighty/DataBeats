import '../css/Bio.css'
import EditButton from './EditButton'

export default function Bio({musician}) {
    return <div className="bio">
        <h2>About</h2>
        <p>{musician.bio}</p>
        <EditButton />
    </div>
}