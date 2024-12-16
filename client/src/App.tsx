import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { Toaster } from "react-hot-toast";
import InPainting from "./components/InPainting";
import Navbar from "./components/Navbar";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <HomePage />
        <Toaster />
      </>
    ),
  },
  {
    path: "/tool",
    element: (
      <>
        <Navbar />
        <InPainting />
        <Toaster />
      </>
    ),
  },
]);

const App: React.FC = () => {
  return (
    <div className="">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
