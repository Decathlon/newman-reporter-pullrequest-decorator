const { Octokit } = require("@octokit/rest");
const GithubService = require("../lib/github-service");
const { buildPullRequestComment } = require("../lib/utils");

const chai = require("chai"),
      sinon = require("sinon"),
      {expect} = chai,
      {stub} = sinon,
      sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("Utils : buildPullRequestComment", () => {
    it("Given a collection with no tests, return the correct comment", () => {
        const expectedResult = `**Summary**:  
  0 **Tests Failed** ❌
  0 **Tests Skipped** ⏩
  0 / 0 **Reqests Passed** ✅`;

        const assertions = {
            failed_count: 0,
            skipped_count: 0,
        };
        const items = [];
        const report = {assertions, items}

        const result = buildPullRequestComment(report);

        expect(result).to.equal(expectedResult);
    })

    it("Given a collection with a passing and failing test return the correct comment", () => {
        const expectedResult = `**Summary**:  \n  1 **Tests Failed** ❌\n  0 **Tests Skipped** ⏩\n  1 / 2 **Reqests Passed** ✅ \n **The following tests are failing** \n\n [+] Show one place\n  -  Status code is 200 , AssertionError , expected response to have status code 200 but got 404 \n`

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
        const result = buildPullRequestComment(report);

        expect(result).to.equal(expectedResult);
    })
})

// TODO 
describe("github-service : getAssociatedPullRequestNumberFromSha", () => {
    it("Given a commit sha with no associated pull requests it returns null", async () => {

        let githubService = new GithubService({ 
            token: "anyToken",
            repo: "organization/repo",
            checkName: "non-regression-test",
            refCommit: "commitRef",
        });

        let expectedResponse = [];
        stub(githubService, "getOctokitInstance").resolves(new Octokit());
        stub(githubService.getOctokitInstance(), "request").resolves([])
        
        const res = await githubService.getAssociatedPullRequestNumberFromSha();
        console.log(res);
        expect(res).to.be.null;
    })

    it("Given a commit sha with an associated pull request, it returns the pull request number", () => {
        expect(false).to.equal(false);
    })
})

// TODO
describe("pullrequest-decorator-reporter : createPullRequestComment", () => {
    it("Given a commit sha with no associated pull request, it returns null", () => {
        expect(1).to.equal(1);
    })

    it("Given a commit sha with an associated pull request, it creates a github comment", () => {
        expect(1).to.equal(1);
    })
})

