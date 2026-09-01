/**
 * Customer.io workspace resolution.
 *
 * There are three logical targets (`sample`, `ca`, `us`) and exactly one write key per
 * target. Resolution fails closed in every ambiguous case, and there is deliberately no
 * fallback between targets: selecting `ca` while `CUSTOMERIO_CA_WRITE_KEY` is absent sends
 * nothing at all rather than quietly routing Canadian production traffic into the Sample
 * workspace. The same holds for `us`.
 *
 * Switching targets is therefore an environment change only. No code change is required to
 * activate a production workspace once its key exists.
 *
 * Env contract:
 *   CUSTOMERIO_ENABLED           "true" enables the integration. Anything else disables it.
 *   CUSTOMERIO_WORKSPACE         "sample" | "ca" | "us". Any other value fails closed.
 *   CUSTOMERIO_SAMPLE_WRITE_KEY  Pipelines write key for the Sample workspace.
 *   CUSTOMERIO_CA_WRITE_KEY      Pipelines write key for Rocky Canada production.
 *   CUSTOMERIO_US_WRITE_KEY      Pipelines write key for Rocky USA production.
 *
 * None of these may ever be exposed as NEXT_PUBLIC_*. The write key is read on the server
 * only, inside the relay routes under app/api/customerio/.
 */

/** The only accepted values of CUSTOMERIO_WORKSPACE, in escalation order. */
export const CUSTOMERIO_WORKSPACES = ["sample", "ca", "us"];

/**
 * Write key env var per workspace. An explicit map, not a computed name, so that a typo in
 * CUSTOMERIO_WORKSPACE can never resolve to a real key belonging to another workspace.
 */
const WRITE_KEY_ENV_BY_WORKSPACE = {
  sample: "CUSTOMERIO_SAMPLE_WRITE_KEY",
  ca: "CUSTOMERIO_CA_WRITE_KEY",
  us: "CUSTOMERIO_US_WRITE_KEY",
};

/**
 * Our Customer.io account region is US. The EU host (https://cdp-eu.customer.io) is not
 * implemented on purpose: region is fixed at workspace creation, ours is US, so an EU host
 * reachable from this code could only ever be a misconfiguration.
 */
export const CUSTOMERIO_PIPELINES_HOST = "https://cdp.customer.io";

/** Reasons a resolution can refuse. Stable strings, safe to log. */
export const CUSTOMERIO_REFUSALS = {
  DISABLED: "disabled",
  INVALID_WORKSPACE: "invalid-workspace",
  MISSING_WRITE_KEY: "missing-write-key",
};

const asTrimmedString = (value) => (typeof value === "string" ? value.trim() : "");

const refuse = (reason, workspace = null) => ({
  enabled: false,
  workspace,
  writeKey: null,
  host: CUSTOMERIO_PIPELINES_HOST,
  reason,
});

/**
 * Resolve the active Customer.io target from the environment.
 *
 * Whitespace around a value is trimmed, because a trailing space in a dashboard-entered env
 * var is invisible and cannot route traffic to the wrong workspace. Case is NOT folded: the
 * accepted values are lowercase, and "CA" failing closed is the safe outcome.
 *
 * @param {Record<string, string | undefined>} [env] Defaults to process.env.
 * @returns {{ enabled: boolean, workspace: string | null, writeKey: string | null,
 *            host: string, reason: string }} `enabled` is true only when a workspace is
 *          valid AND its own write key is present. `writeKey` is null whenever `enabled` is
 *          false, so a disabled or misconfigured resolution carries no credential at all.
 */
export function resolveCustomerioConfig(env = process.env) {
  const source = env || {};

  if (source.CUSTOMERIO_ENABLED !== "true") {
    return refuse(CUSTOMERIO_REFUSALS.DISABLED);
  }

  const workspace = asTrimmedString(source.CUSTOMERIO_WORKSPACE);
  if (!CUSTOMERIO_WORKSPACES.includes(workspace)) {
    return refuse(CUSTOMERIO_REFUSALS.INVALID_WORKSPACE, workspace || null);
  }

  const writeKey = asTrimmedString(source[WRITE_KEY_ENV_BY_WORKSPACE[workspace]]);
  if (!writeKey) {
    return refuse(CUSTOMERIO_REFUSALS.MISSING_WRITE_KEY, workspace);
  }

  return {
    enabled: true,
    workspace,
    writeKey,
    host: CUSTOMERIO_PIPELINES_HOST,
    reason: "ok",
  };
}

/**
 * A log-safe view of a resolution. Never carries the write key, only whether one was found.
 *
 * @param {ReturnType<typeof resolveCustomerioConfig>} config
 */
export function describeCustomerioConfig(config) {
  return {
    enabled: !!config?.enabled,
    workspace: config?.workspace || null,
    has_write_key: !!config?.writeKey,
    reason: config?.reason || null,
  };
}
