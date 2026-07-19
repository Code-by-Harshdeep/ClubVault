import React from "react";
import "./Transactions.css";

const Transactions = () => {
  return (
    <div className="transactions-page">
      <main className="transactions-container">

        {/* Header */}
        <section className="transactions-header">
          <div>
            <h1 className="transactions-title">Income &amp; Expenses</h1>
            <p className="transactions-subtitle">
              Ledger overview for Q3 2024
            </p>
          </div>

          <div className="transactions-toggle">
            <button className="toggle-btn active">
              Income
            </button>

            <button className="toggle-btn">
              Expenses
            </button>
          </div>
        </section>

        {/* KPI Cards */}

        <section className="transactions-kpi-grid">

          <div className="transactions-kpi-card">
            <span className="kpi-label">Total Income</span>

            <h2>₹12,450.00</h2>

            <p className="kpi-success">
              <span className="material-symbols-outlined">
                trending_up
              </span>

              +15% from last month
            </p>
          </div>

          <div className="transactions-kpi-card">
            <span className="kpi-label">
              Total Expenses
            </span>

            <h2>₹8,230.50</h2>

            <p className="kpi-success">
              <span className="material-symbols-outlined">
                trending_down
              </span>

              -5% from last month
            </p>
          </div>

          <div className="transactions-kpi-card">
            <span className="kpi-label">
              Net Cash Flow
            </span>

            <h2>₹4,219.50</h2>

            <p className="kpi-muted">
              Positive margin
            </p>
          </div>

        </section>

        {/* Ledger */}

        <section className="transactions-ledger">

          <div className="ledger-header">

            <h2>Transaction Ledger</h2>

            <div className="ledger-actions">

              <div className="search-box">

                <span className="material-symbols-outlined">
                  search
                </span>

                <input
                  type="text"
                  placeholder="Search..."
                />

              </div>

              <button className="action-btn">
                <span className="material-symbols-outlined">
                  filter_list
                </span>

                Filter
              </button>

              <button className="action-btn">
                <span className="material-symbols-outlined">
                  download
                </span>

                Export
              </button>

            </div>

          </div>

          {/* Table */}

          <div className="table-wrapper">

            <table className="transactions-table">

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="amount-column">
                    Amount
                  </th>
                </tr>

              </thead>

              <tbody>

                <tr>

                  <td>Oct 24, 2024</td>

                  <td>
                    <div className="transaction-title">
                      Fall Festival Catering
                    </div>

                    <div className="transaction-subtitle">
                      Invoice #4920
                    </div>
                  </td>

                  <td>
                    <span className="category-tag">
                      Events
                    </span>
                  </td>

                  <td className="amount negative">
                    -₹1,250.00
                  </td>

                </tr>

                <tr>

                  <td>Oct 22, 2024</td>

                  <td>
                    <div className="transaction-title">
                      Membership Dues Collection
                    </div>

                    <div className="transaction-subtitle">
                      Stripe Payout
                    </div>
                  </td>

                  <td>
                    <span className="category-tag">
                      Income
                    </span>
                  </td>

                  <td className="amount positive">
                    +₹3,400.00
                  </td>

                </tr>
                                <tr>

                  <td>Oct 18, 2024</td>

                  <td>
                    <div className="transaction-title">
                      Zoom Annual Subscription
                    </div>

                    <div className="transaction-subtitle">
                      Software
                    </div>
                  </td>

                  <td>
                    <span className="category-tag">
                      Operations
                    </span>
                  </td>

                  <td className="amount negative">
                    -₹149.90
                  </td>

                </tr>

                <tr>

                  <td>Oct 15, 2024</td>

                  <td>
                    <div className="transaction-title">
                      Alumni Donation
                    </div>

                    <div className="transaction-subtitle">
                      Check Deposit
                    </div>
                  </td>

                  <td>
                    <span className="category-tag">
                      Donations
                    </span>
                  </td>

                  <td className="amount positive">
                    +₹500.00
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

          {/* Pagination */}

          <div className="transactions-pagination">

            <span className="pagination-text">
              Showing 1–4 of 128 transactions
            </span>

            <div className="pagination-buttons">

              <button className="page-btn">
                <span className="material-symbols-outlined">
                  chevron_left
                </span>
              </button>

              <button className="page-btn">
                <span className="material-symbols-outlined">
                  chevron_right
                </span>
              </button>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
};

export default Transactions;