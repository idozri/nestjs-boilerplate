# 🧠 Cursor Onboarding Guide

This guide ensures Cursor is correctly set up and follows your custom rules for this NestJS boilerplate project.

---

## ✅ Step 1: Load Cursor Rules

In Cursor, open the project, then:

1. Click the ⚙️ icon next to the model selector (top-right corner)
2. Click **“Generate Cursor Rules”**
3. Wait 1–2 seconds while rules are loaded from:

   ```
   .cursor/rules/rules.mdc
   ```

---

## ✅ Step 2: Send the Startup Prompt

Once rules are loaded, paste this message into Cursor:

```
Cursor, please confirm you have reloaded the rules from .cursor/rules/rules.mdc.

List all rules you are now following.

Do not begin executing any tasks until:
- Rules are confirmed
- You understand the code and docs structure
- You will mark [x] in TASKS.md for each completed task
- You will write tests and update docs for every change
```

---

## ✅ Step 3: Begin Work

After confirming the rules:

- Run the task: `npm run task-review` to see remaining TODOs
- Start the next task from `TASKS.md`
- Follow all structure, error handling, and documentation standards

---

## 💡 Tip

If rules don’t seem to load, try:

- Closing and reopening the folder
- Re-clicking “Generate Cursor Rules”
