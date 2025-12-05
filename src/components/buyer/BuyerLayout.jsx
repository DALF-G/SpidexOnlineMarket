import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

const BuyerLayout = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 p-0">
          <SideBar />
        </div>

        {/* Main content */}
        <div className="col-md-9 col-lg-10 p-4">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default BuyerLayout;
