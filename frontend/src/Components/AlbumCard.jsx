import { useNavigate } from 'react-router'
import '../css/AlbumCard.css'

function AlbumCard({album}) {
    const navigate = useNavigate();         // useNavigate() function returns NavigateFunction which takes as param a string to describe the destination location

    return <button type="button" className="album" onClick={() => navigate(`/createalbum/edit/:${album.id}`)}>
        <div className="album-cover">
            <img src={album.url} alt={album.title}/>
        </div>
        <div className="album-info">
            <h3>{album.title}</h3>
            <p>{album.release_date}</p>
        </div>
    </button>
}

/* export component using default export for use in other files */
export default AlbumCard