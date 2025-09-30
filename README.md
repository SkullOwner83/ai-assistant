# AI- ASSISTANT
AI-Assistant is a virtual assistant powered by artificial intelligence. It can generate embeddings from the uploaded files (datasets) to perform **semantic searches** and answer user questions based on those files.

**How it works:**
- A user uploads a file with a question to create a new conversation linked to that dataset.
- The backend processes the input: generates embeddings for documents, stores the conversation in the database, and saves the embeddings locally in ChromaDB.
- If an OpenAI API key is provided, the assistant can generate AI-powered responses.
- If the OpenAI key is missing or invalid, the assistant will automatically try Hugging Face models for accessibility and free usage. If neither API is available, it will return predefined text or simple logic.

## Backend

1. Enter the backend directory:

```cd backend```

2. Create a virtual environment:

```python -m venv venv```

3. Activate the virtual environment:
- Windows:

```.\venv\Scripts\Activate.ps1```
- Linux/Mac: 

```source venv/bin/activate```

4. Install dependencies:

```pip install -r requirements.txt```

5. Run the server

```uvicorn main:app --reload```

## Frontend

1.- Enter the frontend directory:

```cd frontend```

2.- Install dependencies:

```npm install```

3.- Run the server:

```npm run dev```

The frontend will be available in http://localhost:3000.
  
## Database
1. Create the database and execute the initialization script (from the project root):

```mysql -u <user> -p database/init.sql```

2. Populate test data:

```mysql -u <user> database/seed.sql```

## Environment Variables
1. Copy ```example.env``` and rename it to ```.env```
2. Replace the placeholders with your actual credentials.

```
# AI API key (OpenAI or Hugging Face)
API_KEY=<your_api_key>

# MySQL database configuration
DB_USER=<your_mysql_user>
DB_PASSWORD=<your_mysql_password>
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_assistant
```

> [!NOTE]
> - **OpenAI priority**: If the API key is for OpenAI, the assistant will use OpenAI’s models first.
> - **Hugging Face fallback**: If OpenAI fails (invalid or missing key), the assistant will automatically try Hugging Face models (Model: `meta-llama/Llama-3.1-8B-Instruct:cerebras`).
> - You only need **one API key**—either OpenAI or Hugging Face. No extra configuration is required.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.