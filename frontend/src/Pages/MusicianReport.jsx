import '../css/MusicianReport.css';
import { useState, useEffect } from 'react';
import API from '../lib/api.js';
import useAuthentication from '../hooks/useAuthentication.js';
import Topnav from '../Components/Topnav.jsx';
import Select from 'react-select'

export default function MusicianReport() {

    // get musician info from auth
    const userInfo = useAuthentication();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (userInfo === null) return;
        setLoading(false);
    }, [userInfo]);

    // album options - get all albums by musician
    const [albums, setAlbums] = useState([]);
    useEffect(() => {
        if (userInfo === null) return;
        (async () => {
            const response = await fetch(`${API}/api/album/by-musician/${userInfo.musicianId}`);
            if (!response.ok) {
                console.log("Error fetching artist's albums...");
            }
            else {
                response.json().then(data => setAlbums(data.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate))));
            }
        })();
    }, [userInfo]);

    // genre options - get all genres by musician
    const [genres, setGenres] = useState([]);
    useEffect(() => {
        if (userInfo === null) return;
        (async () => {
            const response = await fetch(`${API}/api/song/genres/by-musician/${userInfo.musicianId}`);
            if (!response.ok) {
                console.log("Error fetching artist's genres...");
            }
            else {
                response.json().then(data => setGenres(data));
            }
        })();
    }, [userInfo]);

    // FROM date constraint - musician creation date
    const [creationDate, setCreationDate] = useState("2025-08-18");
    useEffect(() => {
        if (userInfo === null) return;
        (async () => {
            const response = await fetch(`${API}/api/musician/${userInfo.musicianId}`);
            if (!response.ok) {
                console.log("Failed to load musician data...")
            }
            else {
                const result = await response.json()
                setCreationDate(result.timestampCreated.slice(0, 10));      // apply slice to keep only the date portion (yyyy-mm-dd) from index 0 up to index 9 (index of first char to exclude from substring is 10)
            }
        })();
    }, [userInfo]);

    // TO date constraint - today's date
    let today = new Date();
    let yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;                                  // january = month 0
    if (mm < 10) {
        mm = '0' + mm;
    }
    let dd = today.getDate();
    if (dd < 10) {
        dd = '0' + dd;
    }
    today = yyyy + '-' + mm + '-' + dd;
    
    // states for filtering by time/album/genre
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedAlbums, setSelectedAlbums] = useState([]);       // stores selected albums as array of albumId
    const [selectedGenres, setSelectedGenres] = useState([]);       // stores selected genres as array of strings

    // styling for imported <Select/> component
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'transparent',       // input box background
            color: '#d5cfcf',                   // text color
            borderColor: state.isFocused ? '#382c60ff' : '#d5cfcf',
            boxShadow: state.isFocused ? '0 0 0 1px #382c60ff' : 'none',
            '&:hover': { borderColor: '#382c60ff' }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#d5cfcf',       // dropdown background
            color: '#d5cfcf'                  // dropdown text color
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#382c60ff' : '#d5cfcf',
            color: state.isFocused ? '#fff' : '#382c60ff',
            cursor: 'pointer'
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#382c60ff',
            color: '#fff'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#fff'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#fff',
            ':hover': {
            backgroundColor: '#b32a2aff',
            color: '#fff'
            }
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#d5cfcf'
        })
    };

    // states to toggle what to show
    const [rating, setRating] = useState(false);
    const [likes, setLikes] = useState(false);
    const [streams, setStreams] = useState(false);

    // fetch report from backend
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState({});
    const fetchReport = async () => {
        const request = {
            MusicianId: userInfo.musicianId,
            ReleaseDateFrom: fromDate ? new Date(fromDate).toISOString() : null,
            ReleaseDateTo: toDate ? new Date(toDate).toISOString() : null,
            AlbumIds: selectedAlbums.length > 0 ? selectedAlbums : null,
            Genres: selectedGenres.length > 0 ? selectedGenres : null,
            IncludeAvgRating: rating,
            IncludeLikes: likes,
            IncludeStreams: streams
        }
        const response = await fetch(`${API}/api/musician-report`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(request),
            credentials: "include"
        });
        if (!response.ok) {
            console.log("Failed to generate report...");
        }
        else {
            console.log("Generating report...");
            response.json().then(data => {
                setReportData(data);
                setShowReport(true);
            });
        }
    };

    if (loading) return <div>Loading...</div>
    return <div className="stats-page">
        <Topnav />
        <div className="report">
            <h1>Your Stats</h1>
            <div className="by-date">
                <div className="from">
                    Released From <input
                        type="date"
                        min={creationDate}
                        max={today}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div className="to">
                    To <input
                        type="date"
                        min={creationDate}
                        max={today}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
            </div>
            <div className="by-album">
                <label>
                    Filter by Album:
                    <Select
                        // options to select from - react-select expects an array of { value: stored-data , label: display-text } objects
                        options={albums.map((album) => ({
                            value: album.albumId,
                            label: album.albumTitle
                        }))}
                        // items that should appear selected in ui - keep in albums array only those that have been added to selectedAlbums state
                        value={albums.filter(album => selectedAlbums.includes(album.albumId))
                                     .map(album => ({ value: album.albumId, label: album.albumTitle }))     // convert to react-select format for storing
                        }
                        // when user selects option(s), react-select returns array of objects selected = [ { value: , label: }, { value: , label: }, ... ] -> we store only the value property of each object into the selectedAlbums state
                        onChange={(selected) => {
                            setSelectedAlbums(selected ? selected.map(s => s.value) : []);
                        }}
                        // other props
                        isMulti={true}
                        isSearchable={true}
                        styles={customStyles}
                    />
                </label>
            </div>
            <div className="by-genre">
                <label>
                    Filter by Genre:
                    <Select
                        options={genres.map((genre) => ({
                            value: genre,
                            label: genre
                        }))}
                        value={genres.filter(genre => selectedGenres.includes(genre))
                                     .map(genre => ({ value: genre, label: genre }))
                        }
                        onChange={(selected) => {
                            setSelectedGenres(selected ? selected.map(s => s.value) : []);
                        }}
                        isMulti={true}
                        isSearchable={true}
                        styles={customStyles}
                    />
                </label>
            </div>
            <div className="to-show">
                <div className="avg-rating">
                    <label>Show Average Rating</label>
                    <input
                        type="checkbox"
                        checked={rating}
                        onChange={() => setRating(!rating)}
                    />
                </div>
                <div className="num-likes">
                    <label>Show Likes</label>
                    <input
                        type="checkbox"
                        checked={likes}
                        onChange={() => setLikes(!likes)}
                    />
                </div>
                <div className="num-streams">
                    <label>Show Streams</label>
                    <input
                        type="checkbox"
                        checked={streams}
                        onChange={() => setStreams(!streams)}
                    />
                </div>
            </div>
            <button type="button" className="generate-report" onClick={fetchReport}>GENERATE REPORT</button>
            {showReport && <div className="num-results-returned">{`${reportData.length} Songs Returned`}</div>}
            <div className="results-table">
                {showReport &&
                    <table>
                        <thead>
                            <tr>
                                <th>Release Date</th>
                                <th>Album</th>
                                <th>Song</th>
                                <th>Genres</th>
                                {rating && <th>Average Rating</th>}
                                {likes && <th>Likes</th>}
                                {streams && <th>Streams</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map(song => {
                                return (
                                    <tr key={`${song.albumTitle}-${song.songName}`}>
                                        <td>{new Date(song.releaseDate).toLocaleString()}</td>
                                        <td>{song.albumTitle}</td>
                                        <td>{song.songName}</td>
                                        <td>{song.genres}</td>
                                        {rating && <td>{song.avgRating ?? '-'}</td>}
                                        {likes && <td>{song.likes}</td>}
                                        {streams && <td>{song.streams}</td>}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    </div>
}