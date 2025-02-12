import { ChangeEvent, useState, useMemo, useCallback } from "react";
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
];
const reimbursementTypes = ["Travel", "Internet", "Certification"];
const paymentCategories = [
  "Salary Discrepancy",
  "Salary not credited",
  "Advance salary",
];
const currencyCodes = ["USD", "EUR", "INR", "GBP"];

const issueTypeMapping: Record<string, string> = {
  "Incentive Request": "INCENTIVE_REQ",
  "Reimbursement Queries": "REIMBURSEMENT_Q",
  "Payroll Queries": "PAYROLL_Q",
};

const reimbursementTypeMapping: Record<string, string> = {
  Travel: "TRAVEL",
  Internet: "INTERNET",
  Certification: "CERTIFICATION",
};

const paymentCategoryMapping: Record<string, string> = {
  "Salary Discrepancy": "SALARY_DISCREPANCY",
  "Salary not credited": "SALARY_NOT_CREDITED",
  "Advance salary": "ADVANCE_SALARY",
};

const initialFormData = {
  employeeID: "",
  orderID: "",
  issueType: issueTypes[0],
  reimbursementType: reimbursementTypes[0],
  paymentCategory: paymentCategories[0],
  amountClaimed: "",
  currencyCode: currencyCodes[0],
  attachment: null as File | null,
  comment: "",
};

const EmployeePortal = () => {
  const [formData, setFormData] = useState(initialFormData);

  const showAlert = useCallback(
    (message: string, alertType: "success" | "error") => {
      alertType === "success"
        ? StatusAlertService.showSuccess(message)
        : StatusAlertService.showError(message);
    },
    []
  );

  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value, files, type } = e.target as HTMLInputElement;
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "file" ? files?.[0] || null : value,
      }));
    },
    []
  );

  const isFormValid = useMemo(() => {
    const {
      employeeID,
      orderID,
      amountClaimed,
      attachment,
      issueType,
      comment,
    } = formData;
    if (issueType === "Incentive Request") {
      return employeeID.trim() !== "" && orderID.trim() !== "";
    } else if (issueType === "Reimbursement Queries") {
      return (
        employeeID.trim() !== "" &&
        amountClaimed.trim() !== "" &&
        attachment !== null
      );
    } else if (issueType === "Payroll Queries") {
      return employeeID.trim() !== "" && comment.trim() !== "";
    }
    return false;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const encodedCredentials = btoa(`${USERNAME}:${PASSWORD}`);

      const requestData = {
        ...formData,
        issueType: issueTypeMapping[formData.issueType],
        reimbursementType: reimbursementTypeMapping[formData.reimbursementType],
        paymentCategory: paymentCategoryMapping[formData.paymentCategory],
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
    },
    [formData, showAlert]
  );

  return (
    <div className="container">
      <img src={BackgroudImage} className="bg-image" alt="background" />
      <StatusAlert />
      <div className="form-container">
        <div className="company-logo-container">
          <img src={logo} className="company-logo" alt="company logo" />
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
                <label>Category</label>
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
                <label>Currency</label>
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

          {formData.issueType === "Payroll Queries" && (
            <>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="paymentCategory"
                  value={formData.paymentCategory}
                  onChange={handleChange}
                >
                  {paymentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Comment</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`submit-button ${!isFormValid ? "disabled-button" : ""}`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeePortal;
