
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/students";

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");

  async function loadStudents() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load students");
      const data = await response.json();
      setStudents(data);
    } catch {
      setMessage("Cannot connect to backend. Check that it is running.");
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function addStudent(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  name,
  rollNo: rollNumber,
  department: "Computer Science",
}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add student");
      }

      setName("");
      setRollNumber("");
      setMessage("Student added successfully!");
      loadStudents();
    } catch (error) {
      setMessage(error.message || "Could not add student.");
    }
  }

  async function markAttendance(studentId, status) {
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }));
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">STUDENT MANAGEMENT</p>
          <h1>Attendance Dashboard</h1>
          <p>Manage students and record daily attendance.</p>
        </div>
        <div className="date">
          {new Date().toLocaleDateString()}
        </div>
      </header>

      <section className="stats">
        <div className="stat-card">
          <span>Total Students</span>
          <h2>{students.length}</h2>
        </div>
        <div className="stat-card">
          <span>Present Today</span>
          <h2>
            {Object.values(attendance).filter(
              (status) => status === "Present"
            ).length}
          </h2>
        </div>
        <div className="stat-card">
          <span>Absent Today</span>
          <h2>
            {Object.values(attendance).filter(
              (status) => status === "Absent"
            ).length}
          </h2>
        </div>
      </section>

      <section className="panel">
        <h2>Add New Student</h2>
        <form onSubmit={addStudent} className="student-form">
          <input
            placeholder="Student name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Roll number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
          <button type="submit">+ Add Student</button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="panel">
        <h2>Student Attendance</h2>
        {students.length === 0 ? (
          <p>No students yet. Add your first student above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Attendance Today</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.rollNo}</td>
                    <td>{student.name}</td>
                    <td>
                      <div className="actions">
                        <button
                          className={
                            attendance[student._id] === "Present"
                              ? "present selected"
                              : "present"
                          }
                          onClick={() =>
                            markAttendance(student._id, "Present")
                          }
                        >
                          Present
                        </button>
                        <button
                          className={
                            attendance[student._id] === "Absent"
                              ? "absent selected"
                              : "absent"
                          }
                          onClick={() =>
                            markAttendance(student._id, "Absent")
                          }
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <footer>Student Attendance Management System</footer>
    </div>
  );
}

export default App;
