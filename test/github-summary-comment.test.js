// What to test?

const PullRequestDecoratorReporter = require("../lib/pullrequest-decorator-reporter");
const { buildPullRequestComment } = require("../lib/utils");

// Utils - buildPullRequestComment
// pullrequest-decorator-reporter -  this.githubService.createPullRequestComment
// github-service - getAssociatedPullRequestNumberFromSha
// github-service - createPullRequestComment

const GithubService = require("../lib/github-service.js"),
    chai = require("chai"),
    sinon = require("sinon"),
    {expect} = chai,
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("Utils : buildPullRequestComment", () => {


    it("Should return expected for a collection with no tests", () => {
        const expectedResult = `
        **Summary**:  
        0 **Tests Failed** ❌
        0 **Tests Skipped** ⏩
        0 / 2 **Reqests Passed** ✅`;

        let result = ""

        expect(result).to.equal(expectedResult);
    })




})