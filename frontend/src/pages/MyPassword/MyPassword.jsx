import "./MyPassword.css";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

// export const MyPassword = () => {
//   return (
//     <div>MyPassword</div>
//   )
// }

const ITEMS_PER_PAGE = 3;

const MyPassword = () => {
  //This stores all the passwords entries fetched from backend
  const [passwords, setPasswords] = useState([]); //grows with each load moren
  const [loadingMore, setLoadingMore] = useState(false); //for load more button
  const [hasMore, setHasMore] = useState(false); // show/hide loadmore button
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const [deleteUuid, setDeleteUuid] = useState(null);
  //stores the uuid of the password entry that user wants to delete, when user click delete button uuid is stored here and then we can show confirmation message
  //null means no delete action is in progress, when it has a uuid value it means user has initiated delete action for that specific password entry
  //"abc-a23 -> user click delete on that password entry -> setDeleteUuid("abc-a23") -> show confirmation message for that entry"

  const [editData, setEditData] = useState(null);
  //stores the uuid of the password entry that user wants to edit, when user click edit button uuid is stored here and then we can show edit form
  //null means no edit action is in progress, when it has a uuid value it means user has initiated edit action for that specific password entry
  //"abc-a23 -> user click edit on that password entry -> setEditUuid("abc-a23") -> show edit form for that entry"

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        //send Get request to backend
        //token is automatically attached by api.js interceptor
        //backend reads token -> finds user_id -> returns only that users data
        const res = await api.get("/my-password", {
          params: { page: 1, limit: ITEMS_PER_PAGE },
        });

        //store fetched data in this state which is setpassword
        //this triggers React to re-render and show the cards
        setPasswords(res.data.passwords); //set first 3 passwords
        setHasMore(res.data.hasMore); //show loadbutton if true hide if false
        setTotalPages(Math.ceil(res.data.total / ITEMS_PER_PAGE));
        setCurrentPage(1);
      } catch (err) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false); //this tells stop loading
      }
    };

    //calling the function
    //empty[]= run only once on page load
    fetchPasswords();
  }, []);

  //runs when user click load more button for page 2
  const handleLoadMore = async (pageToLoad = currentPage + 1) => {
    setLoadingMore(true);
    try {
      const res = await api.get("/my-password", {
        params: { page: pageToLoad, limit: ITEMS_PER_PAGE },
      });
      // append new items to existing list(don't replace but add other rest data below it)
      // setPasswords((prev) => [...prev, ...res.data.passwords]);
      // e.g prev=[1,2,3] + new=[4,5,6]->[1,2,3,4,5,6]

      //  replaces old items with new ones
      setPasswords(res.data.passwords);

      setHasMore(res.data.hasMore); //update if more still exist
      setTotalPages(Math.ceil(res.data.total / ITEMS_PER_PAGE));
      setCurrentPage(pageToLoad); //update current page
    } catch (err) {
      toast.error("failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };
  const handleDelete = async () => {
    //deleteUuid is already set when user clicked delete button
    try {
      await api.delete(`/my-password/${deleteUuid}`); //send delete request to backend with the specific uuid of the password entry to delete
      setPasswords((prev) => prev.filter((item) => item.uuid !== deleteUuid)); //helps to delete data without refresh in browser
      //here setPasswords updates the passwords state by filtering out the deleted entry, it creates a new array that includes only those entries whose uuid does not match deleteUuid, effectively removing the delleted entry
      //prev is old/current passwords list, filter goes through each item in that list and checks if item.uuid is not equal to deleteUuid, if true it keeps that item in the new array if false it excludes it
      //filter keeps only matching items and removes the one with matching uuid which is the deleted one
      //item.uuid !== deleteUuid keep everything except delete item
      toast.success("Password deleted successfully");
      setDeleteUuid(null); //reset deleteUuid to null after deletion is done and close the confirmation message
      return { message: "Password deleted successfully" };
    } catch (err) {
      toast.error("Failed to delete password");
    }
  };

  const handleUpdate = async () => {
    // editUuid already has uuid + new values from the form
    try {
      //send update request to backend with the specific uuid of the password entry to update and new data in request body
      await api.put(`/my-password/${editData.uuid}`, {
        application_name: editData.application_name,
        registered_email: editData.registered_email,
        registered_password: editData.registered_password,
      });

      //at last backend finds row and updates it

      toast.success("Password updated successfully");
      setEditData(null); //reset editData to null after update is done and close the edit form

      //update the password in local state to reflect changes without refetching
      handleLoadMore(currentPage); //reload current page data to get updated list with changes
    } catch (err) {
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="MyPassword-container">
      <h2 className="page-title">My Passwords</h2>
      {/* Step-5: show while data is loading */}
      {/*loading=false → this line disappears */}
      {loading && <p className="status-text">Loading your passwords...</p>}

      {/*  passwords.length = 3 → this line disappears */}
      {/* step-6: show if no password saved yet */}
      {!loading && passwords.length === 0 && (
        <p className="status-text">No passwords saved yet.</p>
      )}
      {/*Cards grows as user loads more */}
      <div className="cards-wrapper">
        {/* passwords = [{Netflix}, {Gmail}, {Facebook}]
        .map() loops 3 times, once for each item:
         Loop 1: mypassword = {uuid:"abc", application_name:"Netflix", ....
         Loop 2: mypassword = {uuid:"def", application_name:"Gmail", ...}
         Loop 3: mypassword = {uuid:"ghi", application_name:"Facebook", ...} */}
        {passwords.map((mypassword) => (
          <div className="password-card" key={mypassword.uuid}>
            <div className="card-header">
              <h3 className="app-name">{mypassword.application_name}</h3>
              <div className="card-actions">
                <button
                  className="btn-edit"
                  title="Edit"
                  //here this card's data is stored in editData state which is used to populate the edit form when user click edit button, and then we can show the edit form for that specific card
                  onClick={() =>
                    setEditData({
                      uuid: mypassword.uuid,
                      application_name: mypassword.application_name,
                      registered_email: mypassword.registered_email,
                      registered_password: mypassword.registered_password,
                    })
                  }
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="btn-delete"
                  title="Delete"
                  onClick={() => setDeleteUuid(mypassword.uuid)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="card-body">
              <div className="card-field">
                <span className="field-label">Email:</span>
                <span className="field-value">
                  {mypassword.registered_email}
                </span>
              </div>
              <div className="card-field">
                <span className="field-label">Password:</span>
                <span className="field-value">
                  {mypassword.registered_password}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/*  PAGINATION CONTROLS THROUGH LOAD MORE BUTTON */}
      {/* PAGINATION — number buttons + prev */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          {/* Number buttons — 1, 2, 3... */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? "page-btn--active" : ""}`}
              onClick={() => handleLoadMore(page)} // 👈 pass page number
            >
              {page}
            </button>
          ))}

          {/* Prev button — only show if not on first page */}
          {currentPage > 1 && (
            <button
              className="page-btn-prev"
              onClick={() => handleLoadMore(currentPage - 1)}
            >
              ← Prev
            </button>
          )}
        </div>
      )}
      {/* Delete Conforamation Modal */}
      {deleteUuid && (
        //only shows when deletedUuid is set not null
        <div className="modal-overlay">
          <div className="modal">
            <h3>Are you Sure?</h3>
            <p>This password will be parmanently deleted.</p>
            <div className="modal-actions">
              <button
                className="btn-confirm-delete"
                onClick={handleDelete}
                //calls handleDelete which sends Delete request
              >
                Delete
              </button>

              <button
                className="btn-cancel"
                onClick={() => setDeleteUuid(null)} //reset deleteUuid to null and close the confirmation or modal message
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* update Modal */}
      {editData && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Password</h3>

            {/* applicaton name */}
            <div className="modal-field">
              <label>Application Name:</label>
              <input
                type="text"
                value={editData.application_name}
                onChange={(e) =>
                  setEditData({
                    ...editData, // ....editdata means keep all existing data unchanged
                    application_name: e.target.value, // application_name: e.target.value means update only application name with new value from input field
                  })
                }
              ></input>
            </div>
            {/* Registered Email */}
            <div className="modal-field">
              <label>Registered Email:</label>
              <input
                type="email"
                value={editData.registered_email}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    registered_email: e.target.value,
                  })
                }
              ></input>
            </div>
            {/* Registered Password */}
            <div className="modal-field">
              <label>Registered Password:</label>
              <input
                type="text"
                value={editData.registered_password}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    registered_password: e.target.value,
                  })
                }
              ></input>
            </div>
            <div className="modal-actions">
              <button
                className="btn-confirm-update"
                onClick={handleUpdate}
                // 👆 sends PUT request with new values
              >
                Save Changes
              </button>

              <button
                className="btn-cancel"
                onClick={() => setEditData(null)}
                // 👆 sets editData back to null → modal closes
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyPassword;
