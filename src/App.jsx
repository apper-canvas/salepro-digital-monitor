import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Dashboard from "@/components/pages/Dashboard";
import Leads from "@/components/pages/Leads";
import Contacts from "@/components/pages/Contacts";
import Pipeline from "@/components/pages/Pipeline";
import Deals from "@/components/pages/Deals";
import Invoices from "@/components/pages/Invoices";
import Activities from "@/components/pages/Activities";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/activities" element={<Activities />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;