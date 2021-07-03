'use strict';

const PullRequestDecoratorReporter = require('../lib/pullrequest-decorator-reporter'),
  sinon = require("sinon"),
  chai = require('chai'),
  { assert, expect } = chai,
  sinonChai = require("sinon-chai"),
  utils = require('../lib/utils');

chai.use(sinonChai);


describe("PullRequestDecoratorReporter in report mode", function () {

  const reporterOptions = { export: 'anyPath' }
  const newmanOptions = {
    collection: {
      name: "ANY_COLLECTION"
    }
  }

  let newmanEmitter = {
    on: sinon.spy()
  };


  it("Given valid reporter options when instantiating PullRequestDecoratorReporter then it's context is correctly initialized", function () {
    // GIVEN valid reporter options 
    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);

    // THEN
    expect(newmanEmitter.on).to.have.callCount(6);
    expect(newmanEmitter.on).to.have.been.calledWith("start");
    expect(newmanEmitter.on).to.have.been.calledWith("beforeItem");
    expect(newmanEmitter.on).to.have.been.calledWith("request");
    expect(newmanEmitter.on).to.have.been.calledWith("assertion");
    expect(newmanEmitter.on).to.have.been.calledWith("beforeDone");
    expect(newmanEmitter.on).to.have.been.calledWith("done");

    expect(pullRequestDecoratorReporter.newmanEmitter).to.not.be.null;

    assert.equal(pullRequestDecoratorReporter.options.export, "anyPath", "export should equal `anyPath`");
    assert.equal(pullRequestDecoratorReporter.options.collectionName, "ANY_COLLECTION", "export should equal `ANY_COLLECTION`");

    expect(pullRequestDecoratorReporter.context.currentItem).to.not.be.null;
    expect(pullRequestDecoratorReporter.context.assertions.failed_count).to.equal(0);
    expect(pullRequestDecoratorReporter.context.assertions.skipped_count).to.equal(0);
    expect(pullRequestDecoratorReporter.context.currentItem.failed).to.be.empty;
    expect(pullRequestDecoratorReporter.context.currentItem.skipped).to.be.empty;
    expect(pullRequestDecoratorReporter.context.list).to.be.empty;

  });

  it("Given an initialized reporter when calling *start* event method then context is not changed", function () {

    // GIVEN

    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);

    const reportWithoutStart = Object.assign({}, pullRequestDecoratorReporter);

    pullRequestDecoratorReporter.start();

    // THEN
    expect(pullRequestDecoratorReporter).to.deep.equal(reportWithoutStart);
  });

  it("Given an initialized reporter when calling *beforeItem* event method then context is not changed", function () {

    // GIVEN

    const args = {
      "item": {
        "id": "a01cc61f-d9ed-4c3e-8d55-740adcb24e04",
        "name": "As a Sport User, i can see sport details",
      }
    }

    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);

    const reportWithoutBeforeItem = Object.assign({}, pullRequestDecoratorReporter);

    pullRequestDecoratorReporter.beforeItem(null, args);

    // THEN
    expect(pullRequestDecoratorReporter).to.deep.equal(reportWithoutBeforeItem);
  });


  it("Given a successful request when calling *request* event method then context is correctly filled with request information", function () {

    // GIVEN

    const args = {
      "response": {
        "id": "1d17e352-a289-4a90-bf3e-429e1276c479",
        "status": "OK",
        "code": 200,
        "stream": {
          "type": "Buffer",
          "data": ["someResponse"],
          "responseTime": 66,
          "responseSize": 189
        }
      },
      "request": {
        "url": {
          "protocol": "https",
          "path": ["api/v1/sports/12"],
          "host": ["localhost"],
          "query": [],
          "variable": []
        },
        "method": "GET"
      },
      "item": {
        "id": "a01cc61f-d9ed-4c3e-8d55-740adcb24e04",
        "name": "As a Sport User, i can see sport details",
      }
    }

    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    pullRequestDecoratorReporter.request(null, args);

    // THEN
    expect(pullRequestDecoratorReporter.context.currentItem.id).to.equal("a01cc61f-d9ed-4c3e-8d55-740adcb24e04");
    expect(pullRequestDecoratorReporter.context.currentItem.request_name).to.equal("As a Sport User, i can see sport details");
    expect(pullRequestDecoratorReporter.context.currentItem.url).to.not.be.null;
    expect(pullRequestDecoratorReporter.context.currentItem.method).to.equal("GET");
    expect(pullRequestDecoratorReporter.context.currentItem.status).to.equal("OK");
    expect(pullRequestDecoratorReporter.context.currentItem.body).to.not.be.null;
    expect(pullRequestDecoratorReporter.context.currentItem.code).to.equal(200);
    expect(pullRequestDecoratorReporter.context.currentItem.test_status).to.equal("PASS");
    expect(pullRequestDecoratorReporter.context.list).to.have.lengthOf(1);

  });

  it("Given an unexpected error on request when calling *request* event method then context is correctly filled with request information", function () {

    // GIVEN an unexpected error

    const error = {
      "code": "TECHNICAL_ERROR"
    }

    const args = {
      "response": {
        "id": "1d17e352-a289-4a90-bf3e-429e1276c479",
      },
      "request": {
        "url": {
          "protocol": "https",
          "path": ["api/v1/sports/12"],
          "host": ["localhost"],
          "query": [],
          "variable": []
        },
        "method": "POST"
      },
      "item": {
        "id": "a01cc61f-d9ed-4c3e-8d55-740adcb24e04",
        "name": "As a Sport User, i can see sport details",
      }
    }

    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    pullRequestDecoratorReporter.request(error, args);

    // THEN
    expect(pullRequestDecoratorReporter.context.currentItem.body).to.equal("TECHNICAL_ERROR");
    expect(pullRequestDecoratorReporter.context.currentItem.test_status).to.equal("FAIL");
    expect(pullRequestDecoratorReporter.context.list).to.have.lengthOf(1);

  });

  it("Given a neither valid error or successful request when calling *request* event method then throw an error", function () {

    // GIVEN a invalid request : it does not contain a response


    const args = {
      "request": {
        "url": {
          "protocol": "https",
          "path": ["api/v1/sports/12"],
          "host": ["localhost"],
          "query": [],
          "variable": []
        }
      },
      "item": {
        "name": "As a Sport User, i can see sport details",
      }
    }

    // THEN WHEN calling request event without any error
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    expect(() => pullRequestDecoratorReporter.request(null, args)).to.throw(Error, '[-] ERROR: Result of the request named [As a Sport User, i can see sport details] cannot be identified neither as an error nor a success.');
  });

  it("Given assertion in success when calling *assertion* event method then context is correctly filled with request information", function () {

    // GIVEN a not skipped assertion
    const args = {
      "skipped": false
    }

    // AND a currentItem with a 'PASS' test status  WHEN calling assertion event 
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    pullRequestDecoratorReporter.context.currentItem.test_status = "PASS";
    pullRequestDecoratorReporter.assertion(null, args);

    // THEN

    expect(pullRequestDecoratorReporter.context.currentItem.test_status).to.equal("PASS");
    expect(pullRequestDecoratorReporter.context.assertions.failed_count).to.equal(0);
    expect(pullRequestDecoratorReporter.context.assertions.skipped_count).to.equal(0);
    expect(pullRequestDecoratorReporter.context.currentItem.failed).to.be.empty;
    expect(pullRequestDecoratorReporter.context.currentItem.skipped).to.be.empty;

  });

  it("Given an assertion in error when calling *assertion* event method then context is correctly filled with request information", function () {

    // GIVEN

    const error = {
      "test": "Status code is 200",
      "name": "AssertionError",
      "message": "expected response to have status code 200 but got 404"
    }

    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    pullRequestDecoratorReporter.assertion(error);

    // THEN

    expect(pullRequestDecoratorReporter.context.currentItem.test_status).to.equal("FAIL");
    expect(pullRequestDecoratorReporter.context.currentItem.failed[0]).to.equal('Status code is 200 , AssertionError , expected response to have status code 200 but got 404');
    expect(pullRequestDecoratorReporter.context.assertions.failed_count).to.equal(1);

  });

  it("Given a skipped assertion when calling *assertion* event method then context is correctly filled with request information", function () {

    // GIVEN

    const args = {
      "skipped": true,
      "assertion": "Status code is 200"
    }

    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    pullRequestDecoratorReporter.assertion(null, args);

    // THEN
    expect(pullRequestDecoratorReporter.context.currentItem.test_status).to.equal("SKIP");
    expect(pullRequestDecoratorReporter.context.currentItem.skipped[0]).to.equal('Status code is 200');
    expect(pullRequestDecoratorReporter.context.assertions.skipped_count).to.equal(1);

  });

  it("Given a skipped assertion but *request* event having failed before when calling *assertion* event method then context is correctly filled with request information", function () {

    // GIVEN

    const args = {
      "skipped": true
    }

    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    pullRequestDecoratorReporter.context.currentItem.test_status = "FAIL";
    pullRequestDecoratorReporter.assertion(null, args);

    // THEN
    expect(pullRequestDecoratorReporter.context.currentItem.test_status).to.equal("FAIL");
    expect(pullRequestDecoratorReporter.context.assertions.failed_count).to.equal(1);
    expect(pullRequestDecoratorReporter.context.assertions.skipped_count).to.equal(0);

  });

  it("Given an item collection when calling *beforeDone* event method then report is pushed with correct information", function () {

    // GIVEN newEmitter
    const spyPush = sinon.spy();
    newmanEmitter = {
      on: sinon.spy(),
      exports: {
        push: spyPush
      }
    };

    // AND "any markdown" returned by buildMarkdownText
    const spyBuildMarkdownText = sinon.stub(utils, 'buildMarkdownText').callsFake(() => "any markdown");

    // AND collection of items grouped by folder name
    const args = {
      summary: {
        collection: {
          items: [
            {
              "id": "975b4315-4dbf-493f-9f1a-07dc9c86a9ba",
              "name": "As a Sport User, i can find a sport place",
              "items": [
                {
                  "id": "aea24803-aff8-4183-a0d4-a359c0d8888a",
                  "name": "Get all ice hockey sport places within 99km around McGill University in Montréal, Canada"
                },
                {
                  "id": "8eb0fa88-f724-4e80-983d-5cba1a97be86",
                  "name": "Show one place"
                }
              ]
            },
            {
              "id": "7609bc00-550f-4af1-8912-8d118ce0b9b8",
              "name": "As a Sport User, i can see sport details",
              "items": [
                {
                  "id": "56fa0911-11f2-4533-9762-2870bed3aa2c",
                  "name": "List all sports with allowed filters & tags"
                },
                {
                  "id": "6a6efb2a-7e80-40e9-94be-bc5c01c4c4e1",
                  "name": "Show details for a sport"
                }
              ]
            }
          ]
        }

      }
    }

    // AND for each item : its details generated by the reporter
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    pullRequestDecoratorReporter.context.list = [
      {
        "failed": [],
        "skipped": [],
        "id": "aea24803-aff8-4183-a0d4-a359c0d8888a",
        "request_name": "Get all ice hockey sport places within 99km around McGill University in Montréal, Canada",
        "url": "https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175",
        "method": "GET",
        "status": "OK",
        "code": 200,
        "test_status": "PASS"
      },
      {
        "failed": [],
        "skipped": [],
        "id": "8eb0fa88-f724-4e80-983d-5cba1a97be86",
        "request_name": "Show one place",
        "url": "https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54",
        "method": "GET",
        "status": "OK",
        "body": "",
        "code": 200,
        "test_status": "PASS"
      },
      {
        "failed": [],
        "skipped": [],
        "id": "56fa0911-11f2-4533-9762-2870bed3aa2c",
        "request_name": "List all sports with allowed filters & tags",
        "url": "https://sportplaces-api.decathlon.com/api/v1/sports",
        "method": "GET",
        "status": "OK",
        "code": 200,
        "test_status": "PASS"
      },
      {
        "failed": [],
        "skipped": [],
        "id": "6a6efb2a-7e80-40e9-94be-bc5c01c4c4e1",
        "request_name": "Show details for a sport",
        "url": "https://sportplaces-api.decathlon.com/api/v1/sports/12",
        "method": "GET",
        "status": "OK",
        "body": "",
        "code": 200,
        "test_status": "PASS"
      }
    ]


    // WHEN
    pullRequestDecoratorReporter.beforeDone(null, args);

    // THEN
    expect(spyPush).to.have.been.calledWith({
      name: 'pullrequest-decorator-reporter',
      default: 'newman-run-report.md',
      path: 'anyPath',
      content: 'any markdown'
    });


    expect(spyBuildMarkdownText).to.have.been.calledWith([
      {
        "name": "As a Sport User, i can find a sport place",
        "subItems": [
          {
            "failed": [],
            "skipped": [],
            "id": "aea24803-aff8-4183-a0d4-a359c0d8888a",
            "request_name": "Get all ice hockey sport places within 99km around McGill University in Montréal, Canada",
            "url": "https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175",
            "method": "GET",
            "status": "OK",
            "code": 200,
            "test_status": "PASS"
          },
          {
            "failed": [],
            "skipped": [],
            "id": "8eb0fa88-f724-4e80-983d-5cba1a97be86",
            "request_name": "Show one place",
            "url": "https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54",
            "method": "GET",
            "status": "OK",
            "body": "",
            "code": 200,
            "test_status": "PASS"
          }
        ]
      },
      {
        "name": "As a Sport User, i can see sport details",
        "subItems": [
          {
            "failed": [],
            "skipped": [],
            "id": "56fa0911-11f2-4533-9762-2870bed3aa2c",
            "request_name": "List all sports with allowed filters & tags",
            "url": "https://sportplaces-api.decathlon.com/api/v1/sports",
            "method": "GET",
            "status": "OK",
            "code": 200,
            "test_status": "PASS"
          },
          {
            "failed": [],
            "skipped": [],
            "id": "6a6efb2a-7e80-40e9-94be-bc5c01c4c4e1",
            "request_name": "Show details for a sport",
            "url": "https://sportplaces-api.decathlon.com/api/v1/sports/12",
            "method": "GET",
            "status": "OK",
            "body": "",
            "code": 200,
            "test_status": "PASS"
          }
        ]
      }
    ]);

  });
});

describe("PullRequestDecoratorReporter in non report mode (github mode)", function () {

  const newmanOptions = {
    collection: {
      name: "ANY_COLLECTION"
    }
  }

  let newmanEmitter = {
    on: sinon.spy()
  };

  it("Given valid reporter options when instantiating PullRequestDecoratorReporter then it's options are correctly initialized", function () {
    // GIVEN valid reporterOptions
    const reporterOptions = {
      pullrequestDecoratorRepo: "org/repo",
      pullrequestDecoratorRefcommit: "12525141526950",
      pullrequestDecoratorToken: "gUoowOFHOSFjn142414"
    }

    // WHEN
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);

    // THEN
    assert.equal(pullRequestDecoratorReporter.options.repo, 'org/repo');
    assert.equal(pullRequestDecoratorReporter.options.refCommit, '12525141526950');
    assert.equal(pullRequestDecoratorReporter.options.token, 'gUoowOFHOSFjn142414');

  });

  it("Given an item collection when calling *done* event method then githubService is called with correct information", function () {
    // GIVEN valid reporterOptions
    const reporterOptions = {
      pullrequestDecoratorRepo: "org/repo",
      pullrequestDecoratorRefcommit: "12525141526950",
      pullrequestDecoratorToken: "gUoowOFHOSFjn142414"
    }

    // AND collection of items grouped by folder name
    const args = {
      collection: {
        items: [
          {
            "id": "975b4315-4dbf-493f-9f1a-07dc9c86a9ba",
            "name": "As a Sport User, i can find a sport place",
            "items": [
              {
                "id": "aea24803-aff8-4183-a0d4-a359c0d8888a",
                "name": "Get all ice hockey sport places within 99km around McGill University in Montréal, Canada"
              },
              {
                "id": "8eb0fa88-f724-4e80-983d-5cba1a97be86",
                "name": "Show one place"
              }
            ]
          },
          {
            "id": "7609bc00-550f-4af1-8912-8d118ce0b9b8",
            "name": "As a Sport User, i can see sport details",
            "items": [
              {
                "id": "56fa0911-11f2-4533-9762-2870bed3aa2c",
                "name": "List all sports with allowed filters & tags"
              },
              {
                "id": "6a6efb2a-7e80-40e9-94be-bc5c01c4c4e1",
                "name": "Show details for a sport"
              }
            ]
          }
        ]
      }
    }

    // AND PullRequestDecoratorReporter with github check sucessfully created
    const pullRequestDecoratorReporter = new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions);
    sinon.stub(pullRequestDecoratorReporter.githubService, 'createPullRequestCheck').callsFake(() => Promise.resolve());


    // AND successful collection results
    pullRequestDecoratorReporter.context.assertions = {
      failed_count: 0
    }

    // AND sucessfully generated context
    pullRequestDecoratorReporter.context.list = [
      {
        "failed": [],
        "skipped": [],
        "id": "aea24803-aff8-4183-a0d4-a359c0d8888a",
        "request_name": "Get all ice hockey sport places within 99km around McGill University in Montréal, Canada",
        "url": "https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175",
        "method": "GET",
        "status": "OK",
        "code": 200,
        "test_status": "PASS"
      },
      {
        "failed": [],
        "skipped": [],
        "id": "8eb0fa88-f724-4e80-983d-5cba1a97be86",
        "request_name": "Show one place",
        "url": "https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54",
        "method": "GET",
        "status": "OK",
        "body": "",
        "code": 200,
        "test_status": "PASS"
      },
      {
        "failed": [],
        "skipped": [],
        "id": "56fa0911-11f2-4533-9762-2870bed3aa2c",
        "request_name": "List all sports with allowed filters & tags",
        "url": "https://sportplaces-api.decathlon.com/api/v1/sports",
        "method": "GET",
        "status": "OK",
        "code": 200,
        "test_status": "PASS"
      },
      {
        "failed": [],
        "skipped": [],
        "id": "6a6efb2a-7e80-40e9-94be-bc5c01c4c4e1",
        "request_name": "Show details for a sport",
        "url": "https://sportplaces-api.decathlon.com/api/v1/sports/12",
        "method": "GET",
        "status": "OK",
        "body": "",
        "code": 200,
        "test_status": "PASS"
      }
    ]

    // WHEN
    pullRequestDecoratorReporter.done(null, args);

    // THEN
    expect(pullRequestDecoratorReporter.githubService.createPullRequestCheck).to.have.been.calledWith(
      {
        assertions: { failed_count: 0 },
        items: [
          {
            "name": "As a Sport User, i can find a sport place",
            "subItems": [
              {
                "failed": [],
                "skipped": [],
                "id": "aea24803-aff8-4183-a0d4-a359c0d8888a",
                "request_name": "Get all ice hockey sport places within 99km around McGill University in Montréal, Canada",
                "url": "https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175",
                "method": "GET",
                "status": "OK",
                "code": 200,
                "test_status": "PASS"
              },
              {
                "failed": [],
                "skipped": [],
                "id": "8eb0fa88-f724-4e80-983d-5cba1a97be86",
                "request_name": "Show one place",
                "url": "https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54",
                "method": "GET",
                "status": "OK",
                "body": "",
                "code": 200,
                "test_status": "PASS"
              }
            ]
          },
          {
            "name": "As a Sport User, i can see sport details",
            "subItems": [
              {
                "failed": [],
                "skipped": [],
                "id": "56fa0911-11f2-4533-9762-2870bed3aa2c",
                "request_name": "List all sports with allowed filters & tags",
                "url": "https://sportplaces-api.decathlon.com/api/v1/sports",
                "method": "GET",
                "status": "OK",
                "code": 200,
                "test_status": "PASS"
              },
              {
                "failed": [],
                "skipped": [],
                "id": "6a6efb2a-7e80-40e9-94be-bc5c01c4c4e1",
                "request_name": "Show details for a sport",
                "url": "https://sportplaces-api.decathlon.com/api/v1/sports/12",
                "method": "GET",
                "status": "OK",
                "body": "",
                "code": 200,
                "test_status": "PASS"
              }
            ]
          }
        ]
      },
      {
        repo: 'org/repo',
        refCommit: '12525141526950',
        checkName: undefined,
        token: 'gUoowOFHOSFjn142414',
        export: undefined,
        collectionName: 'ANY_COLLECTION',
        debug: undefined
      });


  });

  it("Given repository name missing when instantiating PullRequestDecoratorReporter then throw an error", function () {
    // GIVEN missing repository name THEN WHEN
    expect(() => new PullRequestDecoratorReporter(newmanEmitter, {}, newmanOptions)).to.throw(Error, '[-] ERROR: Github PullRequest Repository name is missing ! Add --reporter-pullrequest-decorator-repo <repo>.');
  });

  it("Given ref commit missing when instantiating PullRequestDecoratorReporter then throw an error", function () {
    // GIVEN missing refcommit
    const reporterOptions = {
      pullrequestDecoratorRepo: "org/repo"
    }

    // THEN WHEN
    expect(() => new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions)).to.throw(Error, '[-] ERROR: Github PullRequest Ref commit is missing ! Add --reporter-pullrequest-decorator-refcommit <refcommit>.');
  });

  it("Given token missing when instantiating PullRequestDecoratorReporter then throw an error", function () {
    // GIVEN missing token
    const reporterOptions = {
      pullrequestDecoratorRepo: "org/repo",
      pullrequestDecoratorRefcommit: "12525141526950",
    }

    // THEN WHEN
    expect(() => new PullRequestDecoratorReporter(newmanEmitter, reporterOptions, newmanOptions)).to.throw(Error, '[-] ERROR: Github PullRequest Token is missing ! Add --reporter-pullrequest-decorator-token <token>.');
  });

});