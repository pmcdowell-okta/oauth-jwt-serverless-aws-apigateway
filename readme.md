![Okta](./images/logo.png)

# Serverless based Amazon API Gateway Authorizer

This project is a very generic and simple example of how to write
an Amazon API Gateway Authorizer that can accept Token minted 
by Okta.

*This code is not intended for production, although with some hardening
this approach can be used in production, this example is designed
for educational purposes*

This project is loosely based on work done by Karl McGuiness
which can be found here: https://github.com/mcguinness/node-lambda-oauth2-jwt-authorizer

### The goals of this project are to:

* Get people familair with the **Serverless Framework** and **Amazon API Gateway**
* A Simple example of an Authorizer Lambda function
* Easy to deploy (Works on any **Okta** Instance **by Design**)
* Accepts **OIDC** or **Oauth Tokens**

### What is the Serverless Framework ?

Basically, the Serverless Framework makes it easy to deploy services to 
many cloud services. Amazon, Azure, Google Cloud, and OpenSwift are all
supported. Here is a great overview of Serverless Framework: https://www.youtube.com/watch?v=71cd5XerKss

The Serverless Framework lets you define services run on a IAAS Platform, 
and deploy them using a simple YAML file called **serverless.yml**

The serverless.yml defines which cloud service is being used, and pushes
the code to that service, which saves tons of work for us.

### What is this doing ?

1. Creates an API Gateway
2. Defines a Authorizer which looks for a token in the header of a request, and verifies that signature *(A Lambda as well)*
3. Defines a backend service (A Lambda function in this case)

### How to deploy

Use the command **sls deploy** to deploy this project to Amazon

```

sls deploy

Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (1.23 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..........................
Serverless: Stack update finished...
Service Information
service: authorizerTest2
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  GET - https://fakeurlonamazon.execute-api.us-east-1.amazonaws.com/dev/testy
```

#### How to test

You will need an Okta OIDC or Oauth Token, you can get a token from [OktaProxy.com](https://oktaproxy.com) or [Oktajwt.io](https://oktajwt.io) . 
Or, you can get your own Okta Instance and generate your own Token

You can test this with curl of postman, below is an example of a curl request

```aidl
curl -X GET \
  https://youramazonurl.execute-api.us-east-1.amazonaws.com/dev/testy \
  -H 'authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IktVWmNjaVlnRm9hYXJKdUFyNXpMOUtCZ19WaC1IZ0FleDFCaE1LQ3VoSVkifQ.eyJzdWIiOiIwMHUyMW4wNXkzRUpYSHIxODF0NyIsIm5hbWUiOiJVc2UgUHJldmlld19PcmdzIiwidmVyIjoxLCJpc3MiOiJodHRwczovL29rdGFqd3Qub2t0YS5jb20vb2F1dGgyL2F1czIxOHZxbjlodzJnOGNpMXQ3IiwiYXVkIjoiM3hENUNtUFg5M2ZiWnBQeG5TNWEiLCJpYXQiOjE1MDMzNzM0OTIsImV4cCI6MTUwMzM3NzA5MiwianRpIjoiSUQuTmtaenRPZmlCOWgwMloxQXpvd0QtS3JCZzlER3FRRGhPS09jTy1NeU1yayIsImFtciI6WyJwd2QiXSwiaWRwIjoiMDBvMjE3bXNvcFRXR1A1MjkxdDciLCJub25jZSI6Im4tMFM2X1d6QTJNaiIsInByZWZlcnJlZF91c2VybmFtZSI6InRlc3R1c2VyQHdvdy5jb20iLCJhdXRoX3RpbWUiOjE1MDMzNzM0OTEsImF0X2hhc2giOiJTNlFsZF9zN3VzQ1ZMcTBfRHlKNHhRIiwiY19oYXNoIjoiMEstTDFfMGZzVktPazYtSkdPNkoyZyJ9.EbzTu97AwoZE_iVDN7WGQmBetPS1L-xvx7BQCGGQDnu-yqGMMtkXp18ikdnievmIMnHxFlugiyzdK7hpZcpCUKwBoMRNLKaw_EsR7MApQ2qtPrRLfoRBOrkPoVyNkViyzoI-GSKsOARYjAWzNVsRVaLBfzPVfEWD6wDoEKMpxok2s-02S2gZ-LVVr1c--5JMwlI8zB71Puh0_TPaAsXQbofZfwyjTk5nFEV69WPbwOwi5DLiWD54e22Brjs4Djus1zfk4AzA1FGY506VysUAtZfTWRkxbkxE4PkuXGB9x0OneqXbPWhZUxTNo51sYsoW25NwfI9czb6fipNP_lEE9w' \
  -H 'cache-control: no-cache' 
```

#### How to put this into production ?

Uncomment Lines 90-111 to Check:
* Issuer
* ClientID
* Nonce

Also, pin or cache the keys to so the Authorizer does not have to get the keys from Okta on every request.


