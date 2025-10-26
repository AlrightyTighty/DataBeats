import '../css/AlbumCard.css'

function AlbumCard({album}) {
    return <div className="album-card">                     {/* jsx className keyword defines css classes */}
        <div className="album-cover">
            <img src={album.url} alt={album.title}/>        {/* variables enclosed in braces {} */}
        </div>
        <div className="album-info">
            <h3>{album.title}</h3>
            <p>{album.release_date}</p>
        </div>
    </div>
}

/* export component using default export for use in other files */
export default AlbumCard