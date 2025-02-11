import { ChangeEvent, useState } from "react";
import StatusAlert, { StatusAlertService } from "react-status-alert";
import "react-status-alert/dist/status-alert.css";
import "../index.css";
import logo from "../assets/SvartLogo.png";
import BackgroudImage from "../assets/BackgroundImage.png";

const USERNAME =
  "sb-5ffb6fb1-b1c0-43e3-b786-141d00067f10!b26498|it-rt-dev-pwot3ip1!b18631";
const PASSWORD =
  "95559218-8ff2-4e62-8290-7b70aa493ddd$8uT25mb3J1870ApajNjUyZq6vKZ4CqjyF0yul704-bs=";

const issueTypes = [
  "Incentive Request",
  "Reimbursement Queries",
  "Payroll Queries",
  "IT Request",
];
const reimbursementTypes = ["Travel", "Internet", "Certification"];
const currencyCodes = ["USD", "EUR", "INR", "GBP"];

const issueTypeMapping: Record<string, string> = {
  "Incentive Request": "INCENTIVE_REQ",
  "Reimbursement Queries": "REIMBURSEMENT_Q",
  "Payroll Queries": "PAYROLL_Q",
  "IT Request": "IT_REQ",
};

const EmployeePortal = () => {
  const [formData, setFormData] = useState({
    employeeID: "",
    orderID: "",
    issueType: issueTypes[0],
    reimbursementType: reimbursementTypes[0],
    amountClaimed: "",
    currencyCode: currencyCodes[0],
    attachment: null as File | null,
  });

  const showAlert = (message: string, alertType: "success" | "error") => {
    alertType === "success"
      ? StatusAlertService.showSuccess(message)
      : StatusAlertService.showError(message);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files, type } = e.target as HTMLInputElement;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "file" ? files?.[0] || null : value,
    }));
  };

  const validationRules: Record<string, () => boolean> = {
    "Incentive Request": () =>
      formData.employeeID.trim() !== "" && formData.orderID.trim() !== "",
    "Reimbursement Queries": () =>
      formData.employeeID.trim() !== "" &&
      formData.amountClaimed.trim() !== "" &&
      formData.currencyCode.trim() !== "" &&
      formData.attachment !== null,
  };

  const isFormValid = validationRules[formData.issueType] ?? (() => false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const encodedCredentials = btoa(`${USERNAME}:${PASSWORD}`);

    const requestData = {
      ...formData,
      issueType: issueTypeMapping[formData.issueType],
    };

    const formDataToSend = new FormData();
    Object.entries(requestData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value.toString());
    });

    try {
      const response = await fetch(
        "https://nagarrodev.test01.apimanagement.eu20.hana.ondemand.com:443/caseCreation",
        {
          method: "POST",
          headers: { Authorization: `Basic ${encodedCredentials}` },
          body: formDataToSend,
        }
      );

      response.status === 201
        ? showAlert("Success!", "success")
        : showAlert("Oops... Something went wrong.", "error");
    } catch (error) {
      showAlert("Oops... Something went wrong.", "error");
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <img src={BackgroudImage} className="bg-image" />
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

          {formData.issueType === "Incentive Request" && (
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
          )}

          {formData.issueType === "Reimbursement Queries" && (
            <>
              <div className="form-group">
                <label>Reimbursement Type</label>
                <select
                  name="reimbursementType"
                  value={formData.reimbursementType}
                  onChange={handleChange}
                >
                  {reimbursementTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Amount Claimed</label>
                <input
                  type="number"
                  name="amountClaimed"
                  value={formData.amountClaimed}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Currency Code</label>
                <select
                  name="currencyCode"
                  value={formData.currencyCode}
                  onChange={handleChange}
                >
                  {currencyCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Attachment</label>
                <input
                  type="file"
                  name="attachment"
                  accept=".pdf,.jpg,.png,.doc,.docx"
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={!isFormValid()}
            className={`submit-button ${
              !isFormValid() ? "disabled-button" : ""
            }`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeePortal;
