import { use, useEffect, useState } from "react";
import API from '../lib/api.js'
import Topnav from "../Components/Topnav";
import styles from "./Settings.module.css";
import useAuthentication from "../hooks/useAuthentication.js";
import DeleteButton from "../Components/DeleteButton.jsx";
import { useNavigate, useResolvedPath } from "react-router";

export default function Settings() {

    const navigate = useNavigate();

    // state for profile/auth details
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [pfp, setPfp] = useState(null);
    const [username, setUsername] = useState('');

    // user info pulled from auth
    const userInfo = useAuthentication();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (userInfo === null) return;
        setFname(userInfo.fname);
        setLname(userInfo.lname);
        setPfp(userInfo.profilePictureFileId);
        setUsername(userInfo.username);
        setLoading(false);
    }, [userInfo]);

    // temp states while editing
    const [editFname, setEditFname] = useState(fname);
    const [editLname, setEditLname] = useState(lname);
    const [editPfp, setEditPfp] = useState(pfp);
    const [editUsername, setEditUsername] = useState('');
    const [oldPwd, setOldPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmNew, setConfirmNew] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);

    // Password validation requirements
    const requirementChecks = [
        { test: (p) => p.length >= 8, label: "At least 8 characters" },
        { test: (p) => /[a-z]/.test(p), label: "1 lowercase letter" },
        { test: (p) => /[A-Z]/.test(p), label: "1 uppercase letter" },
        { test: (p) => /\d/.test(p), label: "1 number" },
        { test: (p) => /[^A-Za-z0-9]/.test(p), label: "1 symbol" },
    ];

    const validatePassword = (password) => {
        return requirementChecks
            .filter((req) => !req.test(password))
            .map((r) => r.label);
    };

    const onPasswordChange = (e) => {
        const value = e.target.value;
        setNewPwd(value);
        setPasswordErrors(validatePassword(value));
    };

    // load values for temp states
    useEffect(() => {
        if (userInfo === null) return;
        setEditFname(fname);
        setEditLname(lname);
        setEditPfp(pfp);
        setEditUsername(username);
    }, [userInfo, fname, lname, pfp, username])

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

    async function saveAuth() {
        let changed = false;

        if (editUsername != username) {
            const response = await fetch(`${API}/api/user/${userInfo.userId}`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username: editUsername}),
                credentials: "include"
            });
            if (response.status === 409) {
                console.log("Username taken...");
            }
            else if (!response.ok) {
                console.log("Error updating username...");
            }
            else {
                changed = true;
                console.log("Username updated!");
                setUsername(editUsername);
            }
        }

        if (oldPwd && newPwd && confirmNew) {
            if (newPwd !== confirmNew) {
                console.log("Passwords do not match.");
            }
            else if (validatePassword(newPwd).length > 0) {
                console.log("Password does not meet requirements.");
            }
            else {
                const response = await fetch(`${API}/api/user/password/${userInfo.userId}`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        OldPassword: oldPwd,
                        NewPassword: newPwd
                    }),
                    credentials: "include"
                });
                if (!response.ok) {
                    const data = await response.json();
                    console.log("Error changing password:", data.message);
                }
                else {
                    changed = true;
                    console.log("Password changed!");
                    setOldPwd('');
                    setNewPwd('');
                    setConfirmNew('');
                    setPasswordErrors([]);
                }
            }
        }
        
        if (!changed) {
            console.log("Nothing to save!");
        }
    }

    // state for opening/closing delete modal
    const [showDelete, setShowDelete] = useState(false);
    const toggleDeleteModal = () => {
        setShowDelete(!showDelete);
    }

    if (loading) return <div>Loading...</div>
    return (
        <>
            <Topnav />
            <div className={styles.page}>
                <div className={styles.container}>
                    {/* Left side: Profile */}
                    <div className={styles.left}>
                        <h2>Profile Details</h2>

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
                                placeholder={userInfo.fname}
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
                                placeholder={userInfo.lname}
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
                        <h2>Login Credentials</h2>
                        <label>
                            Username
                            <input
                                className={styles.input}
                                type="text"
                                placeholder={userInfo.username}
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                            />
                        </label>

                        <label>
                            Old Password
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Enter old password"
                                value={oldPwd}
                                onChange={(e) => setOldPwd(e.target.value)}
                            />
                        </label>
                        
                        <label>
                            New Password
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Enter new password"
                                value={newPwd}
                                onChange={onPasswordChange}
                                aria-describedby="password-requirements"
                            />
                        </label>

                        {newPwd.length > 0 && passwordErrors.length > 0 && (
                            <ul
                                id="password-requirements"
                                className={styles.passwordRules}
                                aria-live="polite"
                            >
                                {passwordErrors.map((error) => (
                                    <li key={error} className={styles.invalid}>
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <label>
                            Confirm Password
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Re-enter new password"
                                value={confirmNew}
                                onChange={(e) => setConfirmNew(e.target.value)}
                            />
                        </label>

                        <button className={styles.save} onClick={saveAuth}>
                            Save Account
                        </button>
                        <DeleteButton strwhattodelete='account' api={`${API}/api/user/${userInfo.userId}`} state={showDelete} clickFunction={toggleDeleteModal} styles={styles.delete}/>
                    </div>
                </div>
            </div>
        </>
    );
}
