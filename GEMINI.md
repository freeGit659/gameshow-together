# Antigravity Workspace Guidelines & Permissions

## Scope of Execution (Phạm Vi Thực Thi)
1. **Target Project Directory:** All actions, file creations, code edits, and terminal commands MUST be strictly scoped within this project directory: `e:\Work\IT\Web\GameShowTogether`.
2. **Prohibited External Actions:** Do NOT edit, delete, or run commands in directories outside of this workspace root (e.g. `C:\`, User AppData, Windows System directories, or other project folders) without explicit confirmation from the user.

## Permission & Auto-Approval Directives (Cấp Quyền Không Hỏi Lại Trong Project)
1. **Terminal Commands:** Automatically execute standard project tasks without pausing for interactive confirmation:
   - Dependency management (`npm install`, `npm update`, `npm audit`).
   - Local and production builds (`npm run build`, `npm run dev`, `tsx server.ts`).
   - Linting, TypeScript checks (`npx tsc --noEmit`).
   - Git operations within this repository (`git status`, `git add`, `git commit`, `git push origin main`).
2. **File Modifications:** Directly create, edit, and organize files in `src/`, `supabase/`, configuration files, and documentation within this project.
