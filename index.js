const fetch = require("node-fetch");

/**
 *
 * @param event bypass the event object from the handler method
 * @param context bypass the event object from the handler method
 * @param data custom data which can used from cloud formation template with GetAtt
 * @param physicalResourceId created resource id. Default: logStreamName given from the context
 * @returns {Promise<*>}
 */
async function sendSuccess(event, context, {data = {}, physicalResourceId = context.logStreamName} = {}) {

    if (!event || !context) {
        throw `missing mandatory parameter`
    }

    if (typeof data !== 'object' || Array.isArray(data)) {
        console.log('data object was not an object');
        return sendFail(event, context);
    }

    let payload = JSON.stringify({
        Status: 'SUCCESS',
        Reason: `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
        PhysicalResourceId: physicalResourceId,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        NoEcho: false,
        Data: data
    });

    return fetch(event.ResponseURL, {
        method: 'PUT',
        headers: {
            'content-type': '',
            'content-length': payload.length
        },
        body: payload
    }).then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.warn(error));
}

/**
 * @param event bypass the event object from the handler method
 * @param context bypass the event object from the handler method
 * @param customReason Give a reason why cloudformation failed
 * @returns {Promise<void>}
 */
async function sendFail(event, context, customReason = `See the details in CloudWatch Log Stream: ${context.logStreamName}`) {

    if (!event || !context) {
        throw `missing mandatory parameter`
    }

    let payload = JSON.stringify({
        Status: 'FAILED',
        Reason: customReason,
        PhysicalResourceId: context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        NoEcho: false,
    });

    return fetch(event.ResponseURL, {
        method: 'PUT',
        headers: {
            'content-type': '',
            'content-length': payload.length
        },
        body: payload
    }).then(response => response.text())
        .then(data => console.log(data))
        .catch(error => console.warn(error));
}

module.exports = {
    sendSuccess: sendSuccess,
    sendFail: sendFail
};