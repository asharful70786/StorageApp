# Storage  App –  Cloud Storage Web App

**Storage  App** is a full-stack MERN web application that serves as your cloud drive. It provides a fast and secure way to upload, organize, and manage your files and folders online. The app includes robust user authentication (with Google/GitHub OAuth and OTP login), role-based access control, file upload/download functionality, and uses Redis-backed sessions to restrict multi-device logins. Integration  Resend (for email) enables OTP-based verification and notifications.

## Features

* **User Authentication & Security**:

  * Email/Password registration with secure hashing (bcrypt) and form validation.
  * OAuth 2.0 login via **Google** and **GitHub** accounts for quick sign-in.
 
  * **Session Management** with HTTP-only cookies stored in **Redis** – limits concurrent logins (e.g. max 3 active sessions per user) and includes a “Logout All” option to invalidate all sessions.
  * **Role-Based Access Control (RBAC)**: Supports different user roles (e.g. User, Admin, Manager) with fine-grained permissions. Admins can manage users (block/delete accounts) and oversee file storage.

* **File and Folder Management**:

  * Upload any file type and download or preview files from your storage.
  * Organize your content with folder (directory) creation, nested directories, and file listing views.
  * Rename files and folders, and move or arrange them in a directory structure.
  * **Delete/Restore** functionality with soft deletes (items move to a trash/recycle state) and permanent deletion (hard delete) capabilities.
  * Real-time activity logs for file operations (uploads, downloads, deletes, etc.), giving users (and admins) insights into recent actions.

* **Technology & Performance**:

  * **MERN stack** – Frontend built with React (bundled via Vite) for a fast and interactive UI, and backend with Node.js/Express and MongoDB for robust data handling.
  * **MongoDB** for persisting user data, file metadata, directory structures, and more (includes Mongoose schemas & server-side validation for data integrity).
  * **Redis** in-memory store for fast session management, improving performance and enabling efficient multi-device session control.
  * **Email Service (Resend API)** to send verification codes or account confirmations via email.
  * Responsive design with intuitive interface for managing files (custom context menus, modals for creating/renaming directories, etc.).

## Technology Stack

* **Frontend**: React + Vite, JavaScript/JSX, HTML/CSS.

  * UI/UX features for file management (drag-and-drop uploads, context menus, modals).
  * State management using React hooks and context (no heavy framework, ensuring simplicity).
  * Communicates with backend via RESTful API calls (with credentials for cookie-based auth).

* **Backend**: Node.js and Express.js.

  * Express routes organized by feature (auth, user, file, directory, OTP).
  * Passport is **not** used – OAuth and OTP flows are implemented using official libraries (e.g. Google OAuth2 client) and custom logic.
  * Data validation and security: Mongoose schemas with validation rules, password hashing (bcrypt), and sanitization of inputs.

* **Database**: MongoDB (NoSQL) with Mongoose ODM.

  * Stores users, directories, files metadata. Each user has a root directory, and directories reference parent and owner.
  * Soft-delete fields (e.g. `isDeleted`) on user and file records for reversible deletion.

* **Session Store**: Redis.

  * Stores active session data keyed by a session UUID (`sid` cookie) for quick lookup.
  * Automatic expiration of sessions (e.g. 7 days) and enforcement of max session count per user.

* **Cloud APIs**:

  * **Google & GitHub OAuth** – Google’s `google-auth-library` and GitHub OAuth endpoints for third-party login integration.
   * **Resend** – Email sending service used to dispatch OTP codes or verification links to user email addresses.

* **Other Libraries**: Multer (file uploads handling), Cookie-Parser (signed cookies), dotenv (environment config), cors, etc.

## Installation and Setup

**Prerequisites:** Ensure you have **Node.js** and **npm** installed. You’ll also need access to a MongoDB database (local or Atlas URI) and a Redis instance (for session storage). For OAuth and SMS features, create accounts/API keys with Google (OAuth credentials), GitHub (OAuth app) and  get a Resend API key for email if using email OTP or use nodeMailer .

1. **Clone the repository:**

   ```bash
   git clone https://github.com/asharful70786/StorageApp.git
   cd StorageApp
   ```

2. **Backend Setup:**

   * Navigate to the backend folder and install dependencies:

     ```bash
     cd backend
     npm install
     ```

   * Create a **`.env`** file inside `backend/` with the required configuration. For example:

     ```dotenv
     # .env (backend configuration)
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/storageApp  
     REDIS_URL=redis://localhost:6379        # Redis connection 
     Google_ClientId=<your_google_oauth_client_id>  
     Google_ClientSecret=<your_google_oauth_client_secret>  
     Github_ClientId=<your_github_oauth_client_id>  
     Github_ClientSecret=<your_github_oauth_client_secret>  
     RESEND_API_KEY=<your_resend_email_api_key>  
     COOKIE_SECRET=<random_string_for_cookie_signing>  
     ```

     *Replace placeholders with your actual credentials.*

   * (Optional) Adjust any default settings in `backend/config/*.js` if needed (e.g., the server port or other constants). The default Express port is **3000** and CORS is configured for `http://localhost:5173`.

   * Start the backend server:

     ```bash
     # Ensure MongoDB and Redis are running, then:
     npm start        # or "npm run dev" if a dev script is available
     ```

     This will launch the Node/Express server (by default at **[http://localhost:3000](http://localhost:3000)**). You should see a console log like “Server Started” and “Connected to MongoDB”.

3. **Frontend Setup:**

   * Open a new terminal and navigate to the `client` folder:

     ```bash
     cd ../client
     npm install
     ```

   * The React app may also use environment variables for configuration (e.g., an API base URL or Google client ID). Create a `client/.env` or `client/.env.local` if required. For instance:

     ```dotenv
     VITE_APP_API_URL=http://localhost:3000        # Base URL of the backend API
     VITE_APP_GOOGLE_CLIENT_ID=<your_google_client_id>   # (If the frontend uses it for Google Login)
     ```

     The Vite dev server runs on port 5173 by default. Ensure the API URL and CORS settings match the backend.

   * Start the frontend development server:

     ```bash
     npm run dev
     ```

     This will run the React app on **[http://localhost:5173](http://localhost:5173)**. The page will auto-reload on code changes.

4. **Configuration Notes:**

   * **Google OAuth:** You need to set up an OAuth 2.0 Client in Google Cloud Console. In the credentials, add **[http://localhost:5173](http://localhost:5173)** as an authorized origin and **[http://localhost:5173](http://localhost:5173)** (or a specific redirect path) as an authorized redirect URI, depending on the OAuth flow used. Update the Client ID/Secret in your `.env`.
   * **GitHub OAuth:** Create an OAuth app in GitHub settings. Set the callback URL to your frontend or backend endpoint handling OAuth. Update the Client ID/Secret in `.env`.
     * **MongoDB:** The `MONGO_URI` should point to your Mongo database. The app will create collections for users, files, directories, sessions, etc. If using a local Mongo instance, a sample URI might be `mongodb://localhost:27017/storageApp`.
   * **Redis:** If Redis is running on a non-default host/port, adjust `REDIS_URL`. By default, the app will attempt connection on localhost 6379 if not specified.
   * **Resend (Email OTP):** If you enable email OTP, include the Resend API key. The app uses this to send verification emails. Alternatively, you can integrate another email service by modifying the `otpService.js`.

## Usage Instructions

Once both backend and frontend are running, you can start using Storage  App:

* **Access the app:** Open your browser to **`http://localhost:5173`**. You should see the Storage  App login or welcome page.

* **Register a new account:** Click **Register** to create a new account with your name, email, and password. After sign-up, if email verification via OTP is enabled, you will receive a one-time code in your email. Enter this OTP in the verification prompt to activate your account. (If you don’t see the email, check the backend console for errors or ensure your Resend API key is correct.)

* **Login:** You can log in using one of several methods:

  1. **Email & Password** – Enter your registered credentials to sign in.
  2. **Google or GitHub OAuth** – Click “Continue with Google” or “Continue with GitHub” to authenticate via OAuth. A pop-up will ask you to authorize the application. Upon success, you’ll be logged in to Storage  App.
  3. **OTP Login** – Instead of a password, you may choose “Login via OTP”. Enter your email (or phone number if supported) and click to receive a one-time code. For email OTP, a code will be sent to your inbox; for SMS OTP, check your phone messages. Enter the code in the app to verify and log in.

* **Using the Cloud Drive:** After logging in, you’ll land in your root drive . Here are some operations you can perform:

  * **Upload Files:** Use the “Upload” button (or drag-and-drop into the browser window) to upload files from your device. The files will appear in the current folder listing.
  * **Create Folder:** Click “New Folder” (or a folder icon) to create a new directory. Provide a name when prompted. The new folder will appear in the list.
  * **Navigate Folders:** Click on a folder name to enter that directory and view its contents. A navigation header or breadcrumb will show your current path, and you can click higher-level folders to navigate back.
  * **Download File:** Click on a file to download it, or use a context menu (right-click or ellipsis menu on the file item) and select **Download**. The file will be downloaded from the server to your local machine.
  * **Rename Item:** For any file or folder, open its context menu and choose **Rename**. Enter the new name and save to rename the item.
  * **Delete Item:** You can delete files or folders. Deleted items might be moved to a trash (soft delete). If soft-delete is enabled, the item will no longer appear in the main list but will be recoverable by an admin or via a “Trash” view. Administrators can perform **hard delete** to permanently remove items.
  * **Activity Logs:** If you have access to activity logs (for example, an admin user), you can view recent actions like uploads, downloads, deletes, etc. This may be in a dedicated “Activity” section or admin dashboard. Logs update in real-time or near-real-time to reflect ongoing operations.

* **Multi-Device Sessions:** If you log in on multiple devices/browsers, the app will allow up to a certain number of active sessions (default 3). On the fourth login, the oldest session is automatically logged out to enforce the limit. You can also explicitly log out of all sessions by using the **“Logout All”** feature (usually found in your profile menu or settings). This will clear all session entries for your account from the server (Redis) and sign you out everywhere.

* **Role-Based Features:** If you sign in as an Admin or a privileged role, you may have additional capabilities:

  * View a list of all users, with options to deactivate (soft-delete) or delete accounts. A soft-deleted user account cannot log in until restored.
  * View or manage all files across users (for moderation or support).
  * Access system logs and monitor active sessions for all users.
    (Standard users will only have access to their own files and data.)

* **Logging out:** To log out, use the **Logout** option in the navbar/profile menu. This will end your session on the current device (and clear the auth cookie). If you suspect any unauthorized access, use “Logout All” to end all sessions. For security, cookies are HttpOnly and signed to prevent tampering.

**Note:** While using the app in development, you might interact with the backend via tools like Postman as well. All API endpoints are prefixed logically (e.g., `/user/*` for user auth, `/file/*` for file operations, etc.). Ensure to include the `sid` cookie in requests to access protected routes after login. The `authMiddleware` on the backend will validate your session from Redis for protected endpoints.

## Project Structure

The repository is organized into two main folders: `backend` and `client`. Below is an overview of the structure and key files:

```
StorageApp/
├── backend/
│   ├── app.js              # Express app initialization and server startup (listens on port, sets up middleware and routes)
│   ├── config/
│   │   ├── db.js           # Database connection logic (MongoDB via Mongoose, connects using MONGO_URI from .env)
│   │   ├── redis.js        # Redis client setup for session storage
│   │   └── setup.js        # (Optional) MongoDB schema validation in  DataBase level
│   ├── models/
│   │   ├── userModel.js        # Mongoose schema for User (fields: name, email, password, rootDirId, role, isDeleted, etc.)
│   │   ├── fileModel.js        # Schema for File (filename, path or reference, ownerId, parentDirId, size, isDeleted, etc.)
│   │   └── directoryModel.js   # Schema for Directory (name, parentDirId, userId, isDeleted, etc.)
│   ├── controllers/
│   │   ├── userController.js   # Handles user registration, login, OAuth callbacks, logout, logoutAll, etc.
│   │   ├── authController.js   # Handles OTP sending & verification (and possibly other auth-related logic)
│   │   ├── fileController.js   # Handles file uploads, downloads, deletes (calls file system or DB as needed)
│   │   └── directoryController.js # Handles folder creation, rename, listing contents, delete
│   ├── services/
│   │   ├── loginWithGoogle.js  # Service logic for Google OAuth (verifying Google ID tokens, etc.)
│   │   ├── loginWithGithub.js  # Service logic for GitHub OAuth ( exchanging code for token)
│   │   └── otpService.js       # Service to send OTP via email/SMS (uses Resend API for email)
│   ├── routes/
│   │   ├── userRoutes.js       # Express routes for user (e.g. POST /user/register, POST /user/login, POST /user/login-google, etc.)
│   │   ├── fileRoutes.js       # Routes for file operations (e.g. GET /file/download, POST /file/upload – integrates with multer)
│   │   ├── directoryRoutes.js  # Routes for directory operations (e.g. GET /directory/:id, POST /directory/create, etc.)
│   │   └── otpRoutes.js        # Routes for OTP (e.g. POST /auth/send-otp, POST /auth/verify-otp)
│   ├── middlewares/
│   │   ├── authMiddleware.js   # Protects routes by checking for a valid session cookie and user in Redis; attaches user info to req
│   │   └── validateIdMiddleware.js # (Example) Middleware to validate MongoDB ObjectID format in requests
│   ├── storage/
│   │   └── *                   # Directory where uploaded files are stored on the server (e.g., files saved with multer diskStorage)
│   ├── package.json        # Backend Node dependencies and scripts (Express, Mongoose, Redis etc.)
│   └── ... other config files (e.g., .env.example, if provided)
│
├── client/
│   ├── public/
│   │   └── index.html       # HTML template for React (includes div root and may load Google API script for OAuth)
│   ├── src/
│   │   ├── main.jsx         # React entry point, renders App component, sets up BrowserRouter etc.
│   │   ├── App.jsx          # Main React component (defines routes and overall layout)
│   │   ├── Auth.css         # CSS for authentication pages (login/register styling)
│   │   ├── Login.jsx        # Login page component (form for email/password, and options for Google, GitHub, OTP login)
│   │   ├── Register.jsx     # Registration page component (form for user details; may handle OTP verification step)
│   │   ├── DirectoryView.jsx# Main file explorer component (shows files/folders in current directory, upload button, etc.)
│   │   ├── DirectoryView.css# Styles for the file explorer view
│   │   ├── components/
│   │   │   ├── ContextMenu.jsx      # Reusable context menu for file/folder actions (open, rename, delete, etc.)
│   │   │   ├── CreateDirectoryModal.jsx  # Modal dialog component to create a new folder
│   │   │   ├── DirectoryHeader.jsx  # Header for the directory view (breadcrumb navigation, buttons for upload/new folder)
│   │   │   ├── DirectoryItem.jsx    # Component representing a single file or folder in the list (with icon, name, etc.)
│   │   │   ├── DirectoryList.jsx    # Component that renders the list of DirectoryItem (contents of a folder)
│   │   │   └── RenameModal.jsx      # Modal for renaming a file or folder
│   │   ├── assets/
│   │   │   ├── react.svg        # React logo asset
│   │   │   └── ...other images (if any, e.g., icons)
│   │   ├── index.css         # Global CSS resets and styles
│   │   └── ...other pages or components (for user profile, error pages, etc.)
│   ├── package.json         # Frontend dependencies (React, etc.) and scripts (`dev`, `build`, etc.)
│   ├── vite.config.js       # Vite configuration (may include proxy settings to backend API if configured)
│   └── README.md            # (Optional) Frontend-specific README or notes
│
├── package.json             # (Root) May contain scripts to run both client & server together (using concurrently) if set up
├── important.txt            # Notes or credentials (not needed for running, possibly used by developer for reference)
└── .gitignore
```

**Note:** The structure above is simplified for overview. Some files (like environment configs, service workers, etc.) might be omitted for brevity.

## Contributing

Contributions are welcome! If you’d like to improve Storage  App or fix issues:

1. **Fork the repository** on GitHub and clone your fork to your local machine.
2. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/my-new-feature
   ```
3. Make your changes in the code, and add appropriate tests if applicable.
4. Commit your changes with clear and descriptive commit messages.
5. Push your branch to your fork on GitHub:

   ```bash
   git push origin feature/my-new-feature
   ```
6. Open a **Pull Request** against the main repository’s `main` branch. Describe your changes and why they are beneficial. The maintainers will review your PR and merge it if everything looks good.

When contributing, please follow the style and conventions of the existing codebase. For example, maintain consistent formatting, add comments where necessary, and ensure that the app still runs correctly after your changes. If you’re adding a new feature, consider updating the README as well to include it.

## License

This project is open source and available under the **MIT License**. You are free to use, modify, and distribute this software in accordance with the license terms.

*(If you reuse this code, a link back to the original repository or attribution to the author **asharful70786** is appreciated but not required.)*


## Contact

This project is maintained by **Asharful Momin**. For any questions, issues, or suggestions, please reach out:

* GitHub: [asharful70786](https://github.com/asharful70786)
* Web  : [ashraful.in](https://www.ashraful.in/)
* You can open an issue in the repository for any bug reports or feature requests.

Feel free to contact the maintainer via GitHub for further discussion or collaboration opportunities. We hope you find Storage App useful for your cloud storage needs – happy coding and cloud-storing!
