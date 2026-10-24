import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Assistant from "./pages/Assistant";
import CitizenHub from "./pages/CitizenHub";
import Acts from "./pages/Acts";
import LawSearch from "./pages/LawSearch";
import OfficialActs from "./pages/OfficialActs";
import SafetyCharter from "./pages/SafetyCharter";
import Helplines from "./pages/Helplines";
import LegalAid from "./pages/LegalAid";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <div className="orbs" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
      </div>
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <ScrollTop />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6">
        <div key={pathname} className="page-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/hub" element={<CitizenHub />} />
            <Route path="/acts" element={<Acts />} />
            <Route path="/search" element={<LawSearch />} />
            <Route path="/official" element={<OfficialActs />} />
            <Route path="/charter" element={<SafetyCharter />} />
            <Route path="/helplines" element={<Helplines />} />
            <Route path="/legal-aid" element={<LegalAid />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}