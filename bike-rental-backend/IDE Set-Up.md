# 💻 IDE Setup

The backend project can be developed using **Spring Tools for Eclipse (STS4)** or **Visual Studio Code (VS Code)**. Team members may use either IDE based on their preference.

---

# Option 1: Spring Tools for Eclipse (STS4)

## Import Project

1. Open **Spring Tools for Eclipse (STS4)**.
2. Go to:

```text
File
→ Import
→ Maven
→ Existing Maven Projects
```

1. Select the project folder.
2. Click **Finish**.

---

## Update Maven

Right Click Project

```text
Maven
→ Update Project
```

Enable:

* ✔ Force Update of Snapshots/Releases

---

## Run Project

Right Click

```text
BikeRentalBackendApplication.java
```

Choose

```text
Run As
→ Spring Boot App
```

---

# Option 2: Visual Studio Code

## Recommended Extensions

Install the following extensions from the VS Code Marketplace.

| Extension                             | Publisher   |
| ------------------------------------- | ----------- |
| Extension Pack for Java               | Microsoft   |
| Spring Boot Extension Pack            | VMware      |
| Maven for Java                        | Microsoft   |
| Language Support for Java™ by Red Hat | Red Hat     |
| Debugger for Java                     | Microsoft   |
| Test Runner for Java                  | Microsoft   |
| Project Manager for Java              | Microsoft   |
| Lombok Annotations Support            | GabrielBB   |
| SonarLint                             | SonarSource |
| Error Lens (Optional)                 | Alexander   |

---

## Open Project

```text
File
→ Open Folder
```

Select

```text
bike-rental-backend
```

VS Code will automatically detect the Maven project.

---

## Install Dependencies

Open Terminal

```bash
./mvnw clean install
```

Windows

```bash
mvnw.cmd clean install
```

---

## Run Application

Open

```text
BikeRentalBackendApplication.java
```

Click

```text
Run
```

or execute

```bash
./mvnw spring-boot:run
```

Windows

```bash
mvnw.cmd spring-boot:run
```

---

# Java Configuration

Ensure the following versions are installed.

| Software | Recommended Version          |
| -------- | ---------------------------- |
| Java     | 21 LTS (or project standard) |
| Maven    | Use Maven Wrapper (`mvnw`)   |
| MySQL    | 8.x                          |
| Git      | Latest Stable                |

---

# Lombok Setup

If Lombok annotations are not recognized:

### STS4

Install the Lombok JAR into Eclipse and restart the IDE.

### VS Code

Install the **Lombok Annotations Support** extension and ensure the Java Extension Pack is installed.

---

# Verify Your Setup

Before starting development, ensure:

* ✅ Project imports successfully.
* ✅ Maven dependencies are downloaded.
* ✅ No compilation errors.
* ✅ Database connection is configured.
* ✅ Application starts successfully.
* ✅ Swagger UI is accessible (after Swagger is configured).
* ✅ No IDE-specific files are committed to Git.

---

# IDE Files

Do **not** commit IDE-specific files.

```text
.idea/
.settings/
.project
.classpath
.vscode/settings.json
bin/
target/
```

You may commit:

```text
.vscode/extensions.json
```

to recommend extensions for VS Code users without enforcing editor-specific settings.
