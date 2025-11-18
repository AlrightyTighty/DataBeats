import { useNavigate } from "react-router"
import '../css/AddButton.css'

export default function AddButton({ pos, route }) {
    const navigate = useNavigate();
    return <button type="button" className={`add-button ${pos}`} onClick={() => {navigate(route)}}>+</button>
}