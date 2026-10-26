
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";

const API = "http://localhost:5000/api/feedback";

function Dashboard() {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadFeedback() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Could not load feedback");
      setFeedback(await res.json());
      setError("");
    } catch {
      setError("Cannot connect to backend. Check your server.");
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  async function deleteFeedback(id) {
    if (!window.confirm("Delete this feedback?")) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await loadFeedback();
    } catch {
      setError("Unable to delete feedback.");
    }
  }

  const average = feedback.length
    ? (
        feedback.reduce((sum, item) => sum + Number(item.rating), 0) /
        feedback.length
      ).toFixed(1)
    : "0.0";

  return (
    <div>
      <header className="welcome">
        <div>
          <p className="eyebrow">ADMIN PANEL / OVERVIEW</p>
          <h1>Feedback Dashboard</h1>
          <p className="muted">
            Manage courses and review student feedback.
          </p>
        </div>
        <button className="primary" onClick={() => navigate("/add")}>
          + Add Feedback
        </button>
      </header>

      <section className="stats">
        <article className="stat-card">
          <span>Total Feedback</span>
          <h2>{feedback.length}</h2>
          <p>Submitted responses</p>
        </article>
        <article className="stat-card">
          <span>Average Rating</span>
          <h2>{average} ★</h2>
          <p>Out of 5 stars</p>
        </article>
        <article className="stat-card">
          <span>Total Courses</span>
          <h2>
            {new Set(feedback.map((item) => item.courseName)).size}
          </h2>
          <p>Unique course names</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Course Feedback</h2>
            <p className="muted">View, update and delete feedback.</p>
          </div>
          <span className="count">{feedback.length} entries</span>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item, index) => (
                <tr key={item._id}>
                  <td>C-{String(index + 1).padStart(3, "0")}</td>
                  <td><strong>{item.courseName}</strong></td>
                  <td>{item.courseDuration || "Not specified"}</td>
                  <td>
                    <span className="stars">
                      {"★".repeat(Number(item.rating))}
                      <span className="empty-stars">
                        {"★".repeat(5 - Number(item.rating))}
                      </span>
                      {" "}{item.rating}/5
                    </span>
                  </td>
                  <td>{item.comments}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="edit"
                        onClick={() => navigate(`/edit/${item._id}`)}
                      >
                        Update
                      </button>
                      <button
                        className="delete"
                        onClick={() => deleteFeedback(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {feedback.length === 0 && !error && (
          <div className="empty">
            <h3>No feedback available yet</h3>
            <p>Add your first course feedback to get started.</p>
            <button className="primary" onClick={() => navigate("/add")}>
              Add Feedback
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function FeedbackForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [courseName, setCourseName] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [comments, setComments] = useState("");
  const [rating, setRating] = useState("5");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`${API}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load feedback");
        return res.json();
      })
      .then((data) => {
        setCourseName(data.courseName || "");
        setCourseDuration(data.courseDuration || "");
        setComments(data.comments || "");
        setRating(String(data.rating || 5));
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(editing ? `${API}/${id}` : API, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName,
          courseDuration: courseDuration || "Not specified",
          comments,
          rating: Number(rating),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not save feedback");

      navigate("/");
    } catch (err) {
      setError(err.message || "Cannot connect to backend");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-layout">
      <div className="form-intro">
        <p className="eyebrow">FEEDBACK MANAGEMENT</p>
        <h1>{editing ? "Update Feedback" : "Add Feedback"}</h1>
        <p className="muted">
          Share your course experience and help us improve.
        </p>
      </div>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <h2>Feedback Details</h2>

        <label htmlFor="courseName">Course Name *</label>
        <input
          id="courseName"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="e.g. Full Stack Development"
          required
        />

        <label htmlFor="duration">Course Duration</label>
        <input
          id="duration"
          value={courseDuration}
          onChange={(e) => setCourseDuration(e.target.value)}
          placeholder="e.g. 3 months"
        />

        <label htmlFor="comments">Feedback Comments *</label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Write your feedback here..."
          rows="5"
          required
        />

        <label htmlFor="rating">Feedback Rating *</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
        >
          <option value="5">5 - Excellent ★★★★★</option>
          <option value="4">4 - Very Good ★★★★</option>
          <option value="3">3 - Good ★★★</option>
          <option value="2">2 - Fair ★★</option>
          <option value="1">1 - Poor ★</option>
        </select>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
          <button className="primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : editing ? "Save Changes" : "Submit Feedback"}
          </button>
        </div>
      </form>
    </section>
  );
}

function AppLayout() {
  return (
    <>
      <nav className="navbar">
        <div className="brand">✦ Feed<span>Admin</span></div>
        <div className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/add">Add Feedback</NavLink>
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<FeedbackForm />} />
          <Route path="/edit/:id" element={<FeedbackForm />} />
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </main>

      <footer>Feedback Admin Panel | MERN Stack</footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
