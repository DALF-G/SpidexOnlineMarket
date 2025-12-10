import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import DashboardNavbar from '../DashboardNavbar'

const BuyerLayout = () => {
  return (
    <div className='d-flex'>
    <SideBar/>

    <div className="flex-grow-1">
      <DashboardNavbar/>

      {/* Main area where the routed page content will be displayed */}
      <main className="p-4 vh-100">
          {/* Outlet renders the matched child route's elements */}
          <Outlet/>
      </main>
    </div>
  </div>
  );
};

export default BuyerLayout;
