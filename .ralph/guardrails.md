# Guardrails - FlowLint Chrome Extension

## Rules

### G1: Never commit to main
- **Trigger:** `git commit` on main branch
- **Instruction:** Create feature branch
- **Discovered:** Iteration 0

### G2: Test in Chrome
- **Trigger:** Extension changes
- **Instruction:** Load unpacked and test on n8n.io
- **Discovered:** Iteration 0

### G3: Manifest V3 compliance
- **Trigger:** Manifest changes
- **Instruction:** Ensure Manifest V3 compliance
- **Discovered:** Iteration 0
