const { buildMarkdownText } = require("../lib/utils.js")
const {buildPullRequestComment} = require("../lib/utils.js")
const GithubService = require('../lib/github-service.js')

chai = require('chai'),
	{ assert, expect } = chai,
	path = require('path'),
	expectationsDir = path.resolve('./test/expectations');

chai.use(require('chai-fs'));

describe("Markdown generation", function () {
	it("Given a flat collections when calling buildMarkdownText then generate markdown", function () {
		expect(path.join(expectationsDir, 'flat-markdown.md')).to.be.a.file().with.content(buildMarkdownText([{
			request_name: 'Get all ice hockey sport places within 99km around McGill University in Montréal, Canada',
			url: 'https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175',
			method: 'GET',
			status: 'OK',
			code: 200,
			test_status: 'PASS',
			failed: [],
			skipped: []
		},
		{
			request_name: 'Show one place',
			url: 'https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54',
			method: 'GET',
			status: 'Not Found',
			body: `{ "error": "Not found" }`,
			code: 404,
			test_status: 'FAIL',
			failed: ["Status code is 200 , AssertionError , expected response to have status code 200 but got 404"],
			skipped: []
		}
		]));
	});

	it("Given a one folder level postman collection when calling buildMarkdownText then generate markdown", function () {
		expect(path.join(expectationsDir, 'one-level-folders-markdown.md')).to.be.a.file().with.content(buildMarkdownText([
			{
				"name": "As a Sport User, i can find a sport place",
				"subItems": [
					{
						request_name: 'Get all ice hockey sport places within 99km around McGill University in Montréal, Canada',
						url: 'https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175',
						method: 'GET',
						status: 'OK',
						code: 200,
						test_status: 'PASS',
						failed: [],
						skipped: []
					},
					{
						request_name: 'Show one place',
						url: 'https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54',
						method: 'GET',
						status: 'Not Found',
						body: `{ "error": "Not found" }`,
						code: 404,
						test_status: 'FAIL',
						failed: ["Status code is 200 , AssertionError , expected response to have status code 200 but got 404"],
						skipped: []
					}
				]

			},
			{
				"name": "As a Sport User, i can see sport details",
				"subItems": [
					{
						"id": "4b4aad2b-ab5f-47fe-8696-db50f846c237",
						"request_name": "List all sports with allowed filters & tags",
						"url": "https://sportplaces-api.decathlon.com/api/v1/sports",
						"method": "GET",
						"failed": [],
						"skipped": [],
						"status": "OK",
						"code": 200,
						"test_status": "PASS"
					},
					{
						"id": "b43d81ce-3386-4f35-90a2-773ef0e74f7e",
						"request_name": "Show details for a sport",
						"url": "https://sportplaces-api.decathlon.com/api/v1/sports/12",
						"method": "GET",
						"failed": [],
						"skipped": [],
						"status": "OK",
						"code": 201,
						"test_status": "PASS"
					}
				]
			}
		]
		));
	});

	it("Given a x level folders postman collection when calling buildMarkdownText then generate markdown", function () {
		expect(path.join(expectationsDir, 'two-level-folders-markdown.md')).to.be.a.file().with.content(buildMarkdownText([
			{
				"name": "As a Sport User, i can find a sport place",
				"subItems": [
					{
						"name": "As a Sport User, I can see all ice hockey sport places within 99km around McGill University in Montréal, Canada",
						"subItems": [
							{
								"request_name": 'Get all ice hockey sport places within 99km around McGill University in Montréal, Canada',
								"url": 'https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175',
								"method": 'GET',
								"status": 'OK',
								"code": 200,
								"test_status": 'PASS',
								"failed": [],
								"skipped": []
							}
						],
					},
					{
						"name": "As a Sport User, i can see one specific place",
						"subItems": [
							{
								"request_name": 'Show one place',
								"url": 'https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54',
								"method": 'GET',
								"status": 'Not Found',
								"body": `{ "error": "Not found" }`,
								"code": 404,
								"test_status": 'FAIL',
								"failed": ["Status code is 200 , AssertionError , expected response to have status code 200 but got 404"],
								"skipped": []
							}
						]
					}
				]
			},
			{
				"name": "As a Sport User, i can see sport details",
				"subItems": [
					{
						"name": "As a Sport User, i can find all sports",
						"subItems": [
							{
								"id": "4b4aad2b-ab5f-47fe-8696-db50f846c237",
								"request_name": "List all sports with allowed filters & tags",
								"url": "https://sportplaces-api.decathlon.com/api/v1/sports",
								"method": "GET",
								"failed": [],
								"skipped": [],
								"status": "OK",
								"code": 200,
								"test_status": "PASS"
							}
						]
					},
					{
						"name": "As a Sport User, i can see sport details",
						"subItems": [
							{
								"id": "b43d81ce-3386-4f35-90a2-773ef0e74f7e",
								"request_name": "Show details for a sport",
								"url": "https://sportplaces-api.decathlon.com/api/v1/sports/12",
								"method": "GET",
								"failed": [],
								"skipped": [],
								"status": "OK",
								"code": 201,
								"test_status": "PASS"
							}
						]
					}
				]
			}
		]));
	});

	it("Given an invalid collections (mix of folder and flat requests) when calling buildMarkdownText then throw an error", function () {
		expect(() => buildMarkdownText([
			{
				request_name: 'Get all ice hockey sport places within 99km around McGill University in Montréal, Canada',
				url: 'https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175',
				method: 'GET',
				status: 'OK',
				code: 200,
				test_status: 'PASS',
				failed: [],
				skipped: []
			},
			{
				"name": "As a Sport User, i can see sport details",
				"subItems": [
					{
						"id": "b43d81ce-3386-4f35-90a2-773ef0e74f7e",
						"request_name": "Show details for a sport",
						"url": "https://sportplaces-api.decathlon.com/api/v1/sports/12",
						"method": "GET",
						"failed": [],
						"skipped": [],
						"status": "OK",
						"code": 201,
						"test_status": "PASS"
					}
				]
			}
		]))
			.to.throw(Error, 'Collection should contain at any level either only folders or requests.');
	});

	it("Given an empty folder level postman collection when calling buildMarkdownText then generate markdown", function () {
		const collectionName = "SC001 - As a Customer, i want to merge an anonymous cart from another anonymous cart";
		const report = {
			"name": collectionName,
			"subItems": []
		}
		expect(path.join(expectationsDir, 'empty-folder-markdown.md')).to.be.a.file().with.content(buildMarkdownText([report
		]
		));
	});
});

describe("Utils : buildPullRequestComment", () => {

	let githubService = new GithubService({
		token: "anyToken",
		repo: "organization/repo",
		checkName: "non-regression-test-1",
		refCommit: "2d58379528f086352820a3f534396728dad4353f",

	});

    it("Given a collection with no tests, return the correct comment", () => {
        const expectedResult = `Congratulations, All Tests have Passed! \nPlease find the complete report [here](https://github.com/organization/repo/pull/3/checks?check_run_id=1121312312)  \n  ✅ 0 / 0 **Requests Passed** \n  ❌ 0 / 0 **Requests Failed**\n  ⏩ 0 / 0 **Requests Skipped**`;
        const assertions = {
            failed_count: 0,
            skipped_count: 0,
        };

        const items = [{}];
		    const report = {assertions, items}
		    const issueNumber = 3;
		    const checkRunId = "1121312312";
        const result = buildPullRequestComment(report, githubService.options, issueNumber, checkRunId);


        expect(result).to.equal(expectedResult);
    })

    it("Given a collection with depth = 0 that has a passing and failing test return the correct comment", () => {
        const expectedResult = 'You have some failing tests \n Please find the complete report [here](https://github.com/organization/repo/pull/3/checks?check_run_id=1121312312)  \n  ✅ 1 / 2 **Requests Passed** \n  ❌ 1 / 2 **Requests Failed**\n  ⏩ 0 / 2 **Requests Skipped** \n **The following tests are failing:** \n\n [+] Show one place\n  -  Status code is 200 , AssertionError , expected response to have status code 200 but got 404 \n'
        const assertions = {
            failed_count: 1,
            skipped_count: 0,
        };
        const items = [
        {
          request_name: 'Get all ice hockey sport places within 99km around McGill University in Montréal, Canada',
          url: 'https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175',
          method: 'GET',
          status: 'OK',
          code: 200,
          test_status: 'PASS',
          failed: [],
          skipped: []
        },
        {
          request_name: 'Show one place',
          url: 'https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54',
          method: 'GET',
          status: 'Not Found',
          body: `{ "error": "Not found" }`,
          code: 404,
          test_status: 'FAIL',
          failed: ["Status code is 200 , AssertionError , expected response to have status code 200 but got 404"],
          skipped: []
        }
        ];

        const report = {assertions, items}
		    const issueNumber = 3;
		    const checkRunId = "1121312312";
        const result = buildPullRequestComment(report, githubService.options, issueNumber, checkRunId);

        expect(result).to.equal(expectedResult);
    })

	it("Given a collection with depth = 1 that has a passing and failing test return the correct comment", () => {
        const expectedResult = 'You have some failing tests \n Please find the complete report [here](https://github.com/organization/repo/pull/3/checks?check_run_id=1121312312)  \n  ✅ 2 / 4 **Requests Passed** \n  ❌ 2 / 4 **Requests Failed**\n  ⏩ 0 / 4 **Requests Skipped** \n **The following tests are failing:** \n\n [+] Show one place\n  -  Status code is 200 , AssertionError , expected response to have status code 200 but got 404 \n\n [+] Show one place\n  -  Status code is 200 , AssertionError , expected response to have status code 200 but got 404 \n'
        const assertions = {
            failed_count: 2,
            skipped_count: 0,
        };
        const items = [
			{
				name: "depthOneFolderOne",
				subItems: [
					{
					request_name: 'Get all ice hockey sport places within 99km around McGill University in Montréal, Canada',
					url: 'https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175',
					method: 'GET',
					status: 'OK',
					code: 200,
					test_status: 'PASS',
					failed: [],
					skipped: []
				  },
				  {
					request_name: 'Show one place',
					url: 'https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54',
					method: 'GET',
					status: 'Not Found',
					body: `{ "error": "Not found" }`,
					code: 404,
					test_status: 'FAIL',
					failed: ["Status code is 200 , AssertionError , expected response to have status code 200 but got 404"],
					skipped: []
				  }]
			},
			{
				name: "depthOneFolderTwo",
				subItems: [
					{
					request_name: 'Get all ice hockey sport places within 99km around McGill University in Montréal, Canada',
					url: 'https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175',
					method: 'GET',
					status: 'OK',
					code: 200,
					test_status: 'PASS',
					failed: [],
					skipped: []
				  },
				  {
					request_name: 'Show one place',
					url: 'https://sportplaces.api.decathlon.com/api/v1/places/8b1e3027-e438-42c2-92ab-5ebd23f68d54',
					method: 'GET',
					status: 'Not Found',
					body: `{ "error": "Not found" }`,
					code: 404,
					test_status: 'FAIL',
					failed: ["Status code is 200 , AssertionError , expected response to have status code 200 but got 404"],
					skipped: []
				  }]
			}
        ];

        const report = {assertions, items}
		    const issueNumber = 3;
		    const checkRunId = "1121312312";
        const result = buildPullRequestComment(report, githubService.options, issueNumber, checkRunId);


        expect(result).to.equal(expectedResult);
    })

	it("Given a github service, issue number and checkRunId it should return the correct url from buildCheckPageUrl", () => {
		const expectedUrl = "https://github.com/organization/repo/pull/3/checks?check_run_id=1121312312";

        const assertions = {
            failed_count: 1,
            skipped_count: 0,
        };
        const items = [
		{
			request_name: 'Get all ice hockey sport places within 99km around McGill University in Montréal, Canada',
			url: 'https://sportplaces.api.decathlon.com/api/v1/places?origin=-73.582,45.511&radius=99&sports=175',
			method: 'GET',
			status: 'OK',
			code: 200,
			test_status: 'PASS',
			failed: [],
			skipped: []
		}];

        const report = {assertions, items}
		const issueNumber = 3;
		const checkRunId = "1121312312";

		const output = buildPullRequestComment(report, githubService.options, issueNumber, checkRunId).substring(80, 154)
		expect(expectedUrl).to.equal(output);

	})

})
