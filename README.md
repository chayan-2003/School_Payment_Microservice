### **Auth  API Documentation**

**Base URL**:  
```
https://school-payment-microservice.onrender.com
```

This API provides authentication features, including user registration, login, and logout, using secure cookie-based JWTs. It ensures that user data is handled securely by hashing passwords and generating JWT tokens for session management.

---

### **Endpoints**

---

### **1. POST /register**

#### **Description**
Registers a new user with the provided name, email, and password. The email must be unique, and the password is hashed for security before being stored.

#### **URL**
```
POST /auth/register
```

#### **Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### **Validation Requirements**
- `name`: Must be provided and should be a valid string.
- `email`: Must be a valid email address.
- `password`: Must be between 6 and 20 characters in length.

#### **Success Response**
- **Status Code**: `201 Created`
```json
{
  "message": "User created successfully"
}
```

#### **Error Response**
- **Status Code**: `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Email already exists",
  "error": "Bad Request"
}
```

---

### **2. POST /login**

#### **Description**
Authenticates a user by verifying their email and password. If authentication is successful, a secure HTTP-only cookie containing the JWT token is set for session management.

#### **URL**
```
POST /auth/login
```

#### **Request Body**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### **Validation Requirements**
- `email`: Must be a valid email address.
- `password`: Must be between 6 and 20 characters in length.

#### **Success Response**
- **Status Code**: `200 OK`
```json
{
  "message": "Logged in successfully"
}
```
- A secure cookie named `token` will be set for session management.

#### **Error Responses**
- **Status Code**: `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Wrong credentials",
  "error": "Bad Request"
}
```
- **Status Code**: `403 Forbidden`
```json
{
  "statusCode": 403,
  "message": "Could not sign in",
  "error": "Forbidden"
}
```

---

### **3. GET /logout**

#### **Description**
Logs the user out by clearing the authentication token cookie. This invalidates the current session.

#### **URL**
```
GET /auth/logout
```

#### **Success Response**
- **Status Code**: `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### **Service Layer Flow**

1. **POST /register**
   - When a user sends a `POST` request to the `/register` endpoint, the `AuthService.register()` method is invoked.
   - The method checks if the email is already associated with an existing user in the database using `prisma.user.findUnique()`.
   - If the email exists, a `BadRequestException` is thrown with the message "Email already exists".
   - If the email is unique, the password is hashed using `bcrypt.hash()`.
   - A new user record is created in the database with the hashed password using `prisma.user.create()`.
   - The response is sent with a success message: "User created successfully".

2. **POST /login**
   - When a user sends a `POST` request to the `/login` endpoint, the `AuthService.login()` method is invoked.
   - The method retrieves the user from the database using `prisma.user.findUnique()` based on the provided email.
   - If no user is found, a `BadRequestException` with the message "Wrong credentials" is thrown.
   - The password provided by the user is compared to the stored hashed password using `bcrypt.compare()`.
   - If the passwords do not match, a `BadRequestException` is thrown with the same "Wrong credentials" message.
   - If the passwords match, a JWT token is generated using `JwtService.signAsync()` with the user's ID and email as the payload.
   - The token is sent back as a secure, HTTP-only cookie with the response.
   - If any issue occurs during token generation, a `ForbiddenException` is thrown.

3. **GET /logout**
   - When a user sends a `GET` request to the `/logout` endpoint, the `AuthService.logout()` method is invoked.
   - The method clears the authentication token cookie using `res.clearCookie()`.
   - The response contains a success message: "Logged out successfully".

---

### **Error Handling**

- **BadRequestException (400)**: Triggered when invalid input is provided, such as when the email is already registered or when the login credentials are incorrect.
  
- **ForbiddenException (403)**: Triggered when there is an issue signing the JWT token, such as an internal server error.

- **Other Errors**: Any other unexpected errors (e.g., database issues) are automatically handled by NestJS’s global exception filters and return a 500 Internal Server Error.

---

### **Security Considerations**
- The `password` is securely hashed using `bcrypt` before storage to prevent plaintext password storage.
- The JWT token is set as a secure, HTTP-only cookie to prevent client-side access, reducing the risk of cross-site scripting (XSS) attacks.
- Secure cookies are configured with `secure: true` and `sameSite: 'none'`, ensuring they are transmitted over HTTPS and for cross-origin requests.

