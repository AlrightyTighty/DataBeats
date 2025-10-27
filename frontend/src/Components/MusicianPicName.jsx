import '../css/MusicianPicName.css'
import EditButton from './EditButton'

export default function MusicianPicName({musician}) {
    return <div className="pic-name">
        <img src={musician.pfp} alt="profile picture" />
        <h1>{musician.name}</h1>
        <EditButton />
    </div>
}