# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d51df4e8-9cf2-48a4-871e-367dacc1a4a7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d51df4e8-9cf2-48a4-871e-367dacc1a4a7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Backend Setup

The backend server requires environment variables to run correctly.

1.  Navigate to the `server` directory:
    ```sh
    cd server
    ```
2.  Create a `.env` file by copying the example file:
    ```sh
    cp .env.example .env
    ```
3.  Open the `.env` file and fill in the required values for your MongoDB and SMTP configurations.


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project is configured for deployment on Render.

### Render Deployment

The `render.yaml` file in this repository is configured to deploy both the client and server. To deploy this project to Render:

1.  Create a new "Blueprint" service on Render.
2.  Connect your GitHub repository.
3.  Render will automatically detect the `render.yaml` file and configure the services.
4.  You will need to set the following environment variables for the `jolu-machinery-server` service in the Render dashboard:
    *   `MONGO_URI`
    *   `MONGO_DB_NAME`
    *   `SMTP_HOST`
    *   `SMTP_PORT`
    *   `SMTP_USER`
    *   `SMTP_PASS`
    *   `EMAIL_TO`
    *   `EMAIL_FROM`

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
