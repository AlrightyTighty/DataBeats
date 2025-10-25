import React, { useState } from "react";
import "./CreateEvent.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5062";

async function jsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [price, setPrice] = useState("");

  // temporary until auth wiring auto-fills these
  const [musicianId, setMusicianId] = useState("7");
  const [userIdHeader, setUserIdHeader] = useState("5");

  // image selection & upload
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [eventPictureFileId, setEventPictureFileId] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  function onPick(e) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setErr(null);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function uploadImage() {
    if (!file) {
      setErr("Pick an image first.");
      throw new Error("no-file");
    }
    setUploading(true);
    setErr(null);
    setMsg(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`${API}/api/event/file`, {
        method: "POST",
        headers: { "X-UserId": String(userIdHeader) },
        body: fd,
      });
      const body = await jsonOrText(res);

      if (!res.ok) {
        const message = typeof body === "string" ? body : `Upload failed (${res.status})`;
        throw new Error(message);
      }

      // Replace `??` with explicit property checks
      let id = null;
      if (body && typeof body === "object") {
        if (Object.prototype.hasOwnProperty.call(body, "eventPictureFileId")) {
          id = body.eventPictureFileId;
        } else if (Object.prototype.hasOwnProperty.call(body, "EventPictureFileId")) {
          id = body.EventPictureFileId;
        }
      }

      if (!id) {
        throw new Error("Upload succeeded but no EventPictureFileId returned.");
      }

      setEventPictureFileId(String(id));
      setMsg(`Image uploaded`);
      return Number(id);
    } catch (e) {
      setErr(e.message || String(e));
      throw e;
    } finally {
      setUploading(false);
    }
  }

  // simple checks to enable/disable submit
  const titleOk = title.trim().length > 0;
  const descOk = desc.trim().length > 0;
  const timeOk = eventTime.trim().length > 0;
  const priceOk = !Number.isNaN(Number(price)) && String(price).trim() !== "";
  const musicianOk = /^\d+$/.test(String(musicianId).trim());
  const picOk = /^\d+$/.test(String(eventPictureFileId).trim());

  const canSubmit = titleOk && descOk && timeOk && priceOk && musicianOk && (picOk || !!file);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    setMsg(null);

    try {
      if (!file && !picOk) {
        setErr("Please upload an image before creating the event.");
        setSubmitting(false);
        return;
      }

      // auto-upload if file is chosen but no picture id yet
      if (file && !picOk) {
        try {
          await uploadImage();
        } catch (uploadErr) {
          setErr(uploadErr.message || String(uploadErr));
          setSubmitting(false);
          return;
        }
      }

      const iso = new Date(eventTime).toISOString();

      const payload = {
        musicianId: Number(musicianId),
        title: title.trim(),
        eventDescription: desc.trim(),
        eventPictureFileId: Number(eventPictureFileId),
        eventTime: iso,
        ticketPrice: Number(price),
      };

      const res = await fetch(`${API}/api/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await jsonOrText(res);
      if (!res.ok) {
        const message = typeof body === "string" ? body : `Create failed (${res.status})`;
        throw new Error(message);
      }

      setMsg("Event created ✅");
      // optional: navigate('/events');
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="create-event-outer">
      <div className="create-event-card">
        <h1 className="create-event-title">Create Event</h1>

        <form onSubmit={onSubmit} className="form">
          <div className="flex flex-col items-center">
            <label htmlFor="filepicker" className="upload-area">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: 8 }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div className="upload-plus">+</div>
                  <div className="upload-text">Click to pick an image</div>
                </div>
              )}
            </label>
            <input id="filepicker" type="file" accept="image/*" onChange={onPick} style={{ display: "none" }} />

            <div style={{ marginTop: 12, width: "100%" }}>
              <button type="button" onClick={uploadImage} disabled={uploading || !file} className="full-width-btn">
                {uploading ? "Uploading..." : "Upload image"}
              </button>
            </div>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name"
            className="name-input"
          />

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            rows={8}
            className="description"
          />

          <div className="inputs-row">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, opacity: 0.7 }}>Event time</label>
              <input
                type="datetime-local"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="datetime-input"
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, opacity: 0.7 }}>Price</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="price-input"
                required
              />
            </div>
          </div>

          {/* Temporary identity inputs (can be hidden once auth is wired) */}
          <div className="meta-grid">
            <input
              value={userIdHeader}
              onChange={(e) => setUserIdHeader(e.target.value)}
              placeholder="X-UserId for upload"
              className="name-input"
            />
            <input
              value={musicianId}
              onChange={(e) => setMusicianId(e.target.value)}
              placeholder="musicianId"
              className="name-input"
            />
          </div>

          {err && <div className="msg err">{err}</div>}
          {msg && <div className="msg ok">{msg}</div>}

          <div className="submit-row">
            <button type="submit" disabled={!canSubmit || submitting} className="full-width-btn" style={{ maxWidth: 180 }}>
              {submitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
