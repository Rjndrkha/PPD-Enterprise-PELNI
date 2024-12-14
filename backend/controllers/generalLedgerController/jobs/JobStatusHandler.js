const { executePostgreQuery } = require("../../../services/postgreServices");

const jobStatusHandler = async (status, job, err = null) => {
  const message = err
    ? err.message
    : status === "active"
    ? "Job is active"
    : null;
  await updateLogStatus(job.id, status, err?.message || null, null);
  return { process: status, message };
};

async function updateLogStatus(jobId, status, errorMessage = null, filepath) {
  let completed_date = null;

  if (status === "Completed") {
    completed_date = new Date().toISOString();
  }
  const query = `
    UPDATE log_request_gl
    SET status = $1, error_message = $2, completed_at = $3 , file_path = $4
    WHERE job_id = $5
  `;
  const params = [status, errorMessage, completed_date, filepath, jobId];
  await executePostgreQuery(query, params);
}

module.exports = { jobStatusHandler, updateLogStatus };
