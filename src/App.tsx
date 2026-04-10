import { useState, useEffect } from "react";
import CompoundGrowthCalc from "./components/CompoundGrowthCalc";
import GoalCalc from "./components/GoalCalc";
import "./App.css";

type Tab = "growth" | "goal";

function getTabFromURL(): Tab {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  return tab === "goal" ? "goal" : "growth";
}

function setTabInURL(tab: Tab) {
  const url = new URL(window.location.href);
  url.searchParams.set("tab", tab);
  window.history.replaceState({}, "", url.toString());
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromURL);

  useEffect(() => {
    setTabInURL(activeTab);
  }, [activeTab]);

  return (
    <div className="app">
      <header>
        <h1>Investment Calculator</h1>
        <nav className="tab-bar">
          <button
            className={activeTab === "growth" ? "tab active" : "tab"}
            onClick={() => setActiveTab("growth")}
          >
            Compound Growth
          </button>
          <button
            className={activeTab === "goal" ? "tab active" : "tab"}
            onClick={() => setActiveTab("goal")}
          >
            Investment Goal
          </button>
        </nav>
      </header>
      <main>
        {activeTab === "growth" ? <CompoundGrowthCalc /> : <GoalCalc />}
      </main>
    </div>
  );
}

