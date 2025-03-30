This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# Live Site Access

URL: https://maintenance-management-system-two.vercel.app/

3. Login Credentials (Test Accounts)

### Admin Access:
URL: https://maintenance-management-system-two.vercel.app/admin
Email: jumajohnpa@gmail.com
Password: 123456

### Technician Access:
URL: https://maintenance-management-system-two.vercel.app/technicians
Technician ID: 001 or 002 or 003 or 004
Password: 123456

### Client Access:
URL: https://maintenance-management-system-two.vercel.app/clients
Email: jp0829673@gmail.com
Password: 123456
You can also create your account as a client for the landing page here: URL: https://maintenance-management-system-two.vercel.app/ Navigate to the sign-up button.

## About the System

#### Introduction
The Maintenance Management System (MMS) is a web-based platform designed to streamline the process of tracking, assigning, and completing maintenance requests. The system ensures real-time task allocation, technician availability tracking, and automated notifications, improving efficiency and communication between clients, technicians, and administrators.

### Key Features
#### User Authentication & Role Management
Secure login for clients, technicians, and admins
Role-based access control to ensure restricted access to specific functionalities

#### Request Management
Clients can submit maintenance requests via a user-friendly dashboard
Requests include descriptions, priority levels, and optional attachments (e.g., images)

#### Technician Auto-Assignment
System automatically assigns available technicians based on expertise and workload
Manual assignment option for administrators

#### Real-Time Notifications
Email and in-app notifications for new assignments, status updates, and completions
SMS notifications (if enabled)

#### Progress Tracking & Reporting
Technicians update job statuses (Pending, In Progress, Completed)
Admin dashboard with charts displaying work progress
Clients receive feedback on the request status

#### Payment Integration
Stripe integration for handling payments if required
Invoice generation for completed tasks

#### Feedback & Ratings
Clients can rate completed jobs and provide feedback
Data used to improve service quality

### Use Case Scenario
Scenario: A Client Submits a Maintenance Request
Login & Request Submission
A client logs into the system and navigates to "New Request."
They describe the issue, set priority, and attach an image if necessary.
Upon submission, the system generates a ticket number.
Technician Assignment & Notification
The system auto-assigns an available technician and sends them a notification.
If no technician is available, the request for manual assignment remains in the admin queue.


### Technician Completes the Task
The technician updates the request status and marks it as "Completed."
They add any additional notes or materials used.
Client Confirmation & Feedback
The client receives a notification and reviews the work.
They provide a rating and feedback.
Admin Reports & Monitoring
Admins track system performance through dashboards and reports.
Monthly reports help in workforce and service quality analysis.
Technology Stack
Frontend: Next.js (React framework), Ant Design for UI components
Backend: Supabase (PostgreSQL database, authentication, and storage)
Notifications: EmailJS for email alerts, Supabase for push notifications
Testing: Cypress for end-to-end testing


### Conclusion
The Maintenance Management System provides an efficient way to handle service requests, ensuring transparency, accountability, and timely maintenance solutions. Its automation features reduce admin workload while enhancing user experience for both clients and technicians. Future enhancements may include AI-driven task allocation and advanced analytics for performance tracking.
Prepared By: Juma John Paul
 Date: 31st March 2025
 Version: 1.0


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
