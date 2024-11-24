# Bitespeed-Backend-Task

This project is my solution for the Bitespeed Backend Task. It’s an API designed to handle identity reconciliation by linking users with shared emails or phone numbers into unified identity groups.

Features : 
Identify Contacts: Finds or creates contacts based on provided email or phone number.
Primary & Secondary Links: Ensures each group has a single primary contact, linking others as secondary.
Data Integrity: Handles duplicates and merges multiple primary contacts when needed.

Tech Stack : 
Node.js with Express.js for the API.
Prisma ORM to interact with MySQL.
Dotenv for environment variable management.

Setup Instructions :
Clone the repository and install dependencies:
in terminal ->
git clone git@github.com:akashg7/Bitespeed-Backend-Task.git
cd bitespeed-backend
npm install

Configure the .env file:
DATABASE_URL=<your-mysql-database-url>
PORT=3001

Run database migrations:
npx prisma migrate dev

Start the server:
npm start
API Documentation
POST /identify

Request Body (json):
{
  "email": "example@example.com",
  "phoneNumber": "1234567890"
}

Response (json):
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["example@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": [2, 3]
  }
}

Notes:
At least one of email or phoneNumber is required.
Validates email format.
How It Works
Searches for existing contacts using the provided email or phone number.
Links to the existing group if found, or creates a new primary contact.
Resolves duplicates by demoting newer primary contacts to secondary.
Returns the unified contact group details.

Future Enhancements : 
Advanced phone number validation.
Improved logging and error handling.
Unit and integration tests.
