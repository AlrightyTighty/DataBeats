import '../css/MusicianPicName.css'
import EditButton from './EditButton'

export default function MusicianPicName({musician}) {
    return <div className="pic-name">
        <img src={musician.profilePictureId} alt="profile picture" />
        <h1>{musician.musicianName}</h1>
        <EditButton />
    </div>
}