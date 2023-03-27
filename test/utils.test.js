const { buildMarkdownText } = require("../lib/utils.js")
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