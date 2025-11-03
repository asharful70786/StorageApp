import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import Register from "./Register";
import "./App.css";
import Login from "./Login";
import UsersPage from "./UsersPage";
import Plans from "./Plans";
import Subscription from "./Subscription";
import NavBar from "./components/Layout/NavBar";
import Footer from "./components/Layout/Footer";



const router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/directory/:dirId",
    element: <DirectoryView />,
  },
  {
    path: "/plans",
    element: <Plans />,
  },
  {
    path: "/subscription",
    element: <Subscription />,
  },
]);

function App() {
  return <>
  <NavBar />

   <RouterProvider router={router} />
   <Footer/>
  
  </>;
}

export default App;
