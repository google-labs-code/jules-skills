# Contributing to Jules Agent Skills

Thank you for your interest in contributing to the Jules Agent Skills repository! This guide will help you understand how to contribute effectively.

## Code of Conduct

By participating in this project, you agree to abide by the [Google Open Source Code of Conduct](https://opensource.google/conduct/).

## How to Contribute

### 1. Finding Issues to Work On

- Check the [GitHub Issues](https://github.com/google-labs-code/jules-skills/issues) for existing problems or feature requests
- Look for issues labeled with `good first issue` if you're new to the project
- You can also propose new skills or improvements by opening a new issue

### 2. Setting Up Your Development Environment

```bash
# Clone the repository
git clone https://github.com/google-labs-code/jules-skills.git
cd jules-skills

# Install dependencies (if any)
# Currently this repository doesn't have runtime dependencies,
# but individual skills may have their own requirements
```

### 3. Creating New Skills

All skills must follow the standardized structure:

```
skills/[skill-name]/
├── SKILL.md           # The "Mission Control" for the agent
├── scripts/           # Executable scripts (Orchestration & Tooling)
├── resources/         # The knowledge base (Architecture & Guides)
├── assets/            # Templates & configuration files
└── README.md          # User-facing documentation
```

#### SKILL.md Format

Your `SKILL.md` file must include the following frontmatter:

```yaml
---
name: skill-name
description: Brief description of what the skill does
allowed-tools:
  - "Tool1"
  - "Tool2"
---
```

Followed by detailed documentation explaining:
- What the skill sets up
- Step-by-step setup instructions
- Manual usage examples
- Customization options
- Troubleshooting tips

### 4. Improving Existing Skills

When improving existing skills:
- Maintain backward compatibility when possible
- Update documentation to reflect changes
- Test your changes thoroughly
- Follow the existing code style and patterns

### 5. Submitting Your Changes

1. **Fork the repository** (if you don't have direct access)
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit them with clear, descriptive messages
4. **Push your branch** to your fork
5. **Open a Pull Request** with a clear description of:
   - What problem you're solving
   - How your changes address it
   - Any breaking changes (if applicable)

### 6. Code Review Process

- All contributions require review before merging
- Be responsive to feedback and questions
- Make sure your PR passes any automated checks

## Skill Quality Guidelines

### Great Candidates for New Skills

- **Issue Triage**: Skills that analyze issues and dispatch parallel coding agents
- **Code Review**: Skills that automate code review using Jules sessions
- **Migration**: Skills that plan and execute large-scale codebase migrations
- **Documentation**: Skills that generate or update documentation from source code
- **Testing**: Skills that set up or run various testing frameworks
- **Deployment**: Skills that configure deployment pipelines

### What Makes a Good Skill

- **Clear Purpose**: Solves a specific, well-defined problem
- **Reusable**: Can be applied to multiple repositories or projects
- **Well Documented**: Includes comprehensive setup and usage instructions
- **Maintainable**: Follows consistent patterns and is easy to update
- **Tested**: Includes examples or test cases where applicable

## Style Guide

### File Structure
- Keep the standardized directory structure
- Use descriptive file and directory names
- Group related functionality together

### Documentation
- Use clear, concise language
- Include practical examples
- Explain the "why" behind decisions
- Provide troubleshooting guidance

### Scripts
- Make scripts executable (`chmod +x`)
- Handle errors gracefully
- Include helpful error messages
- Support common platforms (Linux, macOS, Windows via WSL)

## Getting Help

If you have questions or need help:
- Open an issue on GitHub
- Join the discussion in existing issues
- Reach out to maintainers (if contact information is provided)

## License

By contributing to this project, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).