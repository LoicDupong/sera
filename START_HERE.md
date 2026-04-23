# Start Here

## 1) Copy into your new repo
Copy these items to the root of your project:
- `CLAUDE.md`
- `docs/`
- `.claude/skills/`
- `.claude/agents/`

## 2) Fill the minimum docs first
Before coding, fill at least:
- `docs/00_overview.md`
- `docs/01_product_vision.md`
- `docs/02_mvp_features.md`
- `docs/04_tech_architecture.md`
- `docs/20_mvp_scope_guard.md`

## 3) First prompt to Claude Code
Use:

```text
Read CLAUDE.md and the docs folder first.
Summarize the project concept, target users, MVP scope, architecture choices, and missing information.
Do not implement anything yet.
```

## 4) Then move step by step
Example:

```text
Now refine docs/09_api_routes_spec.md and docs/10_models_spec.md.
Keep the MVP tight and consistent with docs/02_mvp_features.md.
```

## 5) When to use subagents
Use them for bounded work only:
- backend spec review
- frontend structure review
- security review
- QA consistency pass

Do not use them to build the entire project in one shot.
