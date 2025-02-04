import { useState } from "react";
import "../index.css";

const EmployeePortal = () => {
  const [formData, setFormData] = useState({
    employeeID: "",
    orderID: "",
    issueType: "Incentive Request",
  });

  const issueTypes = [
    "Incentive Request",
    "Reimbursement Queries",
    "Expense Settlement",
    "IT Request",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    const username =
      "sb-5ffb6fb1-b1c0-43e3-b786-141d00067f10!b26498|it-rt-dev-pwot3ip1!b18631";
    const password =
      "95559218-8ff2-4e62-8290-7b70aa493ddd$8uT25mb3J1870ApajNjUyZq6vKZ4CqjyF0yul704-bs=";

    const encodedCredentials = btoa(`${username}:${password}`);

    try {
      const response = await fetch(
        "https://dev-pwot3ip1.it-cpi023-rt.cfapps.eu20-001.hana.ondemand.com/http/caseCreation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${encodedCredentials}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        alert("Failed to submit form. Status: " + response.status);
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Employee Portal</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Issue Type</label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
            >
              {issueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {formData.issueType === "Incentive Request" && (
            <>
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employeeID"
                  value={formData.employeeID}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Order ID</label>
                <input
                  type="text"
                  name="orderID"
                  value={formData.orderID}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeePortal;
