#  Overview and Design Assumptions



This system manages order creation and tracks associated payment transactions. Based on the provided requirements and schema, a **one-to-many relationship** is assumed between the `Order` and `OrderStatus` models. That is, a single order may result in multiple transaction records. This allows for handling multiple payment attempts or updates from the payment gateway.

Due to this relationship:

- There can be **multiple `OrderStatus` records with the same `collect_id`**, each reflecting a different payment event tied to a single order.
- Similarly, the `customOrderId`, which uniquely identifies each order (e.g., `ORD-1001`, `ORD-1002`, etc.), **may appear multiple times** when viewing aggregated transaction data, since each associated transaction would reference the same `customOrderId`.

This design supports transparency and flexibility in scenarios where payment retries or partial transactions occur.

### `customOrderId` Format and Considerations

Each order is assigned a `customOrderId` to make external referencing and communication more human-readable and standardized. The format used (e.g., `ORD-1001`, `ORD-1002`) is intended to be sequential and meaningful for business operations.

Although `customOrderId` is unique within the `Order` schema, when joined with transaction-level records, it can appear multiple times — once per transaction attempt — due to the one-to-many relationship with `OrderStatus`.

Therefore, consumers of this identifier must be aware that querying by `customOrderId` may return multiple records reflecting the transaction history for a single order.

### API: `/transaction-status/:customOrderId`

This endpoint is designed to return **all transactions associated with a given `customOrderId`**. This includes every payment attempt or gateway response linked to the corresponding order.

Key considerations:
- Returns multiple entries to reflect the full transaction history.
- More fields may be returned than originally expected, to aid in debugging and enhance transparency.
- Each returned record includes all relevant transaction-level details from the `OrderStatus` schema.

### API: `/webhook`

This API simulating webhook notification from the payment gateway are used to update transaction status in near real-time.

The behavior is as follows:
- When a webhook is received, it contains a `collect_id` which is matched against the `OrderStatus` table.
- Given the possibility of multiple `OrderStatus` records per `collect_id`, the system updates **only the first matching record** to ensure consistent and controlled updates.
- Every webhook payload is stored in the `WebhookLog` collection to provide traceability and support for debugging or reconciliation.


---

# Auth  API 

**Base URL**:  
```
https://school-payment-microservice.onrender.com
```



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

Got it! Here’s the revised version of the API documentation, with the Service Layer Flow placed at the end, as requested:

---

# Payments API

### **Base URL**:
```
https://school-payment-microservice.onrender.com/
```

---

### **Endpoints**:

#### **POST /create-payment**

##### **Description**:
This endpoint allows users to create a payment request by passing payment details. It requires a valid JWT token in the Authorization header for security.

##### **Request Headers**:

- **Authorization**: `Bearer <JWT token>` (JWT token to authenticate the user)

##### **Request Body**:
```json
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "amount": "1",
  "callback_url": "https://google.com"

}
```

- **`school_id`** (string, required): MongoDB ObjectId of the school. Must match the format of a valid ObjectId.
- **`amount`** (string, required): Amount to be paid (numeric string).
- **`callback_url`** (string, required): A valid URL where the callback after the payment will be sent.

##### **Validation Requirements**:

- **`school_id`**: Should be a valid MongoDB ObjectId.
- **`amount`**: Should be a numeric string.
- **`callback_url`**: Should be a valid URL.

##### **Response** (Success):
```json
{
    "collect_request_id": "6813ca22d155691054fe8ed9",
    "collect_request_url": "https://dev-payments.edviron.com/edviron-pg/redirect?session_id=session_M8VAZkf2rmfBgjAp9KxbMw_xcLRCzupRJcc5QmA0_4Gfkqf_xSXEVzxWH_8_C1aVpVU6yd4VMNwhx0yqwASYlM95xBkImZCKfX0kkfMd0TjRa_8PyKA5zUlpVBHeDApaymentpayment&collect_request_id=6813ca22d155691054fe8ed9&amount=1.00&&platform_charges=%5B%7B%22platform_type%22%3A%22UPI%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A2%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22CreditCard%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A2%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22DebitCard%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A20%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3A100%7D%5D%7D%2C%7B%22platform_type%22%3A%22NetBanking%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A1%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22Wallet%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A20%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22PayLater%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A20%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22CardLess%20EMI%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A20%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22DebitCard%22%2C%22payment_mode%22%3A%22Visa%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A1%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3A100%7D%2C%7B%22charge%22%3A10%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22NetBanking%22%2C%22payment_mode%22%3A%22AU%20Small%20Finance%20Bank%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A10%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3A20%7D%2C%7B%22charge%22%3A0%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%5D&school_name=Some-School",
    "sign": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0X3JlcXVlc3RfaWQiOiI2ODEzY2EyMmQxNTU2OTEwNTRmZThlZDkiLCJjb2xsZWN0X3JlcXVlc3RfdXJsIjoiaHR0cHM6Ly9kZXYtcGF5bWVudHMuZWR2aXJvbi5jb20vZWR2aXJvbi1wZy9yZWRpcmVjdD9zZXNzaW9uX2lkPXNlc3Npb25fTThWQVprZjJybWZCZ2pBcDlLeGJNd194Y0xSQ3p1cFJKY2M1UW1BMF80R2ZrcWZfeFNYRVZ6eFdIXzhfQzFhVnBWVTZ5ZDRWTU53aHgweXF3QVNZbE05NXhCa0ltWkNLZlgwa2tmTWQwVGpSYV84UHlLQTV6VWxwVkJIZURBcGF5bWVudHBheW1lbnQmY29sbGVjdF9yZXF1ZXN0X2lkPTY4MTNjYTIyZDE1NTY5MTA1NGZlOGVkOSZhbW91bnQ9MS4wMCYmcGxhdGZvcm1fY2hhcmdlcz0lNUIlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyVVBJJTIyJTJDJTIycGF5bWVudF9tb2RlJTIyJTNBJTIyT3RoZXJzJTIyJTJDJTIycmFuZ2VfY2hhcmdlJTIyJTNBJTVCJTdCJTIyY2hhcmdlJTIyJTNBMiUyQyUyMmNoYXJnZV90eXBlJTIyJTNBJTIyRkxBVCUyMiUyQyUyMnVwdG8lMjIlM0FudWxsJTdEJTVEJTdEJTJDJTdCJTIycGxhdGZvcm1fdHlwZSUyMiUzQSUyMkNyZWRpdENhcmQlMjIlMkMlMjJwYXltZW50X21vZGUlMjIlM0ElMjJPdGhlcnMlMjIlMkMlMjJyYW5nZV9jaGFyZ2UlMjIlM0ElNUIlN0IlMjJjaGFyZ2UlMjIlM0EyJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJQRVJDRU5UJTIyJTJDJTIydXB0byUyMiUzQW51bGwlN0QlNUQlN0QlMkMlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyRGViaXRDYXJkJTIyJTJDJTIycGF5bWVudF9tb2RlJTIyJTNBJTIyT3RoZXJzJTIyJTJDJTIycmFuZ2VfY2hhcmdlJTIyJTNBJTVCJTdCJTIyY2hhcmdlJTIyJTNBMjAlMkMlMjJjaGFyZ2VfdHlwZSUyMiUzQSUyMkZMQVQlMjIlMkMlMjJ1cHRvJTIyJTNBMTAwJTdEJTVEJTdEJTJDJTdCJTIycGxhdGZvcm1fdHlwZSUyMiUzQSUyMk5ldEJhbmtpbmclMjIlMkMlMjJwYXltZW50X21vZGUlMjIlM0ElMjJPdGhlcnMlMjIlMkMlMjJyYW5nZV9jaGFyZ2UlMjIlM0ElNUIlN0IlMjJjaGFyZ2UlMjIlM0ExJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJGTEFUJTIyJTJDJTIydXB0byUyMiUzQW51bGwlN0QlNUQlN0QlMkMlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyV2FsbGV0JTIyJTJDJTIycGF5bWVudF9tb2RlJTIyJTNBJTIyT3RoZXJzJTIyJTJDJTIycmFuZ2VfY2hhcmdlJTIyJTNBJTVCJTdCJTIyY2hhcmdlJTIyJTNBMjAlMkMlMjJjaGFyZ2VfdHlwZSUyMiUzQSUyMlBFUkNFTlQlMjIlMkMlMjJ1cHRvJTIyJTNBbnVsbCU3RCU1RCU3RCUyQyU3QiUyMnBsYXRmb3JtX3R5cGUlMjIlM0ElMjJQYXlMYXRlciUyMiUyQyUyMnBheW1lbnRfbW9kZSUyMiUzQSUyMk90aGVycyUyMiUyQyUyMnJhbmdlX2NoYXJnZSUyMiUzQSU1QiU3QiUyMmNoYXJnZSUyMiUzQTIwJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJQRVJDRU5UJTIyJTJDJTIydXB0byUyMiUzQW51bGwlN0QlNUQlN0QlMkMlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyQ2FyZExlc3MlMjBFTUklMjIlMkMlMjJwYXltZW50X21vZGUlMjIlM0ElMjJPdGhlcnMlMjIlMkMlMjJyYW5nZV9jaGFyZ2UlMjIlM0ElNUIlN0IlMjJjaGFyZ2UlMjIlM0EyMCUyQyUyMmNoYXJnZV90eXBlJTIyJTNBJTIyUEVSQ0VOVCUyMiUyQyUyMnVwdG8lMjIlM0FudWxsJTdEJTVEJTdEJTJDJTdCJTIycGxhdGZvcm1fdHlwZSUyMiUzQSUyMkRlYml0Q2FyZCUyMiUyQyUyMnBheW1lbnRfbW9kZSUyMiUzQSUyMlZpc2ElMjIlMkMlMjJyYW5nZV9jaGFyZ2UlMjIlM0ElNUIlN0IlMjJjaGFyZ2UlMjIlM0ExJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJQRVJDRU5UJTIyJTJDJTIydXB0byUyMiUzQTEwMCU3RCUyQyU3QiUyMmNoYXJnZSUyMiUzQTEwJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJGTEFUJTIyJTJDJTIydXB0byUyMiUzQW51bGwlN0QlNUQlN0QlMkMlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyTmV0QmFua2luZyUyMiUyQyUyMnBheW1lbnRfbW9kZSUyMiUzQSUyMkFVJTIwU21hbGwlMjBGaW5hbmNlJTIwQmFuayUyMiUyQyUyMnJhbmdlX2NoYXJnZSUyMiUzQSU1QiU3QiUyMmNoYXJnZSUyMiUzQTEwJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJGTEFUJTIyJTJDJTIydXB0byUyMiUzQTIwJTdEJTJDJTdCJTIyY2hhcmdlJTIyJTNBMCUyQyUyMmNoYXJnZV90eXBlJTIyJTNBJTIyUEVSQ0VOVCUyMiUyQyUyMnVwdG8lMjIlM0FudWxsJTdEJTVEJTdEJTVEJnNjaG9vbF9uYW1lPVNvbWUtU2Nob29sIiwiY3VzdG9tX29yZGVyX2lkIjpudWxsLCJleHAiOjE3NDYxMzQ1OTR9.dPXDJ0Wrs5KVMq0oZ7IS0xyuVEtyugHgDB8fvaURv28"
}
```

- **`collect_request_id`** (string): Unique identifier for the collect request.
- **`collect_request_url`** (string): URL to initiate the payment on the external payment gateway.
- **`sign`** (string): The generated signature for verification purposes.

##### **Response** (Error):
```json
{
  "message": "Payment creation failed",
  "error": "Detailed error message"
}
```

- **`message`**: (string) A generic message describing the error.
- **`error`**: (string) Specific error message from the service (e.g., network failure, invalid response).

##### **Error Codes**:
- **400 Bad Request**: Invalid input parameters (e.g., malformed `school_id`, `amount`, or `callback_url`).
- **500 Internal Server Error**: Server-side error, such as a failure in the external payment gateway request.

---

### **Security Considerations**

- **JWT Authentication**:
  - The endpoint is protected by the `JwtAuthGuard`, ensuring that only authenticated users can access it. The JWT token is expected to be included in the `Authorization` header as a Bearer token.
  - The token is validated to verify the user's authenticity before processing the payment request.

- **Sensitive Information Handling**:
  - **API Keys**: The payment gateway API key (`PG_API_KEY`) and secret key (`PG_SECRET_KEY`) are stored securely in environment variables, preventing exposure in the code.
  - **Signature**: A unique signature (`sign`) is generated and used to authenticate requests to the payment gateway. This ensures that the request hasn't been tampered with.

- **Secure Cookies for JWT**:
  - The JWT token used for authentication is stored as an HTTP-only cookie, which cannot be accessed by JavaScript, minimizing the risk of cross-site scripting (XSS) attacks.
  - The token is also marked as `Secure` to ensure it is only transmitted over HTTPS, and `SameSite` is set to `'None'` to allow cross-origin requests.

---

### **Service Layer Flow**

1. **POST /create-payment**:

    - When a user sends a POST request to `/create-payment`, the `PaymentsService.createPayment()` method is invoked.
    
    - **Step 1: Input Validation**: 
        - The `school_id`, `amount`, and `callback_url` from the request body are validated:
          - `school_id` is checked to ensure it's a valid MongoDB ObjectId.
          - `amount` is checked to ensure it is a numeric string.
          - `callback_url` is checked to ensure it is a valid URL.

    - **Step 2: Prepare the Payment Request**:
        - The payment details (school_id, amount, callback_url) are used to construct a request to the external payment gateway API (`https://dev-vanilla.edviron.com/erp/create-collect-request`).
        - A signature is generated by hashing the payment details and the API secret key.

    - **Step 3: Send Payment Request to Gateway**:
        - The `HttpService` is used to send a POST request to the payment gateway's API with the necessary headers and body, including the generated signature.
        
    - **Step 4: Handle Gateway Response**:
        - If the payment request is successfully created, the response from the payment gateway will contain a `collect_request_id`, `collect_request_url`, and `sign`.
        - The service extracts these values and prepares the response for the client.

    - **Step 5: Error Handling**:
        - If the request fails (e.g., network issues, invalid response), a `500 Internal Server Error` is thrown with a detailed error message.
        - If the input parameters are invalid (e.g., malformed `school_id` or `amount`), a `400 Bad Request` exception is thrown with a relevant message.

    - **Step 6: Return Response**:
        - Upon success, the generated payment details are returned to the client.
        - If there is an error, a relevant error message is sent to the client.

---

### **Error Handling**

- **BadRequestException (400)**: Triggered when invalid input is provided, such as:
  - The `school_id` is not a valid MongoDB ObjectId.
  - The `amount` is not a numeric string.
  - The `callback_url` is not a valid URL.

- **Internal Server Errors (500)**: 
  - These errors occur when there's an issue during the communication with the external payment gateway or any internal service failure.
  - A detailed error message is provided to help identify the problem (e.g., failure to send the payment request).

- **ForbiddenException (403)**: 
  - Triggered when the JWT token is invalid or expired, preventing unauthorized access to the payment creation endpoint.

---


---


# Transactions  API 

**Base URL**:  
```
https://school-payment-microservice.onrender.com/transactions
```

### Endpoints



#### 1. **GET /**
**Description**:  
This endpoint fetches all transactions with various filtering options like status, school_id, sorting, and pagination. The service uses MongoDB **aggregation** to efficiently process and filter the data based on the given query parameters.

**Query Parameters**:
- `status` (string | string[]): Filter by order status.
- `school_id` (string | string[]): Filter by school ID.
- `sortBy` (string): Field to sort by. Defaults to `payment_time`.
- `sortOrder` ('asc' | 'desc'): Sorting order. Defaults to 'asc'.
- `page` (string): Page number for pagination. Defaults to '1'.
- `limit` (string): Number of records per page. Defaults to '10'.
- `startDate` (string, optional): Start date for filtering by payment time.
- `endDate` (string, optional): End date for filtering by payment time.

**Response**:
```json
{
  "meta": {
    "page": 1,
    "limit": 10,
    "totalEntries": 100,
    "totalPages": 10
  },
  "data": [
    {
      "collect_id": "5f6a8f3d7f1c7c001f8c03a1",
      "school_id": "60d21b4667d0d8992e610c85",
      "gateway_name": "PayPal",
      "order_amount": 5000,
      "transaction_amount": 5000,
      "status": "Completed",
      "payment_time": "2023-10-10T14:48:00Z",
      "custom_order_id": "ORD12345"
    },
    ...
  ]
}
```

**Notes**:
- The **aggregation** pipeline is used in the service layer to process the query with various stages like `$lookup`, `$unwind`, `$match`, `$sort`, and `$skip`/`$limit` for pagination.
- The aggregation process also includes optional filtering by `status`, `school_id`, and `payment_time` if applicable.
- The sorting and pagination happen in the aggregation pipeline to efficiently return the results.

---

#### 3. **GET /school/:schoolId**
**Description**:  
This endpoint retrieves all transactions related to a specific school, identified by `schoolId`. It utilizes **aggregation** in the service layer to retrieve and process the transactions, including a lookup for related order status information.

**Parameters**:
- `schoolId` (string): The unique identifier for the school whose transactions are being retrieved.

**Response**:
```json
{
  "schoolId": "60d21b4667d0d8992e610c85",
  "transactions": [
    {
      "collect_id": "5f6a8f3d7f1c7c001f8c03a1",
      "school_id": "60d21b4667d0d8992e610c85",
      "gateway_name": "PayPal",
      "order_amount": 5000,
      "transaction_amount": 5000,
      "status": "Completed",
      "payment_time": "2023-10-10T14:48:00Z"
    },
    ...
  ]
}
```

**Notes**:
- The **aggregation** pipeline in the service layer includes a `$lookup` to join the `OrderStatus` collection with the transactions based on the `collect_id`.
- The pipeline also applies a `$match` stage to filter by the provided `schoolId`.
- The data is then projected to include only the necessary fields before being returned as the result.

---

## Service Layer Flow

### Aggregation Details

#### **GET /**  
- The `TransactionsController` invokes the `TransactionsService.getAllTransactions()` method.
- **Aggregation Pipeline**:
  - **$lookup**: Joins the `OrderStatus` collection to fetch the associated order status.
  - **$unwind**: Flattens the array resulting from the `$lookup`.
  - **$match**: Filters based on the provided `status`, `school_id`, and optional `payment_time` range (start and end dates).
  - **$addFields**: Adds additional fields like `transaction_amount` (converted to a numeric type).
  - **$sort**: Applies sorting based on the `sortBy` parameter.
  - **$project**: Projects the necessary fields such as `order_amount`, `transaction_amount`, `status`, and `payment_time`.
  - **Pagination**: Uses `$skip` and `$limit` for pagination.
- **Result**: The aggregation query returns the filtered and sorted transactions along with pagination metadata like `totalEntries` and `totalPages`.

#### **GET /school/:schoolId**  
- The `TransactionsController` invokes the `TransactionsService.getTransactionsBySchool()` method.
- **Aggregation Pipeline**:
  - **$lookup**: Joins the `OrderStatus` collection to fetch the associated order status.
  - **$unwind**: Flattens the array resulting from the `$lookup`.
  - **$match**: Filters by the provided `schoolId`.
  - **$project**: Projects the necessary fields such as `order_amount`, `transaction_amount`, and `status`.
- **Result**: The aggregation query returns the transactions specific to the given `schoolId`.

---

## Error Handling

**Common Errors**:
- **400 Bad Request**: Invalid query parameters or missing required fields (e.g., invalid `school_id` or `status`).
- **500 Internal Server Error**: An unexpected error occurs during database interaction or aggregation.

---

## Security Considerations

- **JWT Authentication**: The `/transactions` route is protected by the `JwtAuthGuard`, requiring a valid JWT token in the request header for accessing endpoints.
- **Database Query Protection**: Filters are applied to prevent any unauthorized access to the database (e.g., restricting queries to specific school IDs and statuses).

Thanks for the detailed context. Based on your previous message, here's the **cleaned-up, structured, and technical API documentation** for the `/webhook` endpoint that matches the style and depth of your `/create-payment` documentation — **with service-layer flow, authentication details, and DTO usage.**

---

# Webhook  API 

## Base URL:
```
https://school-payment-microservice.onrender.com
```

## Endpoint:
### `POST /webhook`

### Description:
This endpoint receives webhook events from an external payment gateway to update the information of order_Status. Authentication via JWT is required to ensure only authorized systems or users can send such updates.

---

## Request Headers:
- **Authorization**: `Bearer <JWT token>`  
  A valid JWT token is required for authentication.

---

## Request Body (DTO: `UpdateTransactionStatusDto`):

```json
{
  "status": 200,
  "order_info": {
    "order_id": "6810d9689c29991d4b81d0ae",
    "order_amount": 1200,
    "transaction_amount": 1200,
    "gateway": "razorpay",
    "status": "SUCCESS",
    "payment_mode": "UPI",
    "payment_time": "2025-04-30T10:20:30.000Z"
  }
}
```

#### Field Details:
- `status` (number, required): Indicator of webhook type or processing state.
- `order_info` (object, required): Contains payment transaction details.
  - `order_id` (string, required): The order identifier from the system.
  - `order_amount` (number, required): Total amount for the order.
  - `transaction_amount` (number, required): Amount successfully transacted.
  - `gateway` (string, required): Payment gateway used (`razorpay`, `paytm`, etc.).
  - `status` (string, required): Transaction status (e.g., `SUCCESS`, `FAILED`).
  - `payment_mode` (string, required): Mode of payment (e.g., `UPI`, `CARD`).
  - `payment_time` (ISODate string, required): Timestamp of payment confirmation.

---

## Response (Success):

```json
{
  "message": "Transaction updated successfully"
}
```

---

## Response (Error):

```json
{
  "message": "Failed to update transaction",
  "error": "Detailed error message"
}
```

---

## Error Codes:

- **400 Bad Request**: Invalid webhook payload (missing fields or incorrect format).
- **401 Unauthorized**: JWT token missing or invalid.
- **500 Internal Server Error**: Failure in processing transaction or internal service error.

---

## Security Considerations

### JWT Authentication:

- Protected via `JwtAuthGuard`.
- Requires a valid JWT in the `Authorization` header (`Bearer <token>`).
- Unauthorized access attempts are blocked with a `403 Forbidden` or `401 Unauthorized` error.

---

### Secure Webhook Handling:

- All webhook data is validated using the `UpdateTransactionStatusDto`.
- Requests are logged for audit and debugging purposes.
- Status is updated only after confirming the transaction details are valid and consistent with business logic.

---

## Service Layer Flow

### POST `/webhook`

When a webhook request is received, the `WebhookService.updateTransactionStatus()` method is executed.

### Step-by-Step Flow:

#### Step 1: Input Validation
- `UpdateTransactionStatusDto` validates the incoming payload.
- Invalid or missing fields trigger a `BadRequestException`.

#### Step 2: Transaction Processing
- Extract order_id and other metadata from the payload.
- Check if the order exists in the database.
- Validate the integrity of transaction data (e.g., matching amounts).

#### Step 3: Update Order Status
- The order status is updated after matching the incoming order_id with the collect_id  of the order_status . Since there could be same collect_id for multiple order_status , it would update the first order_status entry that matches.
- Associated metadata (e.g., payment_time, payment_mode) is also stored.

#### Step 4: Logging and Auditing
- A log is stored with the webhook payload and response to prevent duplicate processing or fraud.

#### Step 5: Error Handling
- Any error during the process (e.g., database failure, logic failure) results in a `500 Internal Server Error` response.
- Error details are logged and returned in a structured format.

#### Step 6: Final Response
- On success, returns `{ message: 'Transaction updated successfully' }`.
- On failure, returns error message with appropriate status code.



---
# Transaction Status API

---

### **Base URL**
```
https://school-payment-microservice.onrender.com
```

---

### **Endpoint**
```
GET /transaction-status/:customOrderId
```

---

### **Description**
This endpoint retrieves all transaction statuses (from aggregated transactions) associated with a specific `customOrderId`. Since multiple transactions can exist for a single order, the response includes all related `OrderStatus` entries.

---

### **Request Parameters**
| Parameter         | Type   | Required | Description                                      |
|--------------------|--------|----------|--------------------------------------------------|
| `customOrderId`    | String | Yes      | The custom identifier for the order (e.g., `ORD-1001`). |

---

### **Request Headers**
| Header            | Description                                      |
|--------------------|--------------------------------------------------|
| `Authorization`   | Bearer `<JWT token>` (A valid JWT token is required for authentication). |

---

### **Response**

#### **Success**
```json
{
  "customOrderId": "ORD-1001",
  "transactions": [
    {
      "order_amount": 1200,
      "transaction_amount": 1200,
      "gateway": "razorpay",
      "status": "SUCCESS",
      "payment_mode": "UPI",
      "payment_time": "2025-04-30T10:20:30.000Z"
    },
    {
      "order_amount": 1200,
      "transaction_amount": 600,
      "gateway": "razorpay",
      "status": "PENDING",
      "payment_mode": "UPI",
      "payment_time": "2025-04-30T10:10:30.000Z"
    }
  ]
}
```

#### **Error**
```json
{
  "message": "Failed to retrieve transaction statuses",
  "error": "Detailed error message"
}
```

---

### **Error Codes**
| Status Code       | Description                                      |
|--------------------|--------------------------------------------------|
| `400 Bad Request` | Invalid `customOrderId` or missing required fields. |
| `401 Unauthorized`| JWT token missing or invalid.                    |
| `404 Not Found`   | No transactions found for the given `customOrderId`. |
| `500 Internal Server Error` | Failure in processing the request or internal service error. |

---

### **Field Details**
| Field Name         | Type   | Description                                      |
|---------------------|--------|--------------------------------------------------|
| `customOrderId`     | String | The custom identifier for the order.            |
| `transactions`      | Array  | List of transaction statuses associated with the order. |
| `order_amount`      | Number | Total amount for the order.                     |
| `transaction_amount`| Number | Amount successfully transacted.                 |
| `gateway`           | String | Payment gateway used (e.g., Razorpay, Paytm).   |
| `status`            | String | Transaction status (e.g., SUCCESS, FAILED).     |
| `payment_mode`      | String | Mode of payment (e.g., UPI, CARD).              |
| `payment_time`      | ISODate| Timestamp of payment confirmation.              |

---

### **Security Considerations**

#### **JWT Authentication**
- The endpoint is protected via `JwtAuthGuard`.
- Requires a valid JWT token in the `Authorization` header (`Bearer <token>`).
- Unauthorized access attempts are blocked with a `403 Forbidden` or `401 Unauthorized` error.

#### **Secure Data Handling**
- The `customOrderId` is validated to ensure it matches the expected format.
- Requests are logged for audit and debugging purposes.
- Only authorized users or systems can access transaction data.

---

### **Example Usage**

#### **Request**
```
GET /transaction-status/ORD-1002
Authorization: Bearer <JWT token>
```

#### **Response**
```json
[
    {
        "_id": "6810d9689c29991d4b81d099",
        "school_id": "6810d9689c29991d4b81d09a",
        "customOrderId": "ORD-1002",
        "gateway_name": "Stripe",
        "collect_id": "6810d9689c29991d4b81d099",
        "order_amount": 1000,
        "transaction_amount": 950.5,
        "status": "Success",
        "payment_time": "2025-04-29T10:30:00.000Z"
    },
    {
        "_id": "6810d9689c29991d4b81d099",
        "school_id": "6810d9689c29991d4b81d09a",
        "customOrderId": "ORD-1002",
        "gateway_name": "Stripe",
        "collect_id": "6810d9689c29991d4b81d099",
        "order_amount": 22000,
        "transaction_amount": 220,
        "status": "Success",
        "payment_time": "2023-01-18T11:29:18.287Z"
    }
]
```

---

###  **Postman Collection Instructions**

You can access the Postman collection using the following link:  
 [Postman Collection Link](https://blue-star-364034.postman.co/workspace/My-Workspace~d953dd8c-e295-43ee-8350-d0c704ee7809/collection/28705488-16c7dc78-3f5d-4017-8447-6210bc269512?action=share&creator=28705488)

#### **Usage Flow**
1. **Register**  
   - Go to `auth/register` request.  
   - Modify the body with your desired user details (e.g., `name`, `email`, `password`) and send the request to create a new account.

2. **Login**  
   - Go to `auth/login` request.  
   - Enter the same `email` and `password` used during registration and send the request.  
   - On success, a session cookie will be automatically stored.

3. **Access Other Routes**  
   - Once logged in, all protected routes in the collection will become accessible using the stored authentication cookie.  
   - You can now test all authenticated routes without additional headers.

---

###  Environment Variables (`.env`)



```
mongo_uri=mongodb+srv://chayanghosh185:chaya@cluster0.bdiz4vu.mongodb.net/booking?retryWrites=true&w=majority
JWT_SECRET=0LxQYpsZOSlshGtO9F0as3bd19qYn4TZ
PG_SECRET_KEY=edvtest01
PG_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2LCJpYXQiOjE3MTE2MjIyNzAsImV4cCI6MTc0MzE3OTg3MH0.Rye77Dp59GGxwCmwWekJHRj6edXWJnff9finjMhxKuw
JWT_EXPIRY=10h

```

.




