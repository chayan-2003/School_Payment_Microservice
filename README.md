# Auth API Documentation

**Base URL:**  
`https://school-payment-microservice.onrender.com/auth`

This API provides authentication features including user registration, login, and logout using secure cookie-based JWTs.

---

## Endpoints

---

### **POST** `/register`

Registers a new user.

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Validation Requirements

- **name**: must be provided and should be a valid string.
- **email**: must be a valid email address.
- **password**: must be between 6 and 20 characters in length.

#### Success Response – `201 Created`

```json
{
  "message": "User created successfully"
}
```

#### Error – `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": "Email already exists",
  "error": "Bad Request"
}
```

---

### **POST** `/login`

Authenticates a user and sets a secure HTTP-only cookie containing the JWT.

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Validation Requirements

- **email**: must be a valid email address.
- **password**: must be between 6 and 20 characters in length.

#### Success Response – `200 OK`

```json
{
  "message": "Logged in successfully"
}
```

> A secure cookie named `token` is set for session management.

#### Error – `400 Bad Request`

```json
{
  "statusCode": 400,
  "message": "Wrong credentials",
  "error": "Bad Request"
}
```

#### Error – `403 Forbidden`

```json
{
  "statusCode": 403,
  "message": "Could not sign in",
  "error": "Forbidden"
}
```

---

### **GET** `/logout`

Logs the user out by clearing the authentication token cookie.

#### Success Response – `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

Sure! Here is a comprehensive **API documentation** for the Payment API built using **NestJS**:

---

# **Payment API Documentation**

## **Overview**

The Payment API allows clients to initiate payments via a third-party payment gateway. This API enables the creation of payment requests, including payload signing, error handling, and obtaining relevant payment details (like request ID, payment URL).

### **Base URL**
```
`https://school-payment-microservice.onrender.com/`
```

---

## **1. Endpoints**

### **1.1 Create Payment Request**
- **Endpoint:** `POST /create-payment`
- **Description:** Initiates a payment request with the given details.
- **Authentication:** Requires JWT Bearer Token in the `Authorization` header.

#### **Request**

##### **Headers**
| Key            | Value                      |
|----------------|----------------------------|
| Content-Type   | application/json           |
| Authorization  | Bearer `<JWT_TOKEN>`        |

##### **Body (JSON)**

```json
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "amount": "1",
  "callback_url": "https://google.com",
  "sign": "eyJhbGciOiJIUzI1NiJ9.eyJzY2hvb2xfaWQiOiI2NWIwZTYyOTNlOWY3NmE5Njk0ZDg0YjQiLCJhbW91bnQiOiIxIiwiY2FsbGJhY2tfdXJsIjoiaHR0cHM6Ly9nb29nbGUuY29tIn0.DJ10HHluuiIc4ShhEPYEJZ2xWNpF_g1V0x2nGNcB9uk"
}
```

**Fields:**
- **`school_id`**: (string) The unique identifier of the school. *Required*
- **`amount`**: (number) The payment amount. *Required*
- **`callback_url`**: (string) The URL where the payment status will be sent. *Required*

#### **Response**

```json
{
    "collect_request_id": "6811c988d155691054fe756d",
    "collect_request_url": "https://dev-payments.edviron.com/edviron-pg/redirect?session_id=session_lD2iblyLwV4qia-_G6SKggrCECAxuWFoFazj8d-GG-lF_-4CofYcvXw1so24_QDrzdRLx1LNew-YwacoGQuzq3bP7VivzWxjv6VX15Eb8ZHJJsyF7vg6qoHHtCJ1zgpaymentpayment&collect_request_id=6811c988d155691054fe756d&amount=1.00&&platform_charges=%5B%7B%22platform_type%22%3A%22UPI%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A2%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22CreditCard%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A2%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22DebitCard%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A20%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3A100%7D%5D%7D%2C%7B%22platform_type%22%3A%22NetBanking%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A1%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22Wallet%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A20%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22PayLater%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A20%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22CardLess%20EMI%22%2C%22payment_mode%22%3A%22Others%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A20%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22DebitCard%22%2C%22payment_mode%22%3A%22Visa%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A1%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3A100%7D%2C%7B%22charge%22%3A10%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3Anull%7D%5D%7D%2C%7B%22platform_type%22%3A%22NetBanking%22%2C%22payment_mode%22%3A%22AU%20Small%20Finance%20Bank%22%2C%22range_charge%22%3A%5B%7B%22charge%22%3A10%2C%22charge_type%22%3A%22FLAT%22%2C%22upto%22%3A20%7D%2C%7B%22charge%22%3A0%2C%22charge_type%22%3A%22PERCENT%22%2C%22upto%22%3Anull%7D%5D%7D%5D&school_name=Some-School",
    "sign": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0X3JlcXVlc3RfaWQiOiI2ODExYzk4OGQxNTU2OTEwNTRmZTc1NmQiLCJjb2xsZWN0X3JlcXVlc3RfdXJsIjoiaHR0cHM6Ly9kZXYtcGF5bWVudHMuZWR2aXJvbi5jb20vZWR2aXJvbi1wZy9yZWRpcmVjdD9zZXNzaW9uX2lkPXNlc3Npb25fbEQyaWJseUx3VjRxaWEtX0c2U0tnZ3JDRUNBeHVXRm9GYXpqOGQtR0ctbEZfLTRDb2ZZY3ZYdzFzbzI0X1FEcnpkUkx4MUxOZXctWXdhY29HUXV6cTNiUDdWaXZ6V3hqdjZWWDE1RWI4WkhKSnN5Rjd2ZzZxb0hIdENKMXpncGF5bWVudHBheW1lbnQmY29sbGVjdF9yZXF1ZXN0X2lkPTY4MTFjOTg4ZDE1NTY5MTA1NGZlNzU2ZCZhbW91bnQ9MS4wMCYmcGxhdGZvcm1fY2hhcmdlcz0lNUIlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyVVBJJTIyJTJDJTIycGF5bWVudF9tb2RlJTIyJTNBJTIyT3RoZXJzJTIyJTJDJTIycmFuZ2VfY2hhcmdlJTIyJTNBJTVCJTdCJTIyY2hhcmdlJTIyJTNBMiUyQyUyMmNoYXJnZV90eXBlJTIyJTNBJTIyRkxBVCUyMiUyQyUyMnVwdG8lMjIlM0FudWxsJTdEJTVEJTdEJTJDJTdCJTIycGxhdGZvcm1fdHlwZSUyMiUzQSUyMkNyZWRpdENhcmQlMjIlMkMlMjJwYXltZW50X21vZGUlMjIlM0ElMjJPdGhlcnMlMjIlMkMlMjJyYW5nZV9jaGFyZ2UlMjIlM0ElNUIlN0IlMjJjaGFyZ2UlMjIlM0EyJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJQRVJDRU5UJTIyJTJDJTIydXB0byUyMiUzQW51bGwlN0QlNUQlN0QlMkMlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyRGViaXRDYXJkJTIyJTJDJTIycGF5bWVudF9tb2RlJTIyJTNBJTIyT3RoZXJzJTIyJTJDJTIycmFuZ2VfY2hhcmdlJTIyJTNBJTVCJTdCJTIyY2hhcmdlJTIyJTNBMjAlMkMlMjJjaGFyZ2VfdHlwZSUyMiUzQSUyMkZMQVQlMjIlMkMlMjJ1cHRvJTIyJTNBMTAwJTdEJTVEJTdEJTJDJTdCJTIycGxhdGZvcm1fdHlwZSUyMiUzQSUyMk5ldEJhbmtpbmclMjIlMkMlMjJwYXltZW50X21vZGUlMjIlM0ElMjJPdGhlcnMlMjIlMkMlMjJyYW5nZV9jaGFyZ2UlMjIlM0ElNUIlN0IlMjJjaGFyZ2UlMjIlM0ExJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJGTEFUJTIyJTJDJTIydXB0byUyMiUzQW51bGwlN0QlNUQlN0QlMkMlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyV2FsbGV0JTIyJTJDJTIycGF5bWVudF9tb2RlJTIyJTNBJTIyT3RoZXJzJTIyJTJDJTIycmFuZ2VfY2hhcmdlJTIyJTNBJTVCJTdCJTIyY2hhcmdlJTIyJTNBMjAlMkMlMjJjaGFyZ2VfdHlwZSUyMiUzQSUyMlBFUkNFTlQlMjIlMkMlMjJ1cHRvJTIyJTNBbnVsbCU3RCU1RCU3RCUyQyU3QiUyMnBsYXRmb3JtX3R5cGUlMjIlM0ElMjJQYXlMYXRlciUyMiUyQyUyMnBheW1lbnRfbW9kZSUyMiUzQSUyMk90aGVycyUyMiUyQyUyMnJhbmdlX2NoYXJnZSUyMiUzQSU1QiU3QiUyMmNoYXJnZSUyMiUzQTIwJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJQRVJDRU5UJTIyJTJDJTIydXB0byUyMiUzQW51bGwlN0QlNUQlN0QlMkMlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyQ2FyZExlc3MlMjBFTUklMjIlMkMlMjJwYXltZW50X21vZGUlMjIlM0ElMjJPdGhlcnMlMjIlMkMlMjJyYW5nZV9jaGFyZ2UlMjIlM0ElNUIlN0IlMjJjaGFyZ2UlMjIlM0EyMCUyQyUyMmNoYXJnZV90eXBlJTIyJTNBJTIyUEVSQ0VOVCUyMiUyQyUyMnVwdG8lMjIlM0FudWxsJTdEJTVEJTdEJTJDJTdCJTIycGxhdGZvcm1fdHlwZSUyMiUzQSUyMkRlYml0Q2FyZCUyMiUyQyUyMnBheW1lbnRfbW9kZSUyMiUzQSUyMlZpc2ElMjIlMkMlMjJyYW5nZV9jaGFyZ2UlMjIlM0ElNUIlN0IlMjJjaGFyZ2UlMjIlM0ExJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJQRVJDRU5UJTIyJTJDJTIydXB0byUyMiUzQTEwMCU3RCUyQyU3QiUyMmNoYXJnZSUyMiUzQTEwJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJGTEFUJTIyJTJDJTIydXB0byUyMiUzQW51bGwlN0QlNUQlN0QlMkMlN0IlMjJwbGF0Zm9ybV90eXBlJTIyJTNBJTIyTmV0QmFua2luZyUyMiUyQyUyMnBheW1lbnRfbW9kZSUyMiUzQSUyMkFVJTIwU21hbGwlMjBGaW5hbmNlJTIwQmFuayUyMiUyQyUyMnJhbmdlX2NoYXJnZSUyMiUzQSU1QiU3QiUyMmNoYXJnZSUyMiUzQTEwJTJDJTIyY2hhcmdlX3R5cGUlMjIlM0ElMjJGTEFUJTIyJTJDJTIydXB0byUyMiUzQTIwJTdEJTJDJTdCJTIyY2hhcmdlJTIyJTNBMCUyQyUyMmNoYXJnZV90eXBlJTIyJTNBJTIyUEVSQ0VOVCUyMiUyQyUyMnVwdG8lMjIlM0FudWxsJTdEJTVEJTdEJTVEJnNjaG9vbF9uYW1lPVNvbWUtU2Nob29sIiwiY3VzdG9tX29yZGVyX2lkIjpudWxsLCJleHAiOjE3NDYwMDMzNjh9.fTG6BoDMX-wdvZK373QQvQ_8aB3JEYJ4VYc8LNTdAHg"
}
```

**Fields:**
- **`collect_request_id`**: (string) Unique identifier for the payment request.
- **`collect_request_url`**: (string) The URL for the payment request.
- **`sign`**: (string) The signed payload used for authentication during the payment process.

#### **Error Response**

```json
{
  "status": "error",
  "message": "Failed to create payment: [Error Details]"
}
```

**Fields:**
- **`status`**: (string) The status of the request (error).
- **`message`**: (string) A descriptive message of the error encountered.

---

## **2. Authentication**

### **JWT Authentication**
The API uses **JWT (JSON Web Tokens)** for authentication. Each request that requires authentication should include the **JWT token** in the `Authorization` header in the following format:

```plaintext
Authorization: Bearer <JWT_TOKEN>
```

---

## **3. Error Handling**

All errors will return a consistent structure in the response body, as shown below:

```json
{
  "status": "error",
  "message": "Failed to create payment: [Error Details]"
}
```

The error message will contain specific details about the failure, such as missing parameters or network issues.

### Common Error Codes
- **400 Bad Request**: Missing or invalid data in the request body.
- **401 Unauthorized**: Missing or invalid JWT token.
- **500 Internal Server Error**: Something went wrong on the server side.

---

## **4. Environment Variables**

The following environment variables are required to run the payment module:

- **`PG_SECRET_KEY`**: The secret key used to sign the payload for the payment request.
- **`PG_API_KEY`**: The API key used for authenticating requests with the payment gateway.

Make sure these environment variables are securely configured.

---

## **5. Payment Flow**

1. **User sends a `POST` request** to `/payment/create` with the required fields in the request body (school ID, amount, and callback URL).
2. **Service constructs the payload** and signs it using the `PG_SECRET_KEY`.
3. **The signed payload** is sent to the third-party payment gateway using the Create Collect Request API.
4. **The gateway responds** with a `collect_request_id`, `collect_request_url`, and `sign` that are returned to the client.
5. **Error handling** is implemented in case the payment request fails due to invalid parameters, network issues, or internal server errors.

---


## **6. Payment Gateway URL**
The **`collect_request_url`** is a URL generated by the payment gateway where the user can complete the payment process. This URL can be accessed by the user to initiate the actual payment.


