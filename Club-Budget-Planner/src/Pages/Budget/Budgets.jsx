import React from "react";
import "./Budgets.css";

const Budgets = () => {
  return (
    <div className="dashboard-content">
      <main className="budgets-container">

        {/* Header */}
        <header className="page-header">
          <div>
            <h1 className="page-title">Budgets</h1>
            <p className="page-subtitle">
              Allocate funds and monitor expenditure across all committee
              initiatives.
            </p>
          </div>

          <button className="primary-btn">
            <span className="material-symbols-outlined">add_circle</span>
            Create New Budget
          </button>
        </header>

        {/* KPI Cards */}
        <section className="kpi-grid">

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="material-symbols-outlined">
                account_balance
              </span>
              <h3>Total Allocated</h3>
            </div>

            <div className="kpi-body">
              <h2>₹15,000.00</h2>
              <p>Annual Fiscal Year 2024</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="material-symbols-outlined">
                trending_up
              </span>
              <h3>Total Spent</h3>
            </div>

            <div className="kpi-body">
              <h2>₹8,450.00</h2>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: "56%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span className="material-symbols-outlined">
                savings
              </span>
              <h3>Remaining Balance</h3>
            </div>

            <div className="kpi-body">
              <h2>₹6,550.00</h2>
              <p className="status-success">Healthy status</p>
            </div>
          </div>

        </section>

        {/* Active Budgets */}
        <section className="budget-section">

          <div className="section-header">
            <h2>Active Allocations</h2>

            <button className="filter-btn">
              <span className="material-symbols-outlined">
                filter_list
              </span>
              Filter
            </button>
          </div>

          <div className="budget-list">

            {/* Budget Card 1 */}
            <article className="budget-card">
              <div className="budget-top">

                <div className="budget-info">
                  <div className="budget-title-row">
                    <h3>Fall Gala 2024</h3>
                    <span className="budget-tag">Event</span>
                  </div>

                  <p>
                    Venue, catering, and marketing expenses.
                  </p>
                </div>

                <div className="budget-amount">
                  <h3>
                    ₹5,000
                    <span> / ₹8,000</span>
                  </h3>

                  <p>62.5% Utilized</p>
                </div>

              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: "62.5%" }}
                ></div>
              </div>
            </article>

            {/* Budget Card 2 */}
            <article className="budget-card">
              <div className="budget-top">

                <div className="budget-info">
                  <div className="budget-title-row">
                    <h3>Spring Recruitment</h3>
                    <span className="budget-tag">
                      Operations
                    </span>
                  </div>

                  <p>
                    Flyers, booth materials, and software licenses.
                  </p>
                </div>

                <div className="budget-amount">
                  <h3>
                    ₹2,100
                    <span> / ₹3,000</span>
                  </h3>

                  <p className="warning">
                    70.0% Utilized - Warning
                  </p>
                </div>

              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </article>
                {/* Budget Card 3 */}
<article className="budget-card">
  <div className="budget-top">
    <div className="budget-info">
      <div className="budget-title-row">
        <h3>Tech &amp; Tools</h3>
        <span className="budget-tag">Infrastructure</span>
      </div>

      <p>
        Website hosting, domain, and productivity suite.
      </p>
    </div>

    <div className="budget-amount">
      <h3>
        ₹1,350
        <span> / ₹4,000</span>
      </h3>

      <p>33.7% Utilized</p>
    </div>
  </div>

  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: "33.7%" }}
    ></div>
  </div>
</article>
        </div>
      </section>
    </main>
  </div>
);
};

export default Budgets;