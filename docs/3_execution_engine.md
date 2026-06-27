# 3. Execution Engine Deep Dive

The **Execution Engine** is responsible for running the Directed Acyclic Graph (DAG) created by the Planner. It schedules tasks, resolves data parameters between nodes, runs tasks concurrently where possible, and manages failures.

---

## 1. Topological Sorting & Scheduling
Before running the workflow, the Execution Engine resolves the node dependency tree:
1. **Queue Creation**: Identifies all nodes with empty dependency lists (`dependencies: []`) and pushes them to the run list.
2. **Cycle Safety Check**: If nodes remain but none are eligible for execution due to unsatisfied dependencies, it stops the run and logs a graph cycle deadlock.
3. **Execution Levels**: Nodes that share the same dependencies are grouped into execution levels and run concurrently.

```
       [ Planner Agent ]  (Initialize Run)
               |
               v
      [ Sourcing Target ] (Level 0: Company Discovery)
               |
               v
     [ Check Cache Table ] (Level 1: Validation)
               |
               v
      [ Tech Scraper URL ] (Level 2: Enrichment)
               |
         +-----+-----+
         |           | (Concurrently)
         v           v
    [ Personas ]  [ Contacts ] (Level 3: Parallel Sourcing)
         |           |
         +-----+-----+
               |
               v
      [ Recommendation ] (Level 4: Scored Lead Profile)
               |
               v
     [ Human Queue Admin ] (Level 5: Approval Check)
```

---

## 2. Parallel Processing with Asyncio
To achieve performance, the Execution Engine groups independent sibling tasks and runs them concurrently:
```python
tasks_to_run = []
for step in ready_tasks:
    tasks_to_run.append(self._run_task(execution_id, step, task_outputs, memory))
    
# Process concurrent group
results = await asyncio.gather(*tasks_to_run, return_exceptions=True)
```
In our sales pipeline, enrichment processes for multiple companies are launched in parallel. This significantly decreases total latency compared to sequential iteration.

---

## 3. Fault Tolerance & Retry Handling
Every agent declares a retry policy in its metadata:
```python
retry_policy = {
    "max_retries": 3,
    "backoff_factor": 2.0
}
```
If an external API (e.g. search tool or scraper) fails due to a rate limit or timeout, the Execution Engine:
1. Catches the exception.
2. Formulates an exponential backoff delay:
   $$\text{Delay} = \text{backoff\_factor}^{\text{attempt}}$$
3. Halts execution for that task node while keeping sibling concurrent tasks active.
4. Resubmits the task. If all retries fail, the node is marked as `FAILED`, dependent child tasks are marked as `CANCELLED`, and the overall run state transitions to `FAILED`.
