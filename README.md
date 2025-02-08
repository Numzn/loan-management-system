# Loan Management System

A modern Kanban-style loan management system built with React, Material-UI, and Firebase. The system automates the loan approval process across different roles and provides real-time updates and notifications.

## Features

- **Role-Based Access Control**
  - Loan Officer Dashboard
  - Manager Dashboard
  - Director Dashboard
  - Finance Officer Dashboard

- **Kanban Board Interface**
  - Drag-and-drop functionality
  - Real-time updates
  - Status tracking
  - Visual workflow management

- **Loan Processing Features**
  - Automatic loan movement upon approval
  - Real-time notifications
  - Rejection/correction flow
  - Document management

- **Modern UI/UX**
  - Material Design components
  - Responsive layout
  - Dark theme
  - Interactive metrics cards

## Tech Stack

- React.js
- Material-UI (MUI)
- Firebase (Firestore)
- React Beautiful DND
- React Router
- Context API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd loan-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Firebase configuration:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Access the application at `http://localhost:3000`
2. Use the mock login to access different role dashboards:
   - Loan Officer
   - Manager
   - Director
   - Finance Officer
3. Each role has specific permissions and access to different features

## Project Structure

```
src/
├── components/          # Shared components
├── managementside/     # Management dashboard components
│   ├── components/     # Dashboard-specific components
│   └── pages/          # Dashboard pages
├── config/             # Configuration files
├── contexts/           # React contexts
├── theme/              # Theme configuration
└── routes/             # Route definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/loan-management-system](https://github.com/yourusername/loan-management-system) 