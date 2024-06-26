import { useEffect,useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { queryApi } from "../../utils/queryApi"
import { chnageConenctedUser } from '../../Redux/slices/sessionSlice';
import { Link } from "react-router-dom";
import GoogleLogin from "react-google-login";
import Cookies from 'js-cookie';
import { selectConnectedUser } from '../../Redux/slices/sessionSlice';
import { useSelector } from 'react-redux';
import axios from "axios";
export default function Signin(props) {
  
  const history = useHistory();
  
  var connectedUser = useSelector(selectConnectedUser);
    useEffect(() => {
        if (connectedUser.type != "disconnected") {
            history.push('/profile')
        }
    }, [])
  
  const dispatch = useDispatch();
  const [errorDisplay, setErrorDisplay] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  
  const onSubmit = async (e) => {
    e.preventDefault()
    const [result, err] = await queryApi('user/signin', formData, "POST", false)

    if ((result == 'Incorrect password') || (result == 'Incorrect email') || (result == 'You are Trying to connect with a google account that does not have a password, click Forgot Password to create one') || (result == 'Account Banned')) {
      setErrorDisplay(result)
    } else {
      if (result.image.startsWith('https')) {
        let userResult = { id: result._id, email: result.email, type: result.typeUser, name: result.name, lastName: result.lastName, phone: result.phone, birthDate: result.birthDate, image: result.image, token: result.token, connectionType: "default", pictureType: "external" }
        dispatch(chnageConenctedUser(userResult))
      }
      else {
        let userResult = { id: result._id, email: result.email, type: result.typeUser, name: result.name, lastName: result.lastName, phone: result.phone, birthDate: result.birthDate, image: result.image, token: result.token, connectionType: "default", pictureType: "internal" }
        dispatch(chnageConenctedUser(userResult))
      }
      await axios.get("http://localhost:3000/api/conversations/getnotif/" + result._id).then( res => { window.localStorage.setItem("notif",JSON.stringify(res.data ))});
      history.push('/');
      Cookies.set('connected', 'true', { expires: 1 })
    }

  }
  const handleFailure = (result) => {
    alert(result);
  }

  return (
    <div class="my-5">
      <h1 class="logo mx-auto" style={{ textAlign: "center", color: "#5fcf80" }}>Sign In</h1>
      <form class="w-50 mx-auto" onSubmit={onSubmit}>

        <div class="form-group">
          <input type="email" name="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter Email" onChange={(e) => onChange(e)} />
        </div>
        <div class="form-group my-2">
          <input type="password" name="password" class="form-control" id="exampleInputPassword1" placeholder="Enter Password" onChange={(e) => onChange(e)}  onKeyPress={(e) => {  if (e.key === 'Enter') {onSubmit();} }} />
        </div>
        <Link to={'/forgetPassword'}>Forgot Password</Link>
        <div style={{ textAlign: "center", color: "red" }}>{errorDisplay}</div>
        <button type="submit" class="ms-auto my-2 btn btn-template-user">Submit</button>
       
      </form>

    </div>
  );
}