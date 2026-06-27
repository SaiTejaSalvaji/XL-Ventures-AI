# 7. Frontend Design & Interface Architecture

The ProspectPilot AI frontend is built to deliver a premium, high-fidelity experience matching modern enterprise SaaS platforms (such as Vercel, Linear, and Stripe). The client operates as a **React + TypeScript Single-Page Application (SPA)** bundled with **Vite** and styled with **Tailwind CSS v4**.

---

## 1. Design Aesthetics & Visual Tokens
The visual design system is defined in `frontend/src/index.css` under the dark theme configuration:
- **Background Palette**: Deep Zinc (#09090b) combined with slate/indigo grid overlays (`.grid-bg`) to establish depth.
- **Glassmorphism**: Cards use `.glass-card`, which combines background transparency, heavy blur filters, and light border overlays:
  ```css
  .glass-card {
    background: rgba(20, 20, 25, 0.65);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(63, 63, 70, 0.4);
  }
  ```
- **State Indicators (Glows)**:
  - **Running**: Pulsing Indigo (`.pulse-primary`) to display activity.
  - **Memory Hit**: Amber text and glowing borders (`.glow-warning`) to highlight cache hits.
  - **Approved**: Emerald borders and background badges to signal qualified leads.

---

## 2. Shared State Navigation
To keep the application fast and preserve active execution states (e.g. tracking a running agent pipeline in real-time while browsing settings), the frontend is built as a unified dynamic layout shell in `App.tsx`.

```
                  +-----------------------------------------+
                  |                 App.tsx                 |
                  |  (Active Tab state: "dashboard", etc.)  |
                  +--------------------+--------------------+
                                       |
        +------------------+-----------+-----------+------------------+
        |                  |                       |                  |
        v                  v                       v                  v
[DashboardView]     [WorkflowView]           [MonitorView]       [QueueView]
 (KPIs, Charts)      (Config Panel)        (Live Pulses, Logs) (Human Approval)
```

- When the user triggers an execution run inside **Workflow Builder**, a callback (`onTriggerExecution`) updates the root tab state to `"monitor"` and stores the generated run UUID (`activeExecutionId`).
- This transitions the user to the progress timeline and terminal logger view without page refreshes, maintaining background polling.

---

## 3. Dynamic Custom Charts & SVGs
To avoid compile issues on Windows and keep bundle sizes small, all analytics charts (such as the Lead Conversion Funnel on the Dashboard) are drawn using responsive CSS flexbox elements and custom SVGs:
- **Conversion Funnel**: Scaled vertically dynamically based on lead volumes:
  $$\text{Height} = \frac{\text{Stage Leads}}{\text{Total Discovered}} \times 160\text{px}$$
- **Match Score Rings**: Drawn using circular offsets inside inline SVGs to display lead fit percentages.
- **Pulsing DAG Monitor**: The agent pipeline timeline represents states dynamically using active glowing borders, rendering step run progress in real-time.
