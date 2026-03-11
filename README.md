This repository serves as the Central Command Hub for a "fleet" of specialized, lightweight data tools. It is designed to be operated entirely from a mobile browser (Android/iOS) or desktop without requiring a local development environment or terminal.
🚀 Purpose
Managing multiple "memories" and "data-sovereignty" projects (like FB-Data-Porter, Pete-COPD, or Sam-Etegal-Prototypes) can become fragmented. Fleet Command provides a single dashboard to:
Initialize New Hulls: Instantly create new GitHub repositories with standardized structures (MIT License, Workflows, and Folders).
Centralised Access: Maintain a registry of all active tools in your fleet.
Low-Resource Management: Bypass the need for local git installations by leveraging the GitHub REST API directly from the browser.
🛠️ Getting Started
Deploy the Dashboard:
Enable GitHub Pages in the settings of this repository.
Set the source to the main branch.
Visit your live site at https://[your-username].github.io/[this-repo-name].
Generate a Captain's Key:
Go to GitHub Settings > Developer Settings > Personal Access Tokens (Fine-grained).
Create a token with Read & Write access to "Repositories" and "Contents".
Use this token in the dashboard "Dry Dock" to authorize repo creation.
Launch a Hull:
Enter a name (e.g., Data-Porter-V1) and description.
Click Launch New Repo. The dashboard will automatically:
Create the repository.
Apply the MIT License.
Register the tool in your local Fleet Grid.
🏗️ Fleet Standard Architecture
Every "ship" launched from this shipyard follows a uniform blueprint to ensure cross-compatibility:
index.html: The browser-based interface for the specific tool.
/.github/workflows/: The engine for automated data processing.
/scripts/: The backend logic (Python/JS) executed by GitHub Actions.
LICENSE: Standard MIT protection for open-source collaboration.
🔐 Security & Privacy
Personal Access Tokens: Your PAT is only used locally in your browser to talk to the GitHub API. It is never stored on a server.
The Password Point: Each sub-repository in the fleet manages its own Secrets (e.g., Facebook API tokens) to ensure that even if one project is shared, your global credentials remain secure.
📜 License
This Master Control repository is licensed under the MIT License. You are free to fork, modify, and use this dashboard to manage your own fleet of tools.
