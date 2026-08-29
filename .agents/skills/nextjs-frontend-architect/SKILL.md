---
name: nextjs-frontend-architect
description: Next.js Frontend Architect skill for domain-driven feature-based architecture, App Router patterns, and component structures.
---

# Next.js Frontend Architect Skill

This skill enforces modern Next.js Feature-Driven Architecture (Vertical Slice Architecture / Bulletproof React):

1. **Feature Encapsulation**: Store domain-specific UI, hooks, and services in `src/features/<feature>/`.
2. **Feature Documentation**: Every feature directory MUST maintain a `feature.md` documenting its overview, capabilities, components hierarchy, 5 UI states, and acceptance criteria.
3. **Shared UI**: Primitive UI atoms in `src/components/ui/`, global layout scaffolding in `src/components/layout/`, `src/components/navbar/`, `src/components/navigation/`, etc.
4. **Master PRD Compliance**: The root `PRD.md` is a living master specification of all current system features.

Refer to [nextjs-architect.md](./nextjs-architect.md) for detailed rules.
