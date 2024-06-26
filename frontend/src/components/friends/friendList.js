import React, { useEffect, useState } from "react";
import "../../assets/css/friendList.css"

import $ from "jquery";
import { useSelector } from "react-redux";
import { selectConnectedUser } from "../../Redux/slices/sessionSlice";
import { useHistory } from "react-router-dom";

import { useApi } from "../../utils/useApi";
import { queryApi } from "../../utils/queryApi";


const FriendList = (props) => {
  $(document).ready(function () {
    $("#search").on("keyup", function () {
      var value = $(this).val().toLowerCase();
      $("#mydiv ").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const history = useHistory();
  let connecteduser = useSelector(selectConnectedUser)
  let idUser = useSelector(selectConnectedUser).id
  let [Friends, err, reloadFriends] = useApi('friends/getMyFriends/' + idUser, null, 'GET', false, connecteduser.token);
  console.log(Friends)

  async function deleteFriend(id) {
    const [, err] = await queryApi('friends/deleteFriend/' + idUser + '/' + id, null
      , 'get', false, connecteduser.token);
    reloadFriends();

  }

  return (
    <>

      <div class="container mt-3 mb-4" >
        <div class="input-group mb-5">
          <input type="text" id="search" name="example-input1-group2" class="form-control" placeholder="Search" />
          <span class="input-group-btn">
            <button type="button" class="btn btn-effect-ripple btn-template"><i class="fa fa-search" ></i></button>
          </span>
        </div>
        {Friends && Friends.length == 0 && <div class="alert warning-alert"><h3>Your friendlist is empty</h3></div>}
        <div class="row">
          <div class="col-md-12">
            <div class="user-dashboard-info-box table-responsive mb-0 bg-white pFriend-4 shadow-sm">

              <table class="table manage-candidates-top mb-0">
                <thead>
                  <tr>
                    <th>Friends</th>
                    <th class="text-center">Status</th>
                    <th class="action text-right">Action</th>
                  </tr>
                </thead>
                <tbody >

                  {Friends && Friends.length > 0 &&
                    Friends.map((user, index) => (
                      <tr id="mydiv" class="candidates-list"
                        key={index}>
                        <td class="title">
                          <div class="thumb">
              
                            {user.image.startsWith("https") &&

                              <img src={user.image} class="img-fluid"
                                referrerpolicy="no-referrer"></img>
                            }
                            {!user.image.startsWith("https") && <img class="img-fluid" src={require('../../assets/uploads/user/' + user.image)} alt=""
                            />
                            }

                          </div>
                          <div class="candidate-list-details">
                            <div class="candidate-list-info">
                              <div class="candidate-list-title " >
                               <h5 class="mb-0 text-capitalize"><a href={`/check/${user._id}`} style= {{ color: "black" }}  >{user.name} {user.lastName}</a></h5>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="candidate-list-favourite-time text-center">

                          <span class="candidate-list-time order-1">{user.state === 1 && <label> <img src="https://img.icons8.com/emoji/48/000000/green-circle-emoji.png" style={{ width: 20 }} />Connected</label>}{user.state === 0 && "Disconnected"}</span>

                        </td>
                        <td>
                          <ul class="list-unstyled mb-0 d-flex justify-content-end">
                            <li><a class="text-danger" title="" data-original-title="Delete"
                              data-toggle="modal" data-target={`#ConfirmationModal${user._id}`}><i class="far fa-trash-alt"></i></a></li>
                          </ul>
                        </td>

                        {/*  -----------------------------------------------------ConfirmationModal----------------------------------------------*/}

                        <div class="modal fade" id={`ConfirmationModal${user._id}`} tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                          <div class="modal-dialog modal-dialog-centered" role="document">
                            <div class="modal-content">
                              <div class="modal-body">
                                <h4 class=" text-center" style={{ color: "#5fcf80" }}>Confirm Delete</h4>

                                <hr></hr>
                              </div>
                              <div class="modal-body text-center">
                                <p>Validate your deletion ?  </p>
                              </div>
                              <div class="modal-footer">
                                <button type="button" class="btn btn-template " id="cancelBtn" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-template" data-dismiss="modal" onClick={() => { deleteFriend(user._id) }}>Submit</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </tr>


                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>




    </>


  );
}




export default FriendList;

