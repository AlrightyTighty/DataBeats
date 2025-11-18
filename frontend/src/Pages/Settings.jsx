import { use, useEffect, useState } from "react";
import API from '../lib/api.js'
import Topnav from "../Components/Topnav";
import styles from "./Settings.module.css";
import useAuthentication from "../hooks/useAuthentication.js";

export default function Settings() {

    // state for profile details
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [pfp, setPfp] = useState(null);

    // user info pulled from auth
    const userInfo = useAuthentication();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (userInfo === null) return;
        setLoading(false);
        setFname(userInfo.fname);
        setLname(userInfo.lname);
        setPfp(userInfo.profilePictureFileId);
    }, [userInfo]);

    // load image
    const [imgSrc, setImgSrc] = useState(null);
    useEffect(() => {
        if (pfp) {
            (async () => {
                const response = await fetch(`${API}/api/images/profile-picture/${pfp}`);
                if (!response.ok) {
                    console.log("Failed to fetch image...");
                }
                else {
                    console.log("Image fetch successful!");
                    const data = await response.json();
                    setImgSrc(`data:image/${data.fileExtension};base64,${data.fileData}`);
                }
            })();
        }
    }, [pfp]);

    // temp states while editing
    const [editFname, setEditFname] = useState(fname);
    const [editLname, setEditLname] = useState(lname);
    const [editPfp, setEditPfp] = useState(pfp);
    const saveProfile = async () => {
        let changed = false;

        if (editFname !== fname) {
            const response = await fetch(`${API}/api/user/${userInfo.userId}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({fname: editFname}),
                credentials: "include"
            });
            if (!response.ok) {
                console.log("Error updating first name...");
            }
            else {
                changed = true;
                console.log("First name updated!");
                setFname(editFname);
            }
        }

        if (editLname !== lname) {
            const response = await fetch(`${API}/api/user/${userInfo.userId}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({lname: editLname}),
                credentials: "include"
            });
            if (!response.ok) {
                console.log("Error updating last name...");
            }
            else {
                changed = true;
                console.log("Last name updated!");
                setLname(editLname);
            }
        }

        if (editPfp != pfp) {
            const formData = new FormData();
            formData.append("file", editPfp);
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
                const data = await pic_response.json();
                const link_response = await fetch(`${API}/api/user/${userInfo.userId}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({profilePictureFileId: data.profilePictureFileId}),
                    credentials: "include"
                })
                if (!link_response.ok) {
                    console.log("Error linking image upload to profile...")
                }
                else {
                    changed = true;
                    console.log("Profile picture updated!");
                    setEditPfp(data.profilePictureFileId);
                    setPfp(data.profilePictureFileId);
                }
            }
        }

        if (!changed) {
            console.log("Nothing to save!");
        }
    }
    
    const [profile, setProfile] = useState({
        fname: "",
        lname: "",
        profilePictureFileId: null,
    });

    const [auth, setAuth] = useState({
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");

/*     useEffect(() => {
        (async () => {
            const res = await fetch(`${API}/api/user/${userInfo.userId}`);
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    username: data.username || "",
                    fname: data.fname || "",
                    lname: data.lname || "",
                    profilePictureFileId: data.profilePictureFileId || null,
                });
                if (data.profilePictureFileId)
                    setimgSrc(`${API}/api/file/view/${data.profilePictureFileId}`);
            }

            const resAuth = await fetch(
                `${API}/api/authentication/${userInfo.userId}`
            );
            if (resAuth.ok) {
                const data = await resAuth.json();
                setAuth({
                    email: data.email || "",
                    password: "",
                });
            }
        })();
    }, []); */

    async function uploadProfilePic() {
        if (!file) return null;
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API}/api/file/upload`, {
            method: "POST",
            body: formData,
        });
        if (res.ok) {
            const { fileId } = await res.json();
            return fileId;
        }
        return null;
    }

   /*  async function saveProfile() {
        setMessage("");
        let newPicId = profile.profilePictureFileId;
        if (file) {
            const uploaded = await uploadProfilePic();
            if (uploaded) newPicId = uploaded;
        }

        const res = await fetch(`${API}/api/user/${userInfo.userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: profile.username,
                fname: profile.fname,
                lname: profile.lname,
                profilePictureFileId: newPicId,
            }),
        });

        setMessage(res.ok ? "Profile info updated." : "Error updating profile.");
    } */

    async function saveAuth() {
        setMessage("");
        const res = await fetch(`${API}/api/authentication/${userInfo.userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: auth.email,
                password: auth.password,
            }),
        });

        setMessage(
            res.ok ? "Account info updated." : "Error updating account info."
        );
    }

    //soft delete / disable account
    async function deleteAccount() {
        setMessage("");

        const confirmDelete = window.confirm(
            "Are you sure you want to delete your account? " +
                "You will not be able to log in again."
        );
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${API}/api/user/${userInfo.userId}`, {
                method: "DELETE",
            });

            if (res.ok || res.status === 204) {
                setMessage("Account deleted. You will be signed out.");
                // redirect after a short delay
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1200);
            } else {
                setMessage("Error deleting account.");
            }
        } catch (e) {
            setMessage("Error deleting account.");
        }
    }

    if (loading) return <div>Loading...</div>
    return (
        <>
            <Topnav />
            <div className={styles.page}>
                <div className={styles.container}>
                    {/* Left side: Profile */}
                    <div className={styles.left}>
                        <h2>Profile Info</h2>

                        <div className={styles.picWrap}>
                            <img src={imgSrc} className={styles.pic} alt="Profile" />
                            <input
                                className={styles.input}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setEditPfp(e.target.files[0]);
                                }}
                            />
                        </div>

                        <label>
                            First Name
                            <input
                                className={styles.input}
                                value={editFname}
                                onChange={(e) =>
                                    setEditFname(e.target.value)
                                }
                            />
                        </label>

                        <label>
                            Last Name
                            <input
                                className={styles.input}
                                value={editLname}
                                onChange={(e) =>
                                    setEditLname(e.target.value)
                                }
                            />
                        </label>

                        <button className={styles.save} onClick={saveProfile}>
                            Save Profile
                        </button>
                    </div>

                    {/* Right side: Authentication */}
                    <div className={styles.right}>
                        <h2>Account (Authentication)</h2>
                        <label>
                            Email
                            <input
                                className={styles.input}
                                type="email"
                                value={auth.email}
                                onChange={(e) => setAuth({ ...auth, email: e.target.value })}
                            />
                        </label>

                        <label>
                            Password
                            <input
                                className={styles.input}
                                type="password"
                                value={auth.password}
                                onChange={(e) => setAuth({ ...auth, password: e.target.value })}
                                placeholder="Enter new password"
                            />
                        </label>

                        <button className={styles.save} onClick={saveAuth}>
                            Save Account
                        </button>

                        {/*delete account button */}
                        <button className={styles.delete} onClick={deleteAccount}>
                            Delete Account
                        </button>

                        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
                    </div>
                </div>
            </div>
        </>
    );
}
