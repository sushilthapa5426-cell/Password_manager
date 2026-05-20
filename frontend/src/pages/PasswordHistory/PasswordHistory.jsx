// src/pages/PasswordHistory/PasswordHistory.jsx

import "./PasswordHistory.css";
import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
// 👆 Eye    = show password icon
// 👆 EyeOff = hide password icon

import api from "../../utils/api";
// 👆 axios instance with baseURL and token interceptor
// every request automatically gets Authorization header

import toast from "react-hot-toast";
// 👆 shows popup messages

const ITEMS_PER_PAGE = 3;
// 👆 how many history cards to show per page
// change this number to show more or less

const PasswordHistory = () => {
  // ===== STATES =====

  const [history, setHistory] = useState([]);
  // 👆 stores history records fetched from backend
  // starts as empty array []
  // after fetch: [
  //   {history_uuid:"hist-111", ref_uuid:"abc-123",
  //    application_name:"Netflix", registered_email:"s@gmail.com",
  //    registered_password:"Pass1", updated_at:"2026-05-07 15:56:45"},
  //   ...
  // ]

  const [loading, setLoading] = useState(true);
  // 👆 true  = "Loading history..." text shows
  // false = cards show
  // starts as true because data hasn't loaded yet

  const [currentPage, setCurrentPage] = useState(1);
  // 👆 which page user is currently on
  // starts on page 1
  // changes when user clicks page number button

  const [totalPages, setTotalPages] = useState(0);
  // 👆 how many page buttons to show
  // 0 = no buttons yet
  // 3 = show [1][2][3] buttons

  const [visiblePasswords, setVisiblePasswords] = useState({});
  // 👆 controls show/hide for each password card independently
  // {} = all passwords hidden (dots shown)
  // {"hist-111": true}  = this card's password is visible
  // {"hist-111": false} = this card's password is hidden
  // multiple cards can be toggled independently:
  // {"hist-111": true, "hist-222": false, "hist-333": true}

  // ===== FETCH HISTORY ON PAGE LOAD =====
  useEffect(() => {
    fetchHistory(1);
    // 👆 runs once when component first appears on screen
    // fetches page 1 of history
  }, []);
  // [] = run only once on mount

  // ===== FETCH HISTORY FUNCTION =====
  const fetchHistory = async (pageToLoad) => {
    // 👆 accepts page number
    // called on first load: fetchHistory(1)
    // called on page click: fetchHistory(2)
    // called on prev click: fetchHistory(currentPage - 1)

    setLoading(true);
    // 👆 shows "Loading history..." while fetching

    try {
      const res = await api.get("/password-history", {
        params: {
          page: pageToLoad,
          // 👆 which page to fetch e.g 1, 2, 3

          limit: ITEMS_PER_PAGE,
          // 👆 how many records per page = 3
        },
      });
      // api.js interceptor runs before this request:
      // reads token from localStorage
      // adds: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
      //
      // Full request:
      // GET http://localhost:8000/api/password-history?page=1&limit=3
      // Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
      //
      // Backend runs get_password_history():
      // 1. reads token → gets user_id = 1
      // 2. counts total history for user 1
      // 3. skips (page-1)*3 records
      // 4. fetches 3 records
      // 5. decrypts each password
      // 6. returns JSON

      setHistory(res.data.history);
      // 👆 stores history records in state
      // res.data.history = array of history objects
      // React re-renders → cards appear on screen

      setTotalPages(Math.ceil(res.data.total / ITEMS_PER_PAGE));
      // 👆 calculates total pages
      // e.g Math.ceil(9/3) = 3
      // → shows [1][2][3] buttons

      setCurrentPage(pageToLoad);
      // 👆 marks current page button as blue/active
    } catch (err) {
      toast.error("Failed to fetch history");
      // 👆 shows red error popup if API fails
    } finally {
      setLoading(false);
      // 👆 always runs whether success or error
      // loading=false → "Loading..." disappears
    }
  };

  // ===== TOGGLE PASSWORD VISIBILITY =====
  const togglePassword = (history_uuid) => {
    // 👆 accepts history_uuid of the specific card clicked
    // each card has its own visibility controlled independently

    setVisiblePasswords((prev) => ({
      ...prev,
      // 👆 spread: keeps all other cards visibility unchanged
      // e.g {"hist-222": true} stays the same

      [history_uuid]: !prev[history_uuid],
      // 👆 flips only this card's visibility
      // prev["hist-111"] = undefined → !undefined = true  (show)
      // prev["hist-111"] = true      → !true = false       (hide)
      // prev["hist-111"] = false     → !false = true       (show)
    }));
  };

  // ===== JSX =====
  return (
    <div className="history-container">
      {/* Page title */}
      <h2 className="history-title">Password History</h2>
      {/* Loading text — shows while fetching */}
      {loading && <p className="status-text">Loading history...</p>}

      {/* Empty state — shows when no history exists */}
      {!loading && history.length === 0 && (
        <p className="status-text">
          No history yet. Update a password to see history here.
        </p>
      )}

      {/* ===== HISTORY CARDS ===== */}
      <div className="history-wrapper">
        {history.map((item) => (
          // 👆 item = one history record:
          // {
          //   history_uuid: "hist-111",
          //   ref_uuid: "abc-123",
          //   application_name: "Netflix",
          //   registered_email: "s@gmail.com",
          //   registered_password: "Pass@1234",  ← already decrypted by backend
          //   updated_at: "2026-05-07 15:56:45"
          // }

          <div className="history-card" key={item.history_uuid}>
            {/* 👆 key = history_uuid (unique for each card)
              React uses key to track each card separately */}

            {/* ===== DATE ===== */}
            <div className="history-date">
              🕒 {new Date(item.updated_at).toLocaleString()}
              {/* 👆 new Date("2026-05-07 15:56:45")
                      creates a JavaScript date object
                  .toLocaleString()
                      formats it based on browser locale
                      → "5/7/2026, 3:56:45 PM" */}
            </div>

            {/* ===== APPLICATION NAME ===== */}
            <div className="history-field">
              <span className="history-label">Application:</span>
              <span className="history-value">
                {item.application_name}
                {/* 👆 OLD name before update
                    e.g "Netflix" (before changed to "Netflix Premium") */}
              </span>
            </div>

            {/* ===== EMAIL ===== */}
            <div className="history-field">
              <span className="history-label">Email:</span>
              <span className="history-value">
                {item.registered_email}
                {/* 👆 OLD email before update */}
              </span>
            </div>

            {/* ===== PASSWORD WITH SHOW/HIDE ===== */}
            <div className="history-field">
              <span className="history-label">Old Password:</span>

              <span className="history-value">
                {
                  visiblePasswords[item.history_uuid]
                    ? item.registered_password
                    : // 👆 visiblePasswords["hist-111"] = true
                      //    → show real password "Pass@1234"
                      "••••••••••"
                  // 👆 visiblePasswords["hist-111"] = false/undefined
                  //    → show dots
                }
              </span>

              {/* Eye toggle button */}
              <button
                className="btn-eye"
                onClick={() => togglePassword(item.history_uuid)}
                // 👆 passes this card's history_uuid to togglePassword
                // togglePassword flips visibility for only this card
                // other cards are not affected
              >
                {
                  visiblePasswords[item.history_uuid] ? (
                    <EyeOff size={14} />
                  ) : (
                    // 👆 eye closed icon = password is currently visible
                    //    click to hide
                    <Eye size={14} />
                  )
                  // 👆 eye open icon = password is currently hidden
                  //    click to show
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
      {!loading && totalPages > 1 && (
        // 👆 only shows when:
        // loading=false (data loaded)
        // totalPages > 1 (more than 1 page exists)

        <div className="pagination">
          {/* Prev button — only shows when not on page 1 */}
          {currentPage > 1 && (
            <button
              className="page-btn page-btn-prev"
              onClick={() => fetchHistory(currentPage - 1)}
              // 👆 currentPage=2 → fetchHistory(1) → goes back to page 1
              // currentPage=3 → fetchHistory(2) → goes back to page 2
            >
              ← Prev
            </button>
          )}

          {/* Page number buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            // 👆 Array.from({length:3}) → [1,2,3]
            // creates one button per page number

            <button
              key={page}
              className={`page-btn ${currentPage === page ? "page-btn--active" : ""}`}
              // 👆 currentPage=1, page=1 → true  → blue button
              //    currentPage=1, page=2 → false → white button

              onClick={() => fetchHistory(page)}
              // 👆 clicking [2] → fetchHistory(2) → fetches page 2
            >
              {page}
              {/* shows 1, 2, 3... */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordHistory;
