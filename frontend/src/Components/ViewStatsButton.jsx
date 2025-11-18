import { useNavigate } from "react-router"
import "../css/ViewStatsButton.css"

export default function ViewStats({ pos, route }) {
    const navigate = useNavigate();
    return <button type="button" className={`view-stats ${pos}`} onClick={() => navigate(route)}>View Stats</button>
}