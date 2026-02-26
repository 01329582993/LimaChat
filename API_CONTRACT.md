# API Contract

## Public Access (Respondent)

### GET /api/public/forms/:slug
- **Description**: Fetch form details and questions for a published form.
- **Response**: `200 OK` with Form + Questions (ordered).

### POST /api/public/sessions
- **Description**: Create a new response session.
- **Body**: `{ "formSlug": "string" }`
- **Response**: `201 Created` with Session ID.

### POST /api/public/sessions/:id/answers
- **Description**: Save an answer for a specific question.
- **Body**: `{ "questionId": "string", "value": any }`
- **Response**: `200 OK`.

### POST /api/public/sessions/:id/submit
- **Description**: Finalize the session.
- **Response**: `200 OK`.

---

## Admin Access (Authenticated)

### POST /api/forms
- **Description**: Create a new form draft.
- **Body**: `{ "title": "string", "description": "string" }`

### GET /api/forms
- **Description**: List all forms owned by current user.

### GET /api/forms/:id
- **Description**: Get full form details, including questions.

### PUT /api/forms/:id
- **Description**: Update form metadata (title, desc, thank-you).

### POST /api/forms/:id/questions
- **Description**: Add a new question to the form.
- **Body**: `{ "type": "string", "prompt": "string", "order": number }`

### PUT /api/questions/:id
- **Description**: Update question details.

### DELETE /api/questions/:id
- **Description**: Remove a question.

### POST /api/forms/:id/publish
- **Description**: Toggle published status.

### GET /api/forms/:id/responses
- **Description**: Fetch all submitted sessions and answers.

### GET /api/forms/:id/export
- **Description**: Generate CSV data for responses.
