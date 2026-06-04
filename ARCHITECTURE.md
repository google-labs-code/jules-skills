# Centralized Architectural Guide

## Table of Contents
1. [Overview](#overview)
2. [Task Orchestration and Parallel Session Management](#task-orchestration-and-parallel-session-management)
3. [File Ownership and Conflict Resolution](#file-ownership-and-conflict-resolution)
4. [Safety Layers](#safety-layers)
5. [The Bootstrapper Pattern](#the-bootstrapper-pattern)

## Overview
This document provides a central, human-readable reference for the core system behaviors of the repository. It focuses on the global architecture, covering orchestration, safety, file isolation, and deployment patterns to accelerate developer onboarding and prevent architectural drift. Detailed, skill-specific logic can be found in the respective `SKILL.md` files within individual directories.

## Task Orchestration and Parallel Session Management
The system relies on a multi-agent orchestration architecture to handle complex work streams efficiently. The primary workflow defines how the system transitions from initial planning to parallel execution:

* **Planning Phase:** The **Planning agent** interprets the overarching goals and breaks them down into discrete, actionable tasks. It determines the necessary sequence and parallelism of these tasks.
* **Dispatch Phase:** During the **Dispatch phase**, the system assigns the planned tasks to specialized execution agents. This phase manages parallel session management, spinning up distinct sessions for agents to work concurrently.

By segregating planning from execution, the system ensures that individual task agents remain focused on their specific objectives without losing sight of the broader architectural goals.

## File Ownership and Conflict Resolution
To manage parallel tasks without creating merge conflicts, the architecture enforces a strict **File Ownership** principle. This guarantees isolation between parallel agents operating simultaneously.

* **File Ownership Matrix:** Before any task enters the Dispatch phase, the system consults the **File Ownership Matrix**. This matrix maps specific files and directories to the agents assigned to modify them.
* **Pre-validation of Task Boundaries:** The system pre-validates task boundaries before execution begins. If the matrix detects that two parallel agents might attempt to modify the same file, the orchestration layer intercepts this and either serializes the tasks or reallocates boundaries. This proactive conflict resolution completely eliminates parallel file contention.

## Safety Layers
To prevent AI agents from performing destructive actions, the system implements a multi-layered safety strategy. This strategy combines both preventative measures and corrective validation checks.

* **Preventative Guardrails (Prompts):** At the earliest stage, agents are bound by **Critical Rules** embedded directly within their system prompts. These rules strictly define the acceptable actions and scopes for each agent, proactively limiting their capabilities to safe operations.
* **Corrective Guardrails (Validation):** Should an agent deviate from its intended behavior, corrective validation phases catch anomalies before they affect the main repository. This is primarily enforced through **sequential PR merging**. Rather than allowing agents to merge changes directly or simultaneously, each completed task generates a Pull Request that undergoes automated and/or manual validation phases. Only after successfully passing these checks is the code integrated, ensuring repository integrity.

## The Bootstrapper Pattern
To maintain modularity and ease of deployment, the system employs a recurring **bootstrapper** pattern. This architectural pattern is used to install encapsulated logic into target environments.

* **Encapsulation:** Instead of coupling the core orchestration engine with specific deployment scripts, individual skills and tools are packaged with their own bootstrapper mechanisms.
* **Installation:** When an agent requires a specific capability or needs to deploy logic to a target environment, it invokes the bootstrapper. The bootstrapper handles the environment setup, dependency injection, and initialization required to make the encapsulated logic fully operational in that specific context. This ensures consistent, reproducible environments across different agents and tasks.
