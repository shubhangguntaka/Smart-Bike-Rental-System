# Contributing to Bike Rental System

Thank you for contributing to the Bike Rental System project! To ensure smooth teamwork and high code quality, please adhere to the following guidelines:

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   ```
2. **Branching Strategy**:
   - `main`: Production-ready code.
   - `feature/<feature-name>`: New features.
   - `fix/<bug-name>`: Bug fixes.

## Commit Guidelines

- Write clear, descriptive commit messages.
- Example: `feat(auth): implement JWT user login endpoint`

## Pull Request Process

1. Create a pull request targeting the main branch.
2. Provide a brief description of the changes made and link any relevant issue.
3. Ensure all tests pass and there are no lint errors before requesting code review.


## Bike Rental System Contribution Guide

### Branch Strategy

```main
│
develop
│
feature/authentication
feature/bike-management
feature/booking
feature/payment
feature/maps
feature/gps
feature/reviews
feature/admin
feature/testing
```
### Branch Naming

```
feature/authentication

feature/payment

feature/bike-management

bugfix/payment

hotfix/login

release/v1.0
```

### Commit Messages
```
feat: add authentication module

feat: implement bike booking

fix: resolve JWT issue

docs: update README

refactor: optimize booking service

test: add booking module tests
```

### Pull Request Process

Every PR must
✅ Compile successfully
✅ Follow coding standards
✅ Be tested locally
✅ Include screenshots (Frontend)
✅ Include API testing (Backend)

