 # 🧠 Smart Career Counselor AI

An AI-powered career guidance assistant that helps users explore career paths tailored to their skills, interests, and educational background. This project uses modern LLM features such as Prompt Engineering, Retrieval-Augmented Generation (RAG), Structured Output, and Function Calling to deliver accurate and personalized recommendations.

---
 
## 📌 Features

- ✅ **Prompting**: Engages users through intelligent, structured prompts to gather inputs like skills, education, and interests.
- ✅ **RAG (Retrieval-Augmented Generation)**: Retrieves real-time career data from documents or job databases using vector search (FAISS/ChromaDB).
- ✅ **Structured Output**: Presents results in a clean, structured format like job cards (JSON or UI).
- ✅ **Function Calling**: Dynamically calls external APIs or functions to fetch course recommendations or skill-matching scores.

---

## 📂 Tech Stack

| Category        | Tools Used                             |
|----------------|-----------------------------------------|
| Language        | Python / Node.js (choose one)           |
| LLM Integration | OpenAI / Cohere / Azure OpenAI          |
| RAG             | LangChain + FAISS / Chroma              |
| Backend         | FastAPI / Express.js                    |
| Frontend (optional) | React.js / HTML + CSS               |
| Database        | JSON / SQLite / MongoDB (optional)      |
| External APIs   | Coursera, EdX, or dummy data functions  |

---

## 🚀 How It Works

1. **User Input**: User enters their skills, interests, and education background via prompts.
2. **RAG Flow**: System retrieves relevant job roles from document-based knowledge or API.
3. **Function Calling**: Backend functions or APIs fetch matching courses and score compatibility.
4. **Output**: User receives structured job cards with:
    - Job Title
    - Average Salary
    - Required Skills
    - Recommended Courses

---

## 🗂 Example Output (Structured JSON)

```json
{
  "job_title": "Data Scientist",
  "average_salary": "$120,000/year",
  "required_skills": ["Python", "Machine Learning", "SQL", "Statistics"],
  "recommended_courses": [
    {
      "name": "Machine Learning by Stanford University",
      "provider": "Coursera",
      "url": "https://coursera.org/..."
    }
  ]
}
