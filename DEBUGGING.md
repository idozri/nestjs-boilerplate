# Debugging Guide

This document provides tips and instructions for using the built-in debugger configuration and debugging the NestJS Backend Boilerplate.

## Debugger Configuration

The boilerplate includes a pre-configured debugger setup for Visual Studio Code (VSCode). This allows you to set breakpoints and step through your code during development.

### VSCode Debugger Setup

1. **Open the Debug Panel**: Click on the debug icon in the sidebar or press `Ctrl+Shift+D`.
2. **Select Configuration**: Choose the `Launch Program` configuration from the dropdown menu.
3. **Start Debugging**: Click the green play button or press `F5` to start debugging.

### Launch Configuration

The `launch.json` file in the `.vscode` directory contains the following configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/main.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true
    }
  ]
}
```

## Debugging Tips

- **Set Breakpoints**: Click in the gutter next to a line number to set a breakpoint. The debugger will pause execution at this line.
- **Step Through Code**: Use the step over, step into, and step out buttons to navigate through your code.
- **Inspect Variables**: Hover over variables to see their current values or use the variables panel to inspect them.
- **Console Output**: Use the debug console to evaluate expressions and view console output.

## Conclusion

Debugging is an essential part of the development process. By using the built-in debugger configuration, you can efficiently identify and resolve issues in your application. Follow these tips to enhance your debugging experience.
