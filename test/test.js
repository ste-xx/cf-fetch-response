const expect = require('chai').expect;
const spy = require('sinon').spy;
const fake = require('sinon').fake;

const proxyquire = require('proxyquire').noCallThru();

const fs = require('fs');
const cfEvent = JSON.parse(fs.readFileSync('test/cfEventData.json', 'utf8'));
const cfContext = JSON.parse(fs.readFileSync('test/cfContextData.json', 'utf8'));

describe('cf-fetch-response', () => {


    it('send success', async () => {

        const nodeFetchFake = fake.resolves({text: () => 'response request succeeded'});

        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });

        await underTest.sendSuccess(cfEvent, cfContext);

        let [url, param] = nodeFetchFake.firstCall.args;
        expect(url).to.equal('https://cloudformation-custom-resource-response-euwest1.s3-eu-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aeu-west-1%3A099687127161%3Astack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2%7Cs2tTrackAllS3%7C77afbba7-4cde-4e70-98c1-63abb75fc370?AWSAccessKeyId=AKIAJ7MCS7PVEUOADEEA&Expires=1528250314&Signature=bMQzzx3tW8rp9Nomr5mvl3ukSrI%3D');
        expect(param).to.include.all.keys('method', 'headers', 'body');

        expect(param.method).to.equal('PUT');

        expect(param.headers).include.all.keys('content-type', 'content-length');
        expect(param.headers['content-type']).to.be.empty;
        expect(param.headers['content-length']).to.be.above(0);

        let paramBody = JSON.parse(param.body);


        expect(paramBody).to.include({
            Status: 'SUCCESS',
            Reason: 'See the details in CloudWatch Log Stream: 2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            PhysicalResourceId: '2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            StackId: 'arn:aws:cloudformation:eu-west-1:099687127161:stack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2',
            RequestId: '77afbba7-4cde-4e70-98c1-63abb75fc370',
            LogicalResourceId: 's2tTrackAllS3'
        });

        expect(paramBody).include.all.keys('Data');
        expect(paramBody.Data).to.be.empty
    });

    it('wasCfResponseForwarded returns true after success was called', async () => {

        const nodeFetchFake = fake.resolves({text: () => 'response request succeeded'});

        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });

        expect(underTest.wasCfResponseForwarded()).to.be.false;
        await underTest.sendSuccess(cfEvent, cfContext);
        expect(underTest.wasCfResponseForwarded()).to.be.true;
    });

    it('send success with custom data', async () => {

        const nodeFetchFake = fake.resolves({text: () => 'response request succeeded'});
        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });

        let someData = {
            PublishToCF: 'someValue'
        };

        await underTest.sendSuccess(cfEvent, cfContext, {
            data: someData
        });

        let [url, param] = nodeFetchFake.firstCall.args;
        expect(url).to.equal('https://cloudformation-custom-resource-response-euwest1.s3-eu-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aeu-west-1%3A099687127161%3Astack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2%7Cs2tTrackAllS3%7C77afbba7-4cde-4e70-98c1-63abb75fc370?AWSAccessKeyId=AKIAJ7MCS7PVEUOADEEA&Expires=1528250314&Signature=bMQzzx3tW8rp9Nomr5mvl3ukSrI%3D');

        let paramBody = JSON.parse(param.body);

        expect(paramBody).to.include({
            Status: 'SUCCESS',
            Reason: 'See the details in CloudWatch Log Stream: 2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            PhysicalResourceId: '2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            StackId: 'arn:aws:cloudformation:eu-west-1:099687127161:stack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2',
            RequestId: '77afbba7-4cde-4e70-98c1-63abb75fc370',
            LogicalResourceId: 's2tTrackAllS3'
        });

        expect(paramBody).include.all.keys('Data');
        expect(paramBody.Data).to.deep.equal(someData);

    });

    it('send success with custom physical id', async () => {

        const nodeFetchFake = fake.resolves({text: () => 'response request succeeded'});
        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });

        await underTest.sendSuccess(cfEvent, cfContext,{
            physicalResourceId: 'anotherPhysicalResourceId'
        });

        let [url, param] = nodeFetchFake.firstCall.args;
        expect(url).to.equal('https://cloudformation-custom-resource-response-euwest1.s3-eu-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aeu-west-1%3A099687127161%3Astack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2%7Cs2tTrackAllS3%7C77afbba7-4cde-4e70-98c1-63abb75fc370?AWSAccessKeyId=AKIAJ7MCS7PVEUOADEEA&Expires=1528250314&Signature=bMQzzx3tW8rp9Nomr5mvl3ukSrI%3D');

        let paramBody = JSON.parse(param.body);
        console.log(paramBody);
        expect(paramBody).to.include({
            Status: 'SUCCESS',
            Reason: 'See the details in CloudWatch Log Stream: 2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            StackId: 'arn:aws:cloudformation:eu-west-1:099687127161:stack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2',
            RequestId: '77afbba7-4cde-4e70-98c1-63abb75fc370',
            LogicalResourceId: 's2tTrackAllS3'
        });

        expect(paramBody).include.all.keys('Data', 'PhysicalResourceId');
        expect(paramBody.Data).to.be.empty;
        expect(paramBody.PhysicalResourceId).to.equal('anotherPhysicalResourceId');

    });


    it('send success but failed because data is an array instead an object', async () => {
        const nodeFetchFake = fake.resolves({
            text: () => 'response request succeeded'
        });

        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });

        await underTest.sendSuccess(cfEvent, cfContext,{
            data: ['only','objects','are','allowed','here']
        });

        let [url, param] = nodeFetchFake.firstCall.args;
        expect(url).to.equal('https://cloudformation-custom-resource-response-euwest1.s3-eu-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aeu-west-1%3A099687127161%3Astack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2%7Cs2tTrackAllS3%7C77afbba7-4cde-4e70-98c1-63abb75fc370?AWSAccessKeyId=AKIAJ7MCS7PVEUOADEEA&Expires=1528250314&Signature=bMQzzx3tW8rp9Nomr5mvl3ukSrI%3D');
        expect(param).to.include.all.keys('method', 'headers', 'body');

        expect(param.method).to.equal('PUT');

        expect(param.headers).include.all.keys('content-type', 'content-length');
        expect(param.headers['content-type']).to.be.empty;
        expect(param.headers['content-length']).to.be.above(0);

        let paramBody = JSON.parse(param.body);


        expect(paramBody).to.include({
            Status: 'FAILED',
            Reason: 'See the details in CloudWatch Log Stream: 2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            PhysicalResourceId: '2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            StackId: 'arn:aws:cloudformation:eu-west-1:099687127161:stack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2',
            RequestId: '77afbba7-4cde-4e70-98c1-63abb75fc370',
            LogicalResourceId: 's2tTrackAllS3'
        });
    });

    it('send success but failed because data is an function instead an object', async () => {
        const nodeFetchFake = fake.resolves({
            text: () => 'response request succeeded'
        });

        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });

        await underTest.sendSuccess(cfEvent, cfContext,{
            data: ()=>"only objects are allowed here"
        });

        let [url, param] = nodeFetchFake.firstCall.args;
        expect(url).to.equal('https://cloudformation-custom-resource-response-euwest1.s3-eu-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aeu-west-1%3A099687127161%3Astack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2%7Cs2tTrackAllS3%7C77afbba7-4cde-4e70-98c1-63abb75fc370?AWSAccessKeyId=AKIAJ7MCS7PVEUOADEEA&Expires=1528250314&Signature=bMQzzx3tW8rp9Nomr5mvl3ukSrI%3D');
        expect(param).to.include.all.keys('method', 'headers', 'body');

        expect(param.method).to.equal('PUT');

        expect(param.headers).include.all.keys('content-type', 'content-length');
        expect(param.headers['content-type']).to.be.empty;
        expect(param.headers['content-length']).to.be.above(0);

        let paramBody = JSON.parse(param.body);


        expect(paramBody).to.include({
            Status: 'FAILED',
            Reason: 'See the details in CloudWatch Log Stream: 2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            PhysicalResourceId: '2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            StackId: 'arn:aws:cloudformation:eu-west-1:099687127161:stack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2',
            RequestId: '77afbba7-4cde-4e70-98c1-63abb75fc370',
            LogicalResourceId: 's2tTrackAllS3'
        });
    });

    it('send success response but call request failed', async () => {

        const nodeFetchFake = fake.rejects('could not send cf response');

        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });
        await underTest.sendSuccess(cfEvent, cfContext);
    });

    it('send fail', async () => {
        const nodeFetchFake = fake.resolves({text: () => 'response request succeeded'});

        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });

        await underTest.sendFail(cfEvent, cfContext);

        let [url, param] = nodeFetchFake.firstCall.args;
        expect(url).to.equal('https://cloudformation-custom-resource-response-euwest1.s3-eu-west-1.amazonaws.com/arn%3Aaws%3Acloudformation%3Aeu-west-1%3A099687127161%3Astack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2%7Cs2tTrackAllS3%7C77afbba7-4cde-4e70-98c1-63abb75fc370?AWSAccessKeyId=AKIAJ7MCS7PVEUOADEEA&Expires=1528250314&Signature=bMQzzx3tW8rp9Nomr5mvl3ukSrI%3D');
        expect(param).to.include.all.keys('method', 'headers', 'body');

        expect(param.method).to.equal('PUT');

        expect(param.headers).include.all.keys('content-type', 'content-length');
        expect(param.headers['content-type']).to.be.empty;
        expect(param.headers['content-length']).to.be.above(0);

        let paramBody = JSON.parse(param.body);


        expect(paramBody).to.include({
            Status: 'FAILED',
            Reason: 'See the details in CloudWatch Log Stream: 2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            PhysicalResourceId: '2018/06/05/[$LATEST]dff247ec8b6f4fa090c2dd59d909360d',
            StackId: 'arn:aws:cloudformation:eu-west-1:099687127161:stack/s2t-base/3d992e90-691c-11e8-96cc-50faeb5cc8d2',
            RequestId: '77afbba7-4cde-4e70-98c1-63abb75fc370',
            LogicalResourceId: 's2tTrackAllS3'
        });
    });

    it('wasCfResponseForwarded returns true after fail was called', async () => {

        const nodeFetchFake = fake.resolves({text: () => 'response request succeeded'});

        let underTest = proxyquire('../index.js', {
            'node-fetch': nodeFetchFake
        });

        expect(underTest.wasCfResponseForwarded()).to.be.false;
        await underTest.sendFail(cfEvent, cfContext);
        expect(underTest.wasCfResponseForwarded()).to.be.true;
    });
});