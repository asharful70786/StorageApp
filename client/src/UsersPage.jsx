import { useEffect, useState } from "react";
import "./UsersPage.css";
import { BASE_URL } from "./components/DirectoryHeader";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userRole, setUserRole] = useState("User");
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const logoutUser = (userId) => {
    alert(`Logging out user with ID: ${userId}`);
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isLoggedIn: false } : user
      )
    );
  };

  useEffect(() => {
    fetchUsers();
    fetchUser();

    // logoutUser();
   }, []);




//role base logOut user 
  async function rolBasedLogOut(_id , email ) {
    const isLoggedOut = confirm(`yo are sure to logout${email} ?`);
    if(! isLoggedOut)return;
    const response = await fetch(`${BASE_URL}/user/role-base-action`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id }),
    })
  }

  //rolebase delete user 
async function roleBaseDeleteUser(_id) {
  const response = await fetch(`${BASE_URL}/user/delete-users`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _id }),
  });
}


  async function fetchUsers() {
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        console.log(data);
      } else if (response.status === 403) {
        navigate("/");
      } else if (response.status === 401) {
        navigate("/login");
      } else {
        // Handle other error statuses if needed
        console.error("Error fetching users data", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }

  async function fetchUser() {
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        // Set user info if logged in
        setUserName(data.name);
        setUserEmail(data.email);
        setUserRole(data.role);
        // setUserPicture(data.picture);
        setLoggedIn(true);
      } else if (response.status === 401) {
        navigate("/login");
      } else {
        // Handle other error statuses if needed
        console.error("Error fetching user info:", response.status);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }

  return (
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <p>
        {userName}: {userRole}
      </p>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th>
            {userRole === "admin" && <th></th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isLoggedIn ? "Logged In" : "Logged Out"}</td>
              <td>
                <button
                  className="logout-button"
                  onClick={() => rolBasedLogOut(user.id , user.email)}
                  disabled={!user.isLoggedIn}
                >
                  Logout
                </button>
              </td>

              {userRole === "admin" && (
                <td>
                  <button
                    className="logout-button delete-button"
                    onClick={() => {
                      roleBaseDeleteUser(user.id);
                    }}
                    disabled={userEmail === user.email}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
