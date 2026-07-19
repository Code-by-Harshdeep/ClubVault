import React from "react";
import "./ReportsAnalytics.css";

const ReportsAnalytics = () => {
  return (
    <div className="reports-page">
    

      {/* ================= Mobile Header ================= */}

      <header className="mobile-header">
        <h2>Finance Committee</h2>
        <button>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* ================= Main Content ================= */}

      <main className="main-content">
      
        <div className="page-container">
          {/* ================= Page Header ================= */}

          <section className="page-header">
            <div className="header-left">
              <h1>Reports &amp; Analytics</h1>
              <p>Comprehensive overview of financial performance and categorical spending.</p>
            </div>

            <div className="header-actions">
              <button className="filter-btn">
                <span className="material-symbols-outlined">calendar_month</span>
                <span>Q4 2023</span>
                <span className="material-symbols-outlined">expand_more</span>
              </button>

              <button className="export-btn">
                <span className="material-symbols-outlined">download</span>
                <span>CSV</span>
              </button>

              <button className="pdf-btn">
                <span className="material-symbols-outlined">picture_as_pdf</span>
                <span>PDF Report</span>
              </button>
            </div>
          </section>

          {/* ================= Grid Starts ================= */}

          <div className="analytics-grid">
            {/* ================= KPI Cards ================= */}

            <div className="kpi-grid">
              {/* KPI 1 */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <h3>Total Expenditures</h3>
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>

                <h2>₹24,850.00</h2>

                <div className="kpi-footer">
                  <span className="badge danger">
                    <span className="material-symbols-outlined">trending_up</span>
                    +14.2%
                  </span>
                  <span>vs previous quarter</span>
                </div>
              </div>

              {/* KPI 2 */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <h3>Remaining Budget</h3>
                  <span className="material-symbols-outlined">savings</span>
                </div>

                <h2>₹15,150.00</h2>

                <div className="kpi-footer">
                  <div className="progress">
                    <div className="progress-fill" style={{ width: "38%" }}></div>
                  </div>
                  <span className="progress-text">38% Left</span>
                </div>
              </div>

              {/* KPI 3 */}
              <div className="kpi-card">
                <div className="kpi-top">
                  <h3>Fund Inflow</h3>
                  <span className="material-symbols-outlined">arrow_insert</span>
                </div>

                <h2>₹40,000.00</h2>

                <div className="kpi-footer">
                  <span className="badge success">
                    <span className="material-symbols-outlined">check_circle</span>
                    On Track
                  </span>
                  <span>Annual allocation met</span>
                </div>
              </div>
            </div>

            {/* ================= Fund Utilization Trend ================= */}

            <div className="line-chart-card">
              <div className="card-header">
                <div>
                  <h2>Fund Utilization Trend</h2>
                  <p>Monthly expenditure vs baseline projection.</p>
                </div>

                <button className="icon-btn">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>

              <div className="chart-area">
                <div className="chart-grid">
                  <div className="grid-line"><span>20k</span></div>
                  <div className="grid-line"><span>15k</span></div>
                  <div className="grid-line"><span>10k</span></div>
                  <div className="grid-line"><span>5k</span></div>
                  <div className="grid-line"><span>0</span></div>
                </div>

                <svg className="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d="M0,80 L20,70 L40,60 L60,50 L80,40 L100,30"
                    className="projected-line"
                    fill="none"
                  />
                  <path
                    d="M0,90 Q15,85 20,75 T40,65 T60,45 T80,40 T100,20"
                    className="actual-line"
                    fill="none"
                  />
                  <circle cx="0" cy="90" r="1.5" className="point" />
                  <circle cx="20" cy="75" r="1.5" className="point" />
                  <circle cx="40" cy="65" r="1.5" className="point" />
                  <circle cx="60" cy="45" r="1.5" className="point" />
                  <circle cx="80" cy="40" r="1.5" className="point" />
                  <circle cx="100" cy="20" r="1.5" className="point" />
                </svg>

                <div className="x-axis">
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                  <span>Dec</span>
                </div>
              </div>

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-line actual"></span>
                  <span>Actual Spend</span>
                </div>

                <div className="legend-item muted">
                  <span className="legend-line projected"></span>
                  <span>Projected</span>
                </div>
              </div>
            </div>

            {/* ================= Donut Chart ================= */}

            <div className="donut-card">
              <div className="card-header">
                <div>
                  <h2>Spending by Category</h2>
                  <p>Distribution of funds this quarter.</p>
                </div>
              </div>

              <div className="donut-wrapper">
                <div className="donut-chart">
                  <div className="donut-center">
                    <strong>4</strong>
                    <span>Categories</span>
                  </div>
                </div>

                <div className="category-list">
                  <div className="category-item">
                    <div className="category-name">
                      <span className="category-dot dot-events"></span>
                      <span>Events &amp; Programming</span>
                    </div>
                    <span className="category-percent">45%</span>
                  </div>

                  <div className="category-item">
                    <div className="category-name">
                      <span className="category-dot dot-marketing"></span>
                      <span>Marketing &amp; Merch</span>
                    </div>
                    <span className="category-percent">25%</span>
                  </div>

                  <div className="category-item">
                    <div className="category-name">
                      <span className="category-dot dot-office"></span>
                      <span>Office Supplies</span>
                    </div>
                    <span className="category-percent">15%</span>
                  </div>

                  <div className="category-item">
                    <div className="category-name">
                      <span className="category-dot dot-other"></span>
                      <span>Miscellaneous</span>
                    </div>
                    <span className="category-percent">15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= Transactions Table ================= */}

            <div className="transaction-card">
              <div className="transaction-header">
                <div>
                  <h3>Significant Transactions</h3>
                  <p>Expenditures exceeding ₹500 for the selected period.</p>
                </div>

                <a href="#" className="ledger-btn">View Ledger →</a>
              </div>

              <div className="table-wrapper custom-scrollbar">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Category</th>
                      <th className="amount-cell">Amount</th>
                      <th className="receipt-cell">Receipt</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>Nov 12, 2023</td>
                      <td>Winter Gala Venue Deposit</td>
                      <td><span className="category-tag">Events</span></td>
                      <td className="amount-cell">-₹2,500.00</td>
                      <td className="receipt-cell">
                        <button className="attachment-btn">
                          <span className="material-symbols-outlined">attachment</span>
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>Nov 05, 2023</td>
                      <td>Custom T-Shirts Order (Batch A)</td>
                      <td><span className="category-tag outline">Marketing</span></td>
                      <td className="amount-cell">-₹850.00</td>
                      <td className="receipt-cell">
                        <button className="attachment-btn">
                          <span className="material-symbols-outlined">attachment</span>
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td>Oct 28, 2023</td>
                      <td>Guest Speaker Honorarium: Dr. Smith</td>
                      <td><span className="category-tag">Events</span></td>
                      <td className="amount-cell">-₹1,000.00</td>
                      <td className="receipt-cell">
                        <span className="pending">Pending</span>
                      </td>
                    </tr>

                    <tr>
                      <td>Oct 15, 2023</td>
                      <td>Annual Software Licenses (Adobe, Zoom)</td>
                      <td><span className="category-tag outline">Supplies</span></td>
                      <td className="amount-cell">-₹620.00</td>
                      <td className="receipt-cell">
                        <button className="attachment-btn">
                          <span className="material-symbols-outlined">attachment</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsAnalytics;