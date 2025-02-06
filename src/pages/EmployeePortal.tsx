import { ChangeEvent, useState } from "react";
import StatusAlert, { StatusAlertService } from "react-status-alert";
import "react-status-alert/dist/status-alert.css";
import "../index.css";
import logo from "../assets/SvartLogo.png";

const USERNAME =
  "sb-5ffb6fb1-b1c0-43e3-b786-141d00067f10!b26498|it-rt-dev-pwot3ip1!b18631";
const PASSWORD =
  "95559218-8ff2-4e62-8290-7b70aa493ddd$8uT25mb3J1870ApajNjUyZq6vKZ4CqjyF0yul704-bs=";

const issueTypes = [
  "Incentive Request",
  "Reimbursement Queries",
  "Expense Settlement",
  "IT Request",
];

const issueTypeMapping: Record<string, string> = {
  "Incentive Request": "INCENTIVE_REQ",
  "Reimbursement Queries": "REIMBURSEMENT_Q",
  "Expense Settlement": "EXPENSE_SETTLE",
  "IT Request": "IT_REQ",
};

const EmployeePortal = () => {
  const [formData, setFormData] = useState({
    employeeID: "",
    orderID: "",
    issueType: issueTypes[0],
  });

  const showAlert = (message: string, alertType: "success" | "error"): void => {
    if (alertType === "success") {
      StatusAlertService.showSuccess(message);
    } else {
      StatusAlertService.showError(message);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const encodedCredentials = btoa(`${USERNAME}:${PASSWORD}`);

    const requestData = {
      ...formData,
      issueType: issueTypeMapping[formData.issueType],
    };

    try {
      const response = await fetch(
        "https://nagarrodev.test01.apimanagement.eu20.hana.ondemand.com:443/caseCreation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${encodedCredentials}`,
          },
          body: JSON.stringify(requestData),
        }
      );
      if (response.status === 201) {
        showAlert("Success!", "success");
      } else {
        showAlert(`Oops... Something went wrong.`, "error");
        console.info(response);
      }
    } catch (error) {
      showAlert(`Oops... Something went wrong.`, "error");
      console.error("Error during form submission:", error);
    }
  };

  const isFormValid = () => {
    if (formData.issueType === "Incentive Request") {
      return (
        formData.employeeID.trim() !== "" && formData.orderID.trim() !== ""
      );
    }
    return false;
  };

  return (
    <div className="container">
      <StatusAlert />
      <div className="form-container">
        <div className="company-logo-container">
          <img src={logo} className="company-logo" />
        </div>
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

          <button
            type="submit"
            className={`submit-button ${
              !isFormValid() ? "disabled-button" : ""
            }`}
            disabled={!isFormValid()}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeePortal;
