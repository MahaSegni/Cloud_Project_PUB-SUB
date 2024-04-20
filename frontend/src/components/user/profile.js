import "../../assets/css/user.css"
import React from 'react';
import { useHistory } from "react-router-dom";
import { selectConnectedUser } from '../../Redux/slices/sessionSlice';
import { useApi } from "../../utils/useApi"
import { queryApi } from "../../utils/queryApi"
import { useSelector } from 'react-redux';
import { lazy, useEffect, useState } from "react";
import UpdateUser from "./updateUser";
import UserSettings from "./userSettings";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { useDispatch } from 'react-redux';

export default function Profile(props) {
    const history = useHistory();
    const dispatch = useDispatch();

    var connectedUser = useSelector(selectConnectedUser);
    useEffect(() => {
        if (connectedUser.type == "disconnected") {
            history.push('/signin')
        }
    },[])
    const [openModal, setOpenModal] = useState(false);
    const [openPasswordModal, setOpenPasswordModal] = useState(false);

    var [userIPs, err, reloadUserIPs] = useApi('interestpoint/userInterestPoints/' + connectedUser.id, null, 'GET', false, connectedUser.token);
    var [userCPs, err2, reloadUserCPs] = useApi('user/coursepreferences/' + connectedUser.id, null, 'GET', false, connectedUser.token);
    var [allIPs, err3, reloadAllIPs] = useApi('interestpoint/getAll/', null, 'GET', false);
    var [CRs, err, reloadUserCRs] = useApi('user/courseRecommendations/' + connectedUser.id, null, 'GET', false, connectedUser.token);
    const [otherIPs, setOtherIPs] = useState([])
    const [exist, setExist] = useState({
        add: "",
        update: "",
    })
    const [addCP, setAddCP] = useState({
        id: connectedUser.id,
        inputDisplay: false,
        inputValue: "",
    })
    const [updateCP, setUpdateCP] = useState({
        id: connectedUser.id,
        inputDisplay: false,
        inputValue: "",
        cp: ""
    })
    const [addIP, setAddIP] = useState({
        id: connectedUser.id,
        listDisplay: false,
        IPid: "",
    })

    const onRemove = async (ip) => {
        const [, err] = await queryApi('interestpoint/rvFromUser/' + connectedUser.id + '/' + ip._id, null, 'GET', false, connectedUser.token);
        setAddIP({ ...addIP, listDisplay: false, IPid: "" })
        reloadUserIPs()
        reloadAllIPs();
    }

    const onRemoveCP = async (cp) => {
        const [, err] = await queryApi('user/removeCP/' + connectedUser.id + '/' + cp, null, 'GET', false, connectedUser.token);
        reloadUserCPs();

    }

    const openAddIP = () => {
        let myArray = allIPs.filter(x => !userIPs.find(u => (x._id == u._id)));
        setOtherIPs(myArray)
        setAddIP({ ...addIP, listDisplay: true, IPid: myArray[0]._id })
    }
    const onSelectIP = (e) => {
        setAddIP({ ...addIP, IPid: e.target.value })
    }
    const addIPtoUser = async () => {
        const [, err] = await queryApi('interestpoint/addToUser/', addIP, 'PUT', false, connectedUser.token);
        setAddIP({ ...addIP, listDisplay: false, IPid: "" })
        reloadUserIPs();
        reloadAllIPs();
    }

    const closeAddIP = () => {
        setAddIP({ ...addIP, listDisplay: false })
    }

    const openAddCP = () => {
        setAddCP({ ...addCP, inputDisplay: true })
    }

    const onChangeCP = (e) => {
        setAddCP({ ...addCP, inputValue: e.target.value })
    }

    const handleKeyPress = async (event) => {
        let error = false;
        if (event.key === 'Enter') {
            userCPs.forEach(e => {
                if (e.toString().toUpperCase() == addCP.inputValue.toUpperCase()) {
                    error = true;
                }
            })
            if (error) {
                setExist({ ...exist, add: "Already Exist" })
            } else {
                const [, err] = await queryApi('user/addCP/', addCP, 'PUT', false, connectedUser.token);
                setAddCP({ ...addCP, inputDisplay: false, inputValue: "" })
                setExist({ ...exist, add: "" })
                reloadUserCPs();
            }
        }
    }
    const closeAddCP = () => {
        setAddCP({ ...addCP, inputDisplay: false, inputValue: "" })
    }

    const openUpdateCP = (cp) => {
        setUpdateCP({ ...addCP, inputDisplay: true, cp: cp, inputValue: cp })
    }
    const onUpdateCPinput = (e) => {
        setUpdateCP({ ...updateCP, inputValue: e.target.value })
    }
    const handleKeyPressUpdate = async (event) => {
        let error = false;
        if (event.key === 'Enter') {
            userCPs.forEach(e => {
                if (e.toString().toUpperCase() == updateCP.inputValue.toUpperCase()) {
                    error = true;
                }
            })
            if (error) {
                setExist({ ...exist, update: "Already Exist" })
            }
            else {
                const [, err] = await queryApi('user/updateCP/', updateCP, 'PUT', false, connectedUser.token);
                setUpdateCP({ ...addCP, inputDisplay: false, cp: "" })
                setExist({ ...exist, update: "" })
                reloadUserCPs();
            }
        }
    }
    const closeUpdateCP = () => {
        setUpdateCP({ ...addCP, inputDisplay: false, cp: "" })
    }
    const toLibrary = async () => {
        history.push('/library')
    }
    return openModal == true ? (<UpdateUser closeModal={setOpenModal} />) :
        openPasswordModal == true ? (<UserSettings closeModal={setOpenPasswordModal} />) : (
            <>
                <div id="main" data-aos="fade-in">
                    <div className="container mt-5">
                        <div className="main-body">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <div className="card card-user">
                                        <div className=" card-body-user">

                                            <div className="d-flex flex-column align-items-center text-center">
                                                <div>
                                                    {connectedUser.pictureType == "external" &&

                                                        <img src={connectedUser.image} className="rounded-circle"
                                                            width="300" referrerpolicy="no-referrer"></img>
                                                    }
                                                    {connectedUser.pictureType == "internal" && <img src={require('../../assets/uploads/user/' + connectedUser.image)} alt="Admin" className="rounded-circle"
                                                        width="300" />
                                                    }
                                                </div>
                                                <div className="mt-3">
                                                    <h4>{connectedUser.name} {connectedUser.lastName} </h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="card-user mb-3">
                                        <div className="card-body card-body-user">
                                            <div className="row">
                                                <div className="col-sm-3">
                                                    <h6 className="mb-0">Name</h6>
                                                </div>
                                                <div className="col-sm-9 text-secondary">
                                                    {connectedUser.name}
                                                </div>
                                            </div>
                                            <hr />
                                            <div className="row">
                                                <div className="col-sm-3">
                                                    <h6 className="mb-0">Last Name</h6>
                                                </div>
                                                <div className="col-sm-9 text-secondary">
                                                    {connectedUser.lastName}
                                                </div>
                                            </div>
                                            <hr />
                                            <div className="row">
                                                <div className="col-sm-3">
                                                    <h6 className="mb-0">Birth date</h6>
                                                </div>
                                                <div className="col-sm-9 text-secondary">
                                                    {connectedUser.birthDate != null &&
                                                        <>
                                                            {connectedUser.birthDate.substring(0, 10)}
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                            <hr />
                                            <div className="row">
                                                <div className="col-sm-3">
                                                    <h6 className="mb-0">Email</h6>
                                                </div>
                                                <div className="col-sm-9 text-secondary">
                                                    {connectedUser.email}
                                                </div>
                                            </div>
                                            <hr />
                                            <div className="row">
                                                <div className="col-sm-3">
                                                    <h6 className="mb-0">Phone Number</h6>
                                                </div>
                                                <div className="col-sm-9 text-secondary">
                                                    {connectedUser.phone}
                                                </div>
                                            </div>
                                            <hr />
                                            <div className="mx-auto" style={{ float: "right" }}>
                                                <button type="submit" className="btn btn-template-user" onClick={() => {
                                                    setOpenModal(true)
                                                }}><FontAwesomeIcon icon={faPencil}></FontAwesomeIcon></button>
                                            </div>
                                            <div className="mx-auto" style={{ float: "right" }}>
                                                <button type="submit" className="btn btn-template-user me-3" onClick={() => {
                                                    setOpenPasswordModal(true)
                                                }}><FontAwesomeIcon icon={faGear}></FontAwesomeIcon></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </>


        );
}