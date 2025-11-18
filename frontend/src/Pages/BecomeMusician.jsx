import "../css/BecomeMusician.css";
import Topnav from "../Components/Topnav.jsx";
import API from '../lib/api.js';
import { useEffect, useState } from "react";
import useAuthentication from "../hooks/useAuthentication.js";
import { useNavigate } from "react-router";

export default function BecomeMusician() {

    const userInfo = useAuthentication();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (userInfo === null) return;
        setLoading(false);
    }, [userInfo]);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [pfp, setPfp] = useState('');
    const [company, setCompany] = useState('');

    const navigate = useNavigate();
    const becomeMusician = async () => {
        // load pfp to profile_picture_file table in db first
        const formData = new FormData();
        formData.append("file", pfp);
        const pic_response = await fetch(`${API}/api/images/profile-picture`, {
            method: "POST",
            body: formData,
            credentials: "include"
        });
        if (!pic_response.ok) {
            console.log("Error uploading image file...");
        }
        else {
            console.log("Image uploaded to database...");
            const pic_data = await pic_response.json();
            setPfp(pic_data.profilePictureFileId);
            // then link to create new musician
            const response = await fetch(`${API}/api/musician`, {
                method: "POST",
                headers: {
                    "X-UserId": userInfo.userId,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    MusicianName: name,
                    Bio: bio,
                    ProfilePictureFileId: pic_data.profilePictureFileId,
                    Label: company
                }),
                credentials: "include"
            });
            if (!response.ok) {
                console.log("Error initializing musician account...");
            }
            else {
                console.log("Becoming a musician...");
                response.json().then(data => console.log(`Musician profile created!`))
                navigate('/authtest');
            }
        }
    };

    if (loading) return <div>Loading...</div>
    return <div className="become-musician">
        <Topnav/>
        <form>
            <h1>Become a Musician</h1>
            <label className="become-musician-name">Stage Name:
                <input
                    type="text"
                    placeholder="What's your stage name?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>
            <label className="become-musician-bio">Bio:
                <textarea
                    type="text"
                    placeholder="Give your listeners a brief description of your background and music..."
                    maxLength={700}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
                <div className="char-count">{bio.length} / 700</div>
            </label>
            <label className="become-musician-pfp">Artist Image:
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {setPfp(e.target.files[0]); console.log(e.target.files[0])}}
                />
            </label>
            <label className="become-musician-company">Label:
                <input
                    type="text"
                    placeholder="Your label/company or standalone..."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                />
            </label>
            <button type="button" className="submit-button" onClick={becomeMusician}>SUBMIT</button>
        </form>
    </div>
}