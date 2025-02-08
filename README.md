# Loan Management System

A modern, Kanban-style loan management system built with React and Material-UI, featuring role-based access control and real-time updates.

## Features

- 🔐 **Role-Based Access Control**: Different dashboards for Loan Officers, Managers, Directors, and Finance Officers
- 📊 **Kanban Board Interface**: Visual loan application tracking with drag-and-drop functionality
- 📈 **Real-Time Metrics**: Dynamic metrics showing loan statistics and performance indicators
- 🔔 **Notification System**: Real-time notifications for loan status updates
- 💼 **Multiple Loan Types**: Support for Business Loans, Personal Loans, Government Loans, and Salary Advances
- 🎨 **Modern UI/UX**: Beautiful, responsive design with Material-UI components

## Tech Stack

- React.js
- Material-UI (MUI)
- Firebase (Firestore)
- React Beautiful DND
- React Router
- Context API for state management

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js >= 14.x
- npm >= 6.x
- Firebase account and project setup

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/loan-management-system.git
```

2. Navigate to the project directory:
```bash
cd loan-management-system
```

3. Install dependencies:
```bash
npm install
```

4. Create a `.env` file in the root directory and add your Firebase configuration:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm start
```

## Usage

The system includes four main roles:

1. **Loan Officer Dashboard**
   - Create new loan applications
   - Track application status
   - View loan metrics

2. **Manager Dashboard**
   - Review and approve/reject loans
   - Monitor team performance
   - Track approval rates

3. **Director Dashboard**
   - Final approval for high-value loans
   - View department performance
   - Monitor overall metrics

4. **Finance Officer Dashboard**
   - Handle loan disbursement
   - Track disbursed amounts
   - Manage fund allocation

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