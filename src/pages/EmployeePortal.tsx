import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import StatusAlert, { StatusAlertService } from "react-status-alert";
import "react-status-alert/dist/status-alert.css";
import "../index.css";
import logo from "../assets/SvartLogo.png";
import BackgroudImage from "../assets/BackgroundImage.png";
import Loader from "../components/Loader";

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
  "Salary Not Credited",
  "Advance Salary",
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
  "Salary Not Credited": "SALARY_NOT_CREDITED",
  "Advance Salary": "ADVANCE_SALARY",
};

const initialFormData = {
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
  const [searchParams] = useSearchParams();
  const employeeID = searchParams.get("employee_id");
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  const showAlert = useCallback(
    (message: string, alertType: "success" | "error") => {
      alertType === "success"
        ? StatusAlertService.showSuccess(message)
        : StatusAlertService.showError(message);
    },
    []
  );

  const handleIssueTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...initialFormData,
      issueType: e.target.value,
    });
  };

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
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
    const { orderID, amountClaimed, attachment, issueType, comment } = formData;
    if (issueType === "Incentive Request") {
      return orderID.trim() !== "";
    } else if (issueType === "Reimbursement Queries") {
      return amountClaimed.trim() !== "" && attachment !== null;
    } else if (issueType === "Payroll Queries") {
      return comment.trim() !== "";
    }
    return false;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      if (!employeeID) {
        showAlert("Employee ID is missing in the URL", "error");
        setLoading(false);
        return;
      }

      const encodedCredentials = btoa(`${USERNAME}:${PASSWORD}`);

      let requestData: Record<string, any> = {
        employeeID,
        issueType: issueTypeMapping[formData.issueType],
      };

      if (formData.issueType === "Incentive Request" && formData.orderID) {
        requestData.orderID = formData.orderID;
      }

      if (formData.issueType === "Reimbursement Queries") {
        requestData = {
          ...requestData,
          reimbursementType:
            reimbursementTypeMapping[formData.reimbursementType],
          amountClaimed: formData.amountClaimed,
          currencyCode: formData.currencyCode,
        };
      }

      if (formData.issueType === "Payroll Queries") {
        requestData = {
          ...requestData,
          paymentCategory: paymentCategoryMapping[formData.paymentCategory],
          comment: formData.comment,
        };
      }

      requestData = Object.fromEntries(
        Object.entries(requestData).filter(([_, v]) => v !== undefined)
      );

      const encodeFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
      };

      try {
        if (
          formData.issueType === "Reimbursement Queries" &&
          formData.attachment
        ) {
          requestData.attachment = await encodeFileToBase64(
            formData.attachment
          );
        }

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
          setFormData(initialFormData);
        } else {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          showAlert("Oops... Something went wrong.", "error");
        }
      } catch (error) {
        console.error("Error:", error);
        showAlert("Oops... Something went wrong.", "error");
      } finally {
        setLoading(false);
      }
    },
    [formData, showAlert, employeeID]
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
              onChange={handleIssueTypeChange}
            >
              {issueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
            {loading ? <Loader /> : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeePortal;
