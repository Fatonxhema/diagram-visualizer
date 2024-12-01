
# Class Diagram Generator Extension

This Visual Studio Code extension allows you to generate class diagrams from your C# and Java source code. The extension parses the selected class files, extracts their properties and methods, and generates a visual representation of the classes and their relationships.

## Features

- **Parse C# and Java classes**: The extension can read C# and Java files and extract their classes, properties, and methods.
- **Generate Class Diagrams**: Automatically generate a class diagram that shows the classes, their attributes, and methods.
- **Interactive Diagrams**: The generated diagram is interactive, allowing you to view and manipulate it in a web view panel.
- **Supports Draw.io Format**: The generated class diagram can be copied and pasted into tools like Draw.io for further visualization and editing.

---

## Installation

### Prerequisites

1. **Visual Studio Code**: You need to have Visual Studio Code installed. Download it from [here](https://code.visualstudio.com/).
2. **Node.js**: Ensure that Node.js is installed on your machine. You can download it from [here](https://nodejs.org/).

### Steps to Install the Extension

1. **Clone or Download the Extension**:
    - Clone or download this repository to your local machine.
    - Open the folder containing the extension in Visual Studio Code.

2. **Install Dependencies**:
    - Open a terminal in Visual Studio Code and run the following command to install the required dependencies:
      ```bash
      npm install
      ```

3. **Run the Extension**:
    - Press `F5` to start debugging the extension.
    - This will open a new VS Code window with the extension installed. You can now test the extension.

4. **Package and Install the Extension**:
    - If you're ready to publish or install the extension locally, use the following command to package it:
      ```bash
      vsce package
      ```
    - To install the `.vsix` file, use the following command:
      ```bash
      code --install-extension <path-to-file>.vsix
      ```

---

## Usage

### Generating a Class Diagram

1. **Open the Command Palette**:
    - Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS) to open the Command Palette in Visual Studio Code.

2. **Run the Command**:
    - In the Command Palette, search for `Class Diagram: Generate`.
    - Select the command to generate a class diagram.

3. **Select Files**:
    - A file picker will appear. Select one or more `.cs` (C#) or `.java` files from your workspace.
    - The extension will parse these files, extract the class details, and generate a class diagram.

4. **View the Class Diagram**:
    - Once the diagram is generated, it will be displayed in a new web view panel.
    - The web view allows you to interact with the diagram.

### Diagram Customization

- The generated class diagram includes:
  - **Classes**: Each class is represented as a box.
  - **Attributes**: Class properties are displayed with visibility indicators (`+` for public, `-` for private, `#` for protected).
  - **Methods**: Class methods are displayed inside each class box.
  - **Relationships**: Inheritance and associations between classes are shown with arrows.

- You can copy and paste the generated diagram into Draw.io or any other diagram tool for further customization.

---

## Troubleshooting

- **Nothing is displayed in the webview**: Ensure that your source files have valid class definitions with properties and methods. Check the Developer Tools (Open DevTools with `Ctrl + Shift + I`) for errors.
  
- **Parsing Errors**: If the properties or methods are not correctly parsed, verify that the code matches the expected syntax for properties (`public string Name { get; set; }` for C#) and methods (`public void methodName()` for Java and C#).

---

## Contributing

Feel free to submit issues or pull requests. Contributions are welcome!

### How to Contribute

1. Fork the repository.
2. Clone your fork locally.
3. Create a new branch for your changes.
4. Implement the feature or fix.
5. Submit a pull request describing your changes.

---

## License

This extension is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
