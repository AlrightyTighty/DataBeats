import { useNavigate } from "react-router"
import '../css/AddButton.css'

export default function AddButton({route}) {
    const navigate = useNavigate();
    return <button type="button" className="add-button" onClick={() => {navigate(route)}}>+</button>
}