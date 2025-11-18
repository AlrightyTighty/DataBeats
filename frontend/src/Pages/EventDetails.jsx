import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import API from "../lib/api.js";
import Topnav from "../Components/Topnav";
import EditButton from "../Components/EditButton";
import DeleteButton from "../Components/DeleteButton";
import useAuthentication from "../hooks/useAuthentication.js";
import styles from "./EventDetails.module.css";

export default function EventDetails() {
  const paramsEventId = useParams().id;
  const userInfo = useAuthentication();
  const api = `${API}/api/event/${paramsEventId}`;
  const navigate = useNavigate();

  const [event, setEvent] = useState({});
  const [imgSrc, setImgSrc] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await fetch(api);
      if (!response.ok) {
        console.log(
          "Error loading event details... it may not exist or was deleted..."
        );
        navigate("/page-not-found");
      } else {
        const data = await response.json();
        setEvent(data);
      }
    })();
  }, [paramsEventId, api, navigate]);

  useEffect(() => {
    if (
      event.eventPictureFileId &&
      event.imageBase64 &&
      event.imageFileExtension
    ) {
      setImgSrc(
        `data:image/${event.imageFileExtension};base64,${event.imageBase64}`
      );
    } else {
      setImgSrc(null);
    }
  }, [event.eventPictureFileId, event.imageBase64, event.imageFileExtension]);

  // temp edit state
  const [editTitle, setEditTitle] = useState("");
  const [editPicFileId, setEditPicFileId] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const save = async () => {
    let changed = false;

    if (editTitle !== event.title) {
      const response = await fetch(api, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
        credentials: "include",
      });
      if (!response.ok) {
        console.log("Error updating event title...");
      } else {
        changed = true;
        setEvent((prev) => ({ ...prev, title: editTitle }));
      }
    }

    if (editPicFileId && editPicFileId !== event.eventPictureFileId) {
      const formData = new FormData();
      formData.append("file", editPicFileId);

      const picResponse = await fetch(`${API}/api/event/file`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!picResponse.ok) {
        console.log("Error uploading image file...");
      } else {
        const data = await picResponse.json();
        const linkResponse = await fetch(api, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventPictureFileId: data.eventPictureFileId }),
          credentials: "include",
        });

        if (!linkResponse.ok) {
          console.log("Error linking image upload to event...");
        } else {
          changed = true;
          setEditPicFileId(data.eventPictureFileId);

          const reloadResponse = await fetch(api);
          if (!reloadResponse.ok) {
            console.log("Error reloading event details...");
          } else {
            const updated = await reloadResponse.json();
            setEvent(updated);
          }
        }
      }
    }

    if (editDesc !== event.eventDescription) {
      const response = await fetch(api, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventDescription: editDesc }),
        credentials: "include",
      });
      if (!response.ok) {
        console.log("Error updating event description...");
      } else {
        changed = true;
        setEvent((prev) => ({ ...prev, eventDescription: editDesc }));
      }
    }

    if (editLocation !== event.eventLocation) {
      const response = await fetch(api, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventLocation: editLocation }),
        credentials: "include",
      });
      if (!response.ok) {
        console.log("Error updating event location...");
      } else {
        changed = true;
        setEvent((prev) => ({ ...prev, eventLocation: editLocation }));
      }
    }

    if (editTime !== event.eventTime) {
      const response = await fetch(api, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventTime: editTime }),
        credentials: "include",
      });
      if (!response.ok) {
        console.log("Error updating event date/time...");
      } else {
        changed = true;
        setEvent((prev) => ({ ...prev, eventTime: editTime }));
      }
    }

    if (editPrice !== event.ticketPrice) {
      const response = await fetch(api, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketPrice: editPrice }),
        credentials: "include",
      });
      if (!response.ok) {
        console.log("Error updating ticket price...");
      } else {
        changed = true;
        setEvent((prev) => ({
          ...prev,
          ticketPrice: parseFloat(editPrice).toFixed(2),
        }));
      }
    }

    if (!changed) {
      console.log("Nothing to save!");
    }
  };

  // edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const toggleEditModal = () => {
    setShowEdit((v) => !v);
    setEditTitle(event.title ?? "");
    setEditPicFileId(event.eventPictureFileId ?? "");
    setEditDesc(event.eventDescription ?? "");
    setEditLocation(event.eventLocation ?? "");
    setEditTime(event.eventTime ?? "");
    setEditPrice(event.ticketPrice ?? "");
  };

  // delete modal
  const [showDelete, setShowDelete] = useState(false);
  const toggleDeleteModal = () => setShowDelete((v) => !v);

  // auth check
  const [isMusician, setIsMusician] = useState(false);
  useEffect(() => {
    if (userInfo === null) return;
    if (userInfo.musicianId === event.musicianId) {
      setIsMusician(true);
    }
  }, [userInfo, event.musicianId]);

  const eventTimeStr = event.eventTime
    ? new Date(event.eventTime).toLocaleString()
    : "N/A";
  const priceStr =
    event.ticketPrice !== undefined && event.ticketPrice !== null
      ? Number(event.ticketPrice).toFixed(2)
      : "0.00";

  // regular listener view
  if (!isMusician) {
    return (
      <div className={styles.page}>
        <Topnav />
        <div className={styles.banner}>
          {imgSrc && <img src={imgSrc} alt="concert promo" loading="lazy" />}
          <div>
            <h1>{event.title}</h1>
            <p>Hosted by {event.musicianName ?? "Unknown artist"}</p>
          </div>
        </div>
        <div className={styles.info}>
          <h3 className={styles.eventDesc}>{event.eventDescription}</h3>
          <div className={styles.musicianLocTimePrice}>
            <h2>
              Host: {event.musicianName}
              <br />
              Location: {event.eventLocation}
              <br />
              Time: {eventTimeStr}
              <br />
              <br />
              Admission: ${priceStr}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // host musician view
  return (
    <div className={styles.page}>
      <Topnav />
      <div className={styles.banner}>
        {imgSrc && <img src={imgSrc} alt="concert promo" loading="lazy" />}
        <div>
          <h1>{event.title}</h1>
          <p>Hosted by {event.musicianName ?? "You"}</p>
        </div>
      </div>
      <div className={styles.info}>
        <h3 className={styles.eventDesc}>{event.eventDescription}</h3>
        <div className={styles.musicianLocTimePrice}>
          <h2>
            Host: {event.musicianName}
            <br />
            Location: {event.eventLocation}
            <br />
            Time: {eventTimeStr}
            <br />
            <br />
            Admission: ${priceStr}
          </h2>
        </div>

        <EditButton
          state={showEdit}
          clickFunction={toggleEditModal}
          modal={
            <div className={styles.modalEvent}>
              <h2 className={styles.eventTitle}>Event Title</h2>
              <textarea
                className={styles.editTitle}
                placeholder="What's the event called?"
                maxLength={200}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <h2 className={styles.eventPromo}>Event Banner</h2>
              <div className={styles.imageUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setEditPicFileId(e.target.files[0]);
                    console.log(e.target.files[0]);
                  }}
                />
              </div>

              <h2 className={styles.eventDescLabel}>Description</h2>
              <textarea
                className={styles.editDescription}
                placeholder="Provide a brief description on the event..."
                maxLength={500}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
              <div className={styles.charCount}>{editDesc.length} / 500</div>

              <h2 className={styles.eventLoc}>Location</h2>
              <textarea
                className={styles.editLoc}
                placeholder="Where will the event be held?"
                maxLength={200}
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />

              <h2 className={styles.eventTime}>Date/Time</h2>
              <input
                className={styles.editDatetime}
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
              />

              <h2 className={styles.eventPrice}>Price</h2>
              <textarea
                className={styles.editPrice}
                placeholder="Adjust the ticket price for this event..."
                maxLength={7}
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />

              <button type="button" className={styles.save} onClick={save}>
                SAVE
              </button>
              <button
                type="button"
                className={styles.done}
                onClick={toggleEditModal}
              >
                DONE
              </button>
            </div>
          }
        />
      </div>
      <DeleteButton
        strwhattodelete="event"
        api={api}
        state={showDelete}
        clickFunction={toggleDeleteModal}
      />
    </div>
  );
}
