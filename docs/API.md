# Monori API
> :ghost: **Welcome to the API documentation of Monori, this is a document that the self-hosted version of Monori has linked you to. This shows all of the API routes and teaches some tricks that Monori uses.**

## Ratelimits
> Limit: **1,000 requests per minute**
>
> Reset Time: 1 minute

Monori handles ratelimits like any ordinary API, with 4 headers intacted to show the status before getting ratelimited.

|Header|Value|
|---|---|
|`X-Ratelimit-Retry-After`|The time that it'll reset|
|`X-Ratelimit-Remaining`|The value of requests you can do|
|`X-Ratelimit-Limit`|The limit before getting ratelimited (1,000)|
|`X-Ratelimit-Reset`|The time before it resets|
|`X-Ratelimit-Date`|Current date, can skip|

## Routes
### GET /
> Returns miscellaneous information

#### Schema
> Successful (200):

```js
{
  "statusCode": number,
  "message": string,
  "version": string
}
```

### GET /organisations
> Return a list of all the *public* organisations

#### Schema
> Successful (200):

```js
{
  "statusCode": number,
  "data": Array<Organisation>
}
```


### GET /organisations/:id
> Returns the organisation data

#### Schema
> Forbidden (400):

```js
{
  "statusCode": number,
  "message": string
}
```

> Successful (200):

```js
{
  "statusCode": number,
  "data": Organisation
}
```

### GET /organisations/:id/projects
> Returns a list of all the projects that were created by that organisation

#### Schema
> Successful (200):

```js
{
  "statusCode": number,
  "data": Array<Project>
}
```

### GET /organisations/:id/projects/:projectID
> Returns the specific organisation's project details

#### Schema
> Forbidden (403) or Not Found (404):

```js
{
  "statusCode": number,
  "message": string
}
```

> Successful (200):

```js
{
  "statusCode": number,
  "data": Project
}
```

### PUT /organisations
> Create a new organisation with the owner as the authorized user

#### Schema
> Unauthorized (401):

```js
{
  "statusCode": number,
  "message": string
}
```

> Successful (201):

```js
{
  "statusCode": number,
  "data": {
    "id": string
  }
}
```