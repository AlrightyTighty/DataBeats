import React, { useState } from "react";
import { useNavigate } from "react-router";
import styles from "./CreateEvent.module.css";
import Topnav from "../Components/Topnav";
import API from "../lib/api";
import createEventPlaceholder from "../assets/graphics/CreateEventPalceHolder.png";

async function jsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [price, setPrice] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [eventPictureFileId, setEventPictureFileId] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  function onPick(e) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;

    setFile(f);
    setErr(null);
    setPreview(URL.createObjectURL(f));

    uploadImage(f).catch(() => {

    });
  }

  async function uploadImage(selectedFile) {
    const f = selectedFile ?? file;
    if (!f) {
      setErr("Pick an image first.");
      throw new Error("no-file");
    }

    setUploading(true);
    setErr(null);
    setMsg(null);

    try {
      const fd = new FormData();
      fd.append("file", f);

      const res = await fetch(`${API}/api/event/file`, {
        method: "POST",
        credentials: "include", 
        body: fd,
      });

      const body = await jsonOrText(res);

      if (!res.ok) {
        const message =
          typeof body === "string" ? body : `Upload failed (${res.status})`;
        throw new Error(message);
      }

      let id = null;
      if (body && typeof body === "object") {
        if (Object.prototype.hasOwnProperty.call(body, "eventPictureFileId")) {
          id = body.eventPictureFileId;
        } else if (
          Object.prototype.hasOwnProperty.call(body, "EventPictureFileId")
        ) {
          id = body.EventPictureFileId;
        }
      }

      if (!id) {
        throw new Error("Upload succeeded but no EventPictureFileId returned.");
      }

      setEventPictureFileId(String(id));
      setMsg("Image uploaded");
      return Number(id);
    } catch (e) {
      setErr(e.message || String(e));
      throw e;
    } finally {
      setUploading(false);
    }
  }

  // Remove the old canSubmit logic - button will always be clickable unless uploading/submitting

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    setMsg(null);

    try {
      // Validate all required fields and show specific error messages
      if (title.trim().length === 0) {
        setErr("Title is Required");
        setSubmitting(false);
        return;
      }

      if (location.trim().length === 0) {
        setErr("Event Location is Required");
        setSubmitting(false);
        return;
      }

      if (desc.trim().length === 0) {
        setErr("Description is Required");
        setSubmitting(false);
        return;
      }

      if (eventTime.trim().length === 0) {
        setErr("Date is Required");
        setSubmitting(false);
        return;
      }

      if (Number.isNaN(Number(price)) || String(price).trim() === "") {
        setErr("Price is Required");
        setSubmitting(false);
        return;
      }

      if (!/^\d+$/.test(String(eventPictureFileId).trim())) {
        setErr("Image is Required");
        setSubmitting(false);
        return;
      }

      // Check if event date is in the past
      const eventDate = new Date(eventTime);
      const now = new Date();
      if (eventDate <= now) {
        setErr("Event date and time must be in the future.");
        setSubmitting(false);
        return;
      }

      const iso = new Date(eventTime).toISOString();

      const payload = {
        title: title.trim(),
        eventDescription: desc.trim(),
        eventLocation: location.trim(),
        eventPictureFileId: Number(eventPictureFileId),
        eventTime: iso,
        ticketPrice: Number(price),
      };

      const res = await fetch(`${API}/api/event`, {
        method: "POST",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await jsonOrText(res);
      if (!res.ok) {
        const message =
          typeof body === "string" ? body : `Create failed (${res.status})`;
        throw new Error(message);
      }

      // Extract the event ID from the response
      let eventId = null;
      if (body && typeof body === "object") {
        eventId = body.eventId || body.EventId || null;
      }

      setMsg("Event created ✅");

      // Redirect to the event page if we got an ID
      if (eventId) {
        setTimeout(() => {
          navigate(`/event/${eventId}`);
        }, 500);
      }

    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Topnav />

      <main id={styles.main}>
        <h1 className={styles.h1} style={{ margin: "0.25em 0" }}>
          Create Event
        </h1>
        <h2 className={styles.h2} style={{ margin: "0.25em 0" }}>
          Fill out all the fields to create your event
        </h2>

        <form onSubmit={onSubmit}>
          <div id={styles["event-info"]}>
            <h1 className={styles.h1} style={{ margin: 0 }}>
              Event Details
            </h1>

            {/* Event image / file chooser */}
            <h3 style={{ marginTop: 24 }}>Event Image</h3>
            <div id={styles["event-art-select"]}>
              <img
                id={styles["event-art-image"]}
                src={preview ?? createEventPlaceholder}
                alt="event"
              />
              <input
                type="file"
                id={styles["event-art-file-input"]}
                onChange={onPick}
                accept="image/*"
              />
            </div>

            {/* Event Title */}
            <h3 style={{ marginTop: 32 }}>Event Title</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event name"
              className={styles.eventTextInput}
            />

            {/* Event Time */}
            <h3 style={{ marginTop: 24 }}>Event Time</h3>
            <input
              type="datetime-local"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className={styles.eventTextInput}
            />

            {/* Price */}
            <h3 style={{ marginTop: 24 }}>Price</h3>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className={styles.eventTextInput}
            />

            {/* Event Location */}
            <h3 style={{ marginTop: 24 }}>Event Location</h3>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
              className={styles.eventTextInput}
            />

            {/* Description */}
            <h3 style={{ marginTop: 24 }}>Description</h3>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe your event"
              className={styles.eventTextarea}
            />

            {/* Messages */}
            {err && (
              <p style={{ color: "#ff6b6b", marginTop: 16 }}>
                {err}
              </p>
            )}
            {msg && (
              <p style={{ color: "#4caf50", marginTop: 16 }}>
                {msg}
              </p>
            )}

            {/* Submit */}
            <div style={{ marginTop: 24 }}>
              <button
                type="submit"
                disabled={submitting || uploading}
                className={styles.submitButton ?? ""}
              >
                {submitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
