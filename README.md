# Personal Finance Tracking System

This platform allows users to track their income and expenses, create financial goals, and view analytics about their spending. Users can group expenses by categories, visualize statistics through charts, and monitor the progress of their financial goals.

The project is built using a microservice architecture, where services communicate through a message broker to enable asynchronous financial data processing and automatic goal updates.

## Technology Stack
![Image](https://github.com/user-attachments/assets/65d91234-75b3-434e-924e-5e76fa352dbd)

## Project Architecture

<ul>
  <li>
    <strong>User Service:</strong> Manages user registration, authentication, and user data storage.
  </li>
  <li>
    <strong>Transaction Service:</strong> Handles user income and expense tracking.
  </li>
  <li>
    <strong>Goal Service:</strong> Manages financial goals and tracks their progress.
  </li>
</ul>

![Image](https://github.com/user-attachments/assets/be9539a9-906b-4689-a842-64b229e6b70f)


## REST API Endpoints
<details> <summary>User Service</summary> <p><code>POST /users/register</code> – Register a new user</p> <p><code>POST /users/login</code> – User login</p> </details> <details> <summary>Transaction Service</summary> <p><code>POST /transactions</code> – Create a new transaction</p> <p><code>GET /transactions/:userId</code> – Get user transactions</p> <p><code>GET /transactions/:userId/summary</code> – Get income and expense summary</p> </details> <details> <summary>Goal Service</summary> <p><code>POST /goals</code> – Create a new financial goal</p> <p><code>GET /goals/:userId</code> – Get user goals</p> <p><code>PUT /goals/:id</code> – Update goal information</p> </details>

## User Interface
![Image](https://github.com/user-attachments/assets/b12558e7-a7f2-48a6-b157-b2fee6e7ed60)

## User Service Testing Examples
<p>While testing the core functionality of the <code>UserService</code> module, the <strong>AAA principle</strong> (Arrange – Act – Assert) was followed. Additionally, the tests were designed according to the <strong>“one reason to fail”</strong> principle — each individual test verifies only one behavioral condition, which makes it easier to pinpoint and fix errors when they occur.</p>

### Unit Testing

```ts
it('should return access and refresh tokens', async () => {
  const actual = await service.createUser(dto);

  expect(authService.generateTokens).toHaveBeenCalledWith({
    member_id: createdUser.id,
    role: createdUser.role,
  });

  expect(actual).toEqual({
    accessToken: UserServiceBuilder.MOCK_ACCESS_TOKEN,
    refreshToken: UserServiceBuilder.MOCK_REFRESH_TOKEN,
  });
});
```
<blockquote>
  Passing Unit Tests Output
</blockquote>

![Image](https://github.com/user-attachments/assets/e5da5b91-5ea6-4b9c-b6a5-9da6574c66d6)

### Integration Testing 

```ts
it('should verify a valid access token', async () => {
        const { accessToken } = await authService.generateTokens(payload);
        const verifiedPayload = await authService.verifyAccessToken(accessToken);

        expect(verifiedPayload).toMatchObject({
            member_id: payload.member_id,
            role: payload.role,
        });
    });
```
<blockquote>
  Passing Integration Tests Output
</blockquote>

![Image](https://github.com/user-attachments/assets/c8e795f7-2dec-4d73-bc92-4305bc4f46cd)

### Contract Testing 

```ts
describe('POST /users/register', () => {
        it('should register a new user and return tokens', async () => {
            const response = await postRequest(endpointRegister, {
                username: testUsername,
                email: testEmail,
                password: testPassword,
            })

            expect(response.status).toBe(expectedStatusCreated);
            expect(response.body).toEqual(expect.objectContaining(expectedTokens));

        });
    });
```
<blockquote>
  Passing Contract Tests Output
</blockquote>

![Image](https://github.com/user-attachments/assets/612994e6-ebcc-414e-8fa7-8aa680b90a62)

