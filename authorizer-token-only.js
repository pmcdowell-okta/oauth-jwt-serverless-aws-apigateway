'use strict';

//This code just checks for a Token, if there is a token it will run, no validation is being preformed

module.exports.auth = (event, context, cb) =>
{
    if (!event.authorizationToken) {
        cb('No Token');


    } else {
        cb(null, {
            principalId: "patrick",
            policyDocument: {
                Version: '2012-10-17',
                Statement: [{
                    Action: 'execute-api:Invoke',
                    Effect: "Allow",
                    Resource: event.methodArn
                }]
            }
        });
    }
}




