import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import JobCard from "../components/JobCard.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: params.get("search") || "", location: "", type: "", workplace: "", sort: "recommended"
  });
  const { showToast } = useToast();

  const load = () => {
    setData(null);
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    api(`/jobs?${query}`).then(setData).catch((error) => showToast(error.message, "error"));
  };
  useEffect(() => { load(); }, [filters.location, filters.type, filters.workplace, filters.sort]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5001", {
      auth: { token: localStorage.getItem("internshell_token") }
    });
    socket.on("new_job", (job) => {
      showToast("A new opportunity was just posted: " + job.title, "success");
      setData(current => current ? {
        ...current,
        items: [job, ...current.items],
        pagination: { ...current.pagination, total: current.pagination.total + 1 }
      } : current);
    });
    return () => socket.disconnect();
  }, [showToast]);
  const submit = (event) => { event.preventDefault(); setParams(filters.search ? { search: filters.search } : {}); load(); };
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const save = async (job) => {
    const result = await api(`/jobs/${job.id}/save`, { method: "POST" });
    setData((current) => ({ ...current, items: current.items.map((item) => item.id === job.id ? { ...item, saved: result.saved } : item) }));
    showToast(result.saved ? "Saved for later" : "Removed from saved jobs");
  };
  const clear = () => setFilters({ search: "", location: "", type: "", workplace: "", sort: "recommended" });

  return (
    <div className="jobs-page page-enter">
      <div className="page-heading">
        <div><span className="eyebrow">Opportunity explorer</span><h1>Find work that fits your direction.</h1><p>Search by craft, context, and the way you want to work.</p></div>
      </div>
      <form className="jobs-search-bar" onSubmit={submit}><Search size={19} /><input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Search role, skill, or company" /><button className="button primary">Search</button><button type="button" className="button filter-mobile" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17} />Filters</button></form>
      <div className="jobs-layout">
        <aside className={`filter-panel ${filtersOpen ? "open" : ""}`}>
          <div className="filter-title"><strong>Refine results</strong><button onClick={() => setFiltersOpen(false)}><X size={18} /></button></div>
          <label>Location<select value={filters.location} onChange={(e) => update("location", e.target.value)}><option value="">Anywhere</option><option>Bengaluru</option><option>Mumbai</option><option>Pune</option><option>Remote</option><option>New Delhi</option></select><ChevronDown size={15} /></label>
          <div className="filter-group"><strong>Opportunity type</strong>{["Internship", "Full-time", "Part-time", "Contract"].map((type) => <label className="check-label" key={type}><input type="radio" name="type" checked={filters.type === type} onChange={() => update("type", filters.type === type ? "" : type)} /><span />{type}</label>)}</div>
          <div className="filter-group"><strong>Work style</strong>{["Remote", "Hybrid", "On-site"].map((type) => <label className="check-label" key={type}><input type="radio" name="workplace" checked={filters.workplace === type} onChange={() => update("workplace", filters.workplace === type ? "" : type)} /><span />{type}</label>)}</div>
          <button className="clear-button" onClick={clear}>Clear all filters</button>
        </aside>
        <section className="job-results">
          <div className="results-head"><p>{data ? <><strong>{data.pagination.total}</strong> opportunities found</> : "Finding opportunities..."}</p><label>Sort by<select value={filters.sort} onChange={(e) => update("sort", e.target.value)}><option value="recommended">Recommended</option><option value="match">Best match</option><option value="newest">Newest</option></select></label></div>
          {!data ? <Loading label="Curating relevant roles" /> : data.items.length ? <div className="jobs-grid results-grid">{data.items.map((job) => <JobCard job={job} key={job.id} onSave={save} />)}</div> : <EmptyState title="No exact matches yet" text="Try broadening your location or removing one filter." action={<button className="button soft" onClick={clear}>Clear filters</button>} />}
        </section>
      </div>
    </div>
  );
}
