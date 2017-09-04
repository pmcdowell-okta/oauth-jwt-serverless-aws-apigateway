'use strict';

const request = require('request');
const jws = require('jws');
const jwk2pem = require('pem-jwk').jwk2pem;

const handlers = module.exports = {};

module.exports.jwtverify = (event, context, callback) =>
{

    console.log("starting")

    if (!event.authorizationToken) {
        console.log("Header does not exist not exist")
       badToken(callback)
        return;

    }

    var token = event.authorizationToken; //This token is passed in header of request

    token = token.replace(/^Bearer /, '');
    token = token.replace(/^bearer /, ''); // Just incase someoen forgets to capatalize

    const decoded = jws.decode(token);

    if (!decoded) {
        console.log("Bad Token")
       badToken(callback)
        return;
    } else {

        const claims = safelyParseJSON(decoded.payload);

        if (!claims.iss ) {
            // console.log("no claims found")

        } else {

            /*
            This code pulls the keys at runtime, which is not optimal.
            Ideally, the keys should be pinned or cached for better Much performance

            Also, the code will permit any Okta Token, in production this should not be used, but
            it works fine for test.

             */
            if ((claims.iss.split("\/").length == 5)) {
                console.log("API Access Mgmt token")
                var keyUrl = claims.iss + "/v1/keys"

            } else {
                console.log("OIDC endpoint")
                var keyUrl = claims.iss + "/oauth2/v1/keys"
            }

            var options = {
                event: event,
                method: 'GET',
                url: keyUrl,
                headers:
                    {
                        'cache-control': 'no-cache'
                    }
            };

            request(options, function (error, response, body ) {


              //  console.log(options.event.authorizationToken)

                if (error) throw new Error(error);

                var keys = JSON.parse(body)
                var keygood = 0

                var i = 0 // keys.keys.length-1

                while (i < keys.keys.length) {
                    var key = keys.keys[i]
                    var pem = jwk2pem(key);
                    /*This is where the signature magic happens*/
                    if (jws.verify(token, key.alg, pem)) {
                        keygood = 1
                    }
                    i++
                }

                // Verify that the nonce matches the nonce generated on the client side (I am ignoring nonce for simplicity)
                // if (nonce !== claims.nonce) {
                //     res.status(401).send(`claims.nonce "${claims.nonce}" does not match cookie nonce ${nonce}`);
                //     return;
                // }
                //
                // Verify that the issuer is Okta, and specifically the endpoint that we
                // performed authorization against.
                // if (config.oidc.issuer !== claims.iss) {
                //     res.status(401).send(`id_token issuer ${claims.iss} does not match our issuer ${config.oidc.issuer}`);
                //     return;
                // }
                //
                // Verify that the id_token was minted specifically for our clientId
                // if (config.oidc.clientId !== claims.aud) {
                //     res.status(401).send(`id_token aud ${claims.aud} does not match our clientId ${config.oidc.clientId}`);
                //     return;
                // }
                //
                // Verify the token has not expired. It is also important to account for
                // clock skew in the event this server or the Okta authorization server has
                // drifted.

                const now = Math.floor(new Date().getTime() / 1000);
                const maxClockSkew = 300; // 5 minutes
                if (now - maxClockSkew > claims.exp) {
                        keygood = 0;
                    console.log("Token is more than 5 minutes old !, too slow")
                }
                //
                // // Verify that the token was not issued in the future (accounting for clock
                // // skew).
                if (claims.iat > (now + maxClockSkew)) {
                    console.log("Back to the Future, not supported")
                    keygood = 0;
                }

                if (keygood == 1) { // Token is good, generate aws policy
                    goodToken(options.event.methodArn, callback)

                } else {
                    badToken(callback)
                    return;

                }
            });
        }
    }
};

function badToken ( cb ){
    cb('No Token');
}

function goodToken(arn, cb) {
    cb(null, {
        principalId: "patrickmcdowell",
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: "Allow",
                Resource: arn
            }]
        }
    });
}



function safelyParseJSON (json) {
    var parsed

    try {
        parsed = JSON.parse(json)
    } catch (e) {
        // Oh well, but whatever...
    }
    return parsed // Could be undefined!
}



//Uncomment this if you want to test the Lambda locally

/*

var event = {authorizationToken: "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IktVWmNjaVlnRm9hYXJKdUFyNXpMOUtCZ19WaC1IZ0FleDFCaE1LQ3VoSVkifQ.eyJ2ZXIiOjEsImp0aSI6IkFULllGaFZhaVB2OHREWFRIQTRacWJaaHRmRzRUa1ZxcVdPOWcxaS1PUEVBbFUiLCJpc3MiOiJodHRwczovL29rdGFqd3Qub2t0YS5jb20vb2F1dGgyL2F1czIxOHZxbjlodzJnOGNpMXQ3IiwiYXVkIjoiaHR0cHM6Ly9va3Rhand0LmlvIiwiaWF0IjoxNTA0Mzk4MTQ2LCJleHAiOjE1MDQ0MDE3NDYsImNpZCI6IjN4RDVDbVBYOTNmYlpwUHhuUzVhIiwidWlkIjoiMDB1MjFuMDV5M0VKWEhyMTgxdDciLCJzY3AiOlsib3BlbmlkIiwicHJvZmlsZSJdLCJzdWIiOiJ0ZXN0dXNlckB3b3cuY29tIiwiZ3JvdXBzIjpbIkV2ZXJ5b25lIl19.aDRXxe4kI8ZZ21KaJbcTYczXPJ3yiz5F2qsKzBdZN07bHAOzMWg-Nkd0Pawelc1cP29nSdINcxSv6mNwf3nVk2nlGUAnkDT7LuwCCa9nASyjmNt7ernPtltpGdt2CEqbbIB5cEAmdDOELl-mrmFCVCnKBoBX5PZgG4n_XvWjNHNixtUa_F9_l4AW9guu_8urTrqjKK9L_-Z4ShQLQTf7DDDEVs6qD4GPRM_19H-flRXIo8ni10MZFOGLGuhgEOYrtNTyWqXiC1oAvdjOR4As--Ydn14sABnoGHOe4H0uHJ_8tCaCJf-jj7tBdhSdo_sxARHR_2AtA2VrYrCznXzKsA"};

module.exports.jwtverify ( event, {}, function( code, result) {
    console.log(result)

})

*/


