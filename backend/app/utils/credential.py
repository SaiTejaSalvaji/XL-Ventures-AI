"""
GCP Credentials helper.

Google Cloud uses Application Default Credentials (ADC) automatically. This
module is provided for API-compatibility with any code that previously called
`get_azure_credential()`. It is a no-op for GCP — the GCP client libraries
resolve credentials from the environment chain automatically:

  1. GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service-account JSON key file.
  2. gcloud Application Default Credentials (run `gcloud auth application-default login`).
  3. GCE / Cloud Run / GKE workload identity metadata server.
"""

import logging

logger = logging.getLogger("app.utils.credential")


def get_gcp_credentials():
    """
    Return GCP Google Auth credentials, or None to let client libraries resolve
    Application Default Credentials automatically from the environment.
    """
    try:
        import google.auth
        credentials, project = google.auth.default()
        logger.info(f"Resolved GCP ADC credentials for project: {project}")
        return credentials
    except Exception as e:
        logger.warning(f"Could not resolve GCP credentials: {e}. Client libraries will try ADC automatically.")
        return None


# Legacy aliases for any code that still imports Azure helpers
def get_azure_credential():
    """Compatibility shim — returns None; GCP libraries use ADC automatically."""
    return None


async def get_azure_credential_async():
    """Compatibility shim — returns None; GCP libraries use ADC automatically."""
    return None

