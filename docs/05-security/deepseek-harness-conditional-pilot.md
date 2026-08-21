# DeepSeek Harness Conditional Pilot Controls

- **Status:** Internal engineering safeguard only. This is **not** a production integration, customer feature, or authorization to process RipoDoc customer data.

- **Decision:** Harness is prohibited from RipoDoc customer evidence, customer PDFs, customer names, customer email addresses, real lead contacts, report manifests, production logs, production credentials, production repository checkouts, or any browser-local Evidence Composer workflow.

- **Permitted pilot purpose:** Synthetic, read-only internal engineering material only; for example, a deliberately generated code-review fixture or redacted documentation-classification fixture.

- **Required evidence command:** `npm run preflight:deepseek-harness-pilot -- <pilot-evidence.json>`.

- **Fail-closed rule:** The command approves a conditional pilot only when a record has an immutable source commit, archive and lockfile SHA-256 digests, synthetic read-only scope, and evidence for every gate below. It never authorizes production use.

## Exact Threat Model

- **Model-provider egress:** Any prompt, attachment, tool result, or injected context made model-visible can be sent to the configured external model provider. **Control:** Only synthetic/redacted data; an approved provider contract; firewall allowlist to the one required provider endpoint.

- **Durable session retention:** Harness records model-visible context, tool records, file paths, outputs, and logs for replay. **Control:** Treat its local state as sensitive; use an encrypted disposable workspace; destroy session store, cache, credentials, and VM/container after the pilot.

- **Prompt injection:** Repository files, documents, web content, issue text, package metadata, and tool outputs may contain instructions designed to make an agent read forbidden data or invoke tools. **Control:** Disable all unnecessary tools; use a read-only synthetic fixture; run a hostile-fixture test before approval.

- **Filesystem exposure:** A selected workspace can become readable or writable to the agent. **Control:** Mount only a small synthetic fixture directory read-only; never mount a real RipoDoc checkout, home directory, source archive, or secret store.

- **Shell and subprocess execution:** Default modes can run commands and developer tooling. **Control:** Disable shell, terminal persistence, jobs, scheduling, and subprocess tools; run the process in a disposable isolated environment without Docker socket, SSH agent, cloud CLI, or browser profile.

- **Plugin/profile composition:** Configuration patches can replace tool, model, sandbox, telemetry, credential, and policy rows. **Control:** Save and human-review the effective resolved configuration; reject unknown plugins and any community plugin.

- **Telemetry and project metadata:** Local-first operation does not mean zero outbound reporting; upstream permits anonymized configuration/project reporting unless disabled or redirected. **Control:** Explicitly disable telemetry and enforce outbound controls outside Harness configuration.

- **External tools, MCP, and browser access:** Configured web tools, MCP services, plugins, and external tools can independently transmit data. **Control:** No MCP, browser, web-search, community plugin, or external tool is permitted in the pilot.

- **Credential persistence:** Model provider keys and service addresses may be stored locally. **Control:** Use a dedicated disposable key with spend/rate caps, inject it ephemerally, do not persist it in the Harness home, then revoke it immediately after the pilot.

- **Supply chain and lifecycle scripts:** The upstream project is a developer preview, includes a large pnpm monorepo, a patched beta native terminal dependency, vendor overrides, and a post-install script that modifies local Git hook/configuration. **Control:** Pin a full commit and hashes, install with `--frozen-lockfile --ignore-scripts`, generate an SBOM, scan dependencies/licenses, and never run lifecycle scripts on a real RipoDoc worktree.

- **Sandbox escape and host compromise:** A sandbox backend is not proof that the host is safe, particularly with native shell/terminal facilities. **Control:** Isolate at VM/container boundary; default-deny network; no privileged mounts; no inbound public port; destroy the environment after use.

- **Autonomous continuation:** Subagents, jobs, schedules, and resumable sessions can extend data handling beyond the operator’s active review. **Control:** Disable subagents, jobs, scheduling, auto-resume, and unattended operation.

## Ten Non-Negotiable Go/No-Go Gates

- **1. Isolation:** A clean disposable VM/container has no host home mount, browser profile, SSH agent, cloud credentials, Docker socket, private repository mount, or inbound public port. **Fail: no pilot.**

- **2. Pinning:** Record an immutable 40-character source commit SHA, archive SHA-256, lockfile SHA-256, Node/pnpm versions, SBOM, and scan results. No branch, tag, `latest`, or `npx` acquisition. **Fail: no pilot.**

- **3. Lifecycle scripts:** Acquisition used `pnpm install --frozen-lockfile --ignore-scripts`; every lifecycle script was reviewed. No install script ran on a RipoDoc worktree. **Fail: no pilot.**

- **4. Effective configuration:** Preserve the resolved profile/config showing telemetry, web/browser tools, MCP, community plugins, shell, terminal persistence, filesystem write, jobs, schedules, and subagents disabled. **Fail: no pilot.**

- **5. File boundary:** The only mounted workspace is a synthetic read-only fixture; it contains no production source, customer material, credentials, personal data, or remote Git write configuration. **Fail: no pilot.**

- **6. Network boundary:** Firewall/proxy evidence proves default-deny egress, permitting only the approved model endpoint for the synthetic test. Remove registry access after image acquisition. **Fail: no pilot.**

- **7. Model contract:** The chosen provider’s data-use, retention, training, geography, security, and DPA terms are approved for synthetic internal material. **Fail: no pilot.**

- **8. Credentials:** A disposable least-privilege provider key has hard spend/rate limits, is injected at runtime, is never written to Harness state, and has a scheduled revocation owner. **Fail: no pilot.**

- **9. Prompt-injection exercise:** A hostile synthetic fixture fails to induce forbidden reads, writes, tool use, or network requests. Capture the evidence. **Fail: no pilot.**

- **10. Log destruction:** Demonstrate deletion of the session store, credentials, workspace, caches, proxy logs containing payload metadata, and the VM/container snapshot after the test. **Fail: no pilot.**

## Evidence Template

- Start from [`../../tools/deepseek-harness-pilot-evidence.template.json`](../../tools/deepseek-harness-pilot-evidence.template.json).

- Keep every gate `false` until a human has attached a specific evidence reference.

- Run the preflight command only after the evidence file is complete. A successful result means **approved for a synthetic conditional pilot only**; it does not authorize production data or a customer-facing feature.

## References

- [DeepSeek Harness architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md)
- [DeepSeek Harness data-processing statement](https://www.deepseek.com/harness/en/data-processing/)
- [DeepSeek Harness root manifest](https://github.com/deepseek-ai/deepseek-harness/blob/master/package.json)
- [DeepSeek Harness developer-preview repository](https://github.com/deepseek-ai/deepseek-harness)
