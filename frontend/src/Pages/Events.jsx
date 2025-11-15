import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Topnav from "../Components/Topnav";
import "./Events.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5062";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState('week');
  const [startDate, setStartDate] = useState(''); // ISO yyyy-mm-dd
  const [endDate, setEndDate] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API}/api/event`, { headers: { "Cache-Control": "no-store" } });
        if (!res.ok) throw new Error(`GET /api/event failed (${res.status})`);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const created = location.state?.justCreated;
    if (created) {
      setMsg("Event created ✅");
      setEvents(prev => [created, ...prev]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filtering logic
  const now = new Date();
  let filteredEvents = events;
  if (filter === "all") {
    filteredEvents = events; // show all events
  } else if (filter === "week") {
    const weekFromNow = new Date(now);
    weekFromNow.setDate(now.getDate() + 7);
    filteredEvents = events.filter(e => {
      const d = new Date(e.eventTime);
      return d >= now && d <= weekFromNow;
    });
  } else if (filter === "month") {
    const monthFromNow = new Date(now);
    monthFromNow.setMonth(now.getMonth() + 1);
    filteredEvents = events.filter(e => {
      const d = new Date(e.eventTime);
      return d >= now && d <= monthFromNow;
    });
  }

  if (filter === 'custom' && startDate && endDate) {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');
    if (start <= end) {
      filteredEvents = filteredEvents.filter(e => {
        const d = new Date(e.eventTime);
        return d >= start && d <= end;
      });
    }
  }

  return (
    <>
      <Topnav />

    <div className="events-page">
      <div style={{display:'flex',alignItems:'center',flexWrap:'wrap',marginBottom:20,gap:12,justifyContent:'space-between'}}>
        <h1 style={{margin:0,fontSize:36,fontWeight:700}}>Events</h1>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={()=>setFilter('all')} style={{padding:'6px 14px',borderRadius:8,border:'none',background:filter==='all'?'#2563eb':'#e5e7eb',color:filter==='all'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}>All</button>
          <button onClick={()=>setFilter('week')} style={{padding:'6px 14px',borderRadius:8,border:'none',background:filter==='week'?'#2563eb':'#e5e7eb',color:filter==='week'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}>This Week</button>
          <button onClick={()=>setFilter('month')} style={{padding:'6px 14px',borderRadius:8,border:'none',background:filter==='month'?'#2563eb':'#e5e7eb',color:filter==='month'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}>This Month</button>
          <button onClick={()=>setFilter('custom')} style={{padding:'6px 14px',borderRadius:8,border:'none',background:filter==='custom'?'#2563eb':'#e5e7eb',color:filter==='custom'?'#fff':'#222',fontWeight:600,cursor:'pointer'}}>Custom</button>
          {filter==='custom' && (
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <label style={{fontSize:12,color:'#444'}}>From
                <input
                  type="date"
                  value={startDate}
                  onChange={e=>setStartDate(e.target.value)}
                  style={{marginLeft:4,padding:'4px 6px',border:'1px solid #ccc',borderRadius:6}}
                />
              </label>
              <label style={{fontSize:12,color:'#444'}}>To
                <input
                  type="date"
                  value={endDate}
                  onChange={e=>setEndDate(e.target.value)}
                  style={{marginLeft:4,padding:'4px 6px',border:'1px solid #ccc',borderRadius:6}}
                />
              </label>
              {(startDate && endDate && new Date(startDate) > new Date(endDate)) && (
                <span style={{color:'#b91c1c',fontSize:12}}>Start must be before end</span>
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{marginBottom:12,fontSize:13,color:'#374151'}}>
        Showing {filteredEvents.length} event{filteredEvents.length===1?'':'s'}{filter==='custom' && startDate && endDate ? ` between ${startDate} and ${endDate}` : filter==='week' ? ' (next 7 days)' : filter==='month' ? ' (next 30 days)' : filter==='all' ? ' (all)' : ''}
      </div>

      {msg && (
        <div style={{
          background: '#1f3d28',
          color: '#0a5d2a',
          padding: '8px 12px',
          borderRadius: 8,
          marginBottom: 12,
          border: '1px solid #bfe5c9'
        }}>
          {msg}
        </div>
      )}

      {loading && <div>Loading events…</div>}
      {err && (
        <div style={{
          background: "#fdecec",
          color: "#8a1a1a",
          padding: "8px 12px",
          borderRadius: 8,
          marginBottom: 12,
          border: "1px solid #f2b8b8"
        }}>
          {err}
        </div>
      )}

      {!loading && !err && events.length === 0 && (
        <div style={{ opacity: 0.7 }}>No events yet. Create one!</div>
      )}

      <div className="events-grid">
        {filteredEvents.map(e => {
          const inlineImg = e.imageBase64
            ? `data:image/${e.imageFileExtension || "jpeg"};base64,${e.imageBase64}`
            : null;
          const viewUrl = e.eventPictureFileId ? `${API}/api/event/file/view/${e.eventPictureFileId}` : null;
          const imgSrc = inlineImg || viewUrl || bed;
  //added pathway to /events/id
  return (
<div
  key={e.eventId}
  className="event-card"
  onClick={() => navigate(`/event/${e.eventId}`)}
  tabIndex={0}
  onKeyDown={(ev) => {
    if (ev.key === "Enter" || ev.key === " ") {
      navigate(`/event/${e.eventId}`);
    }
  }}
>
  <div className="media">
    <div className="media-inner">
      <img src={imgSrc} alt={e.title} loading="lazy" />
    </div>
  </div>

  <div className="event-card-content">
    <div className="event-card-header">
      <div className="event-title">{e.title}</div>
      <div className="event-artist">
        {e.musicianName ?? e.MusicianName}
      </div>
    </div>

    <div className="event-card-divider" /> {}

    <div className="event-card-footer">
      <span className="event-meta">
        {new Date(e.eventTime).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}{" "}
        <br />
        {" "}
        {new Date(e.eventTime).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
      <span className="event-price-badge">
        ${Number(e.ticketPrice ?? 0).toFixed(2)}
      </span>
    </div>
  </div>
</div>
    );

        })}
      </div>
    </div>
    </>
  );
}
