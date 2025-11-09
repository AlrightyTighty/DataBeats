import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import API from '../lib/api.js';
import '../css/AlbumCard.css';

function AlbumCard({album}) {
    // useNavigate() function returns NavigateFunction which takes as param a string to describe the destination location
    const navigate = useNavigate();

    // store image source
    const [imgSrc, setImgSrc] = useState(null);
    useEffect(() => {
        if (album.albumOrSongArtFileId) {
            (async () => {
                const response = await fetch(`${API}/api/art/${album.albumOrSongArtFileId}`);
                if (!response.ok) {
                    console.log("Failed to load album art...");
                }
                else {
                    const data = await response.json();
                    setImgSrc(`data:image/${data.fileExtension};base64,${data.fileData}`);
                }
            })();
        }
    }), [album.albumOrSongArtFileId];

    return <button type="button" className="album" onClick={() => {navigate(`/album/${album.albumId}`)}}>
        <div className="album-cover">
            <img src={imgSrc} alt="album cover"/>
        </div>
        <div className="album-info">
            <h3>{album.albumTitle}</h3>
            <p>{album.releaseDate}</p>
        </div>
    </button>
}

/* export component using default export for use in other files */
export default AlbumCard