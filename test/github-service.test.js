'use strict';

const GithubService = require('../lib/github-service.js'),
    sinon = require("sinon"),
    chai = require('chai'),
    { expect } = chai,
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("GithubService : Create PullRequest Check", () => {

    let githubService = new GithubService({
        token: "anyToken",
        repo: "organization/repo",
        checkName: "non-regression-test-1",
        refCommit: "2d58379528f086352820a3f534396728dad4353f",

    });

    let spyCreate = sinon.spy();
    sinon.stub(githubService, 'getOctokitInstance').callsFake(() => {
        return {
            rest: {
                checks: {
                    create: spyCreate
                }
            }
        }
    });

    it('Given sucessful assertion and a valid pullrequest repository when calling createPullRequestCheck then Ockokit rest create check method is correctly called', () => {

        githubService.createPullRequestCheck({
            assertions: {
                failed_count: 0
            },
            items: []
        });

        expect(spyCreate).to.have.been.calledWith({
            owner: 'organization',
            repo: 'repo',
            name: 'non-regression-test-1',
            head_sha: '2d58379528f086352820a3f534396728dad4353f',
            conclusion: 'success',
            output: {
                title: 'NRT execution results',
                summary: ":trophy: NRT passed : You're good to go !",
                text: ''
            }
        });
    });

    it('Given failed assertion and a valid pullrequest repository when calling createPullRequestCheck then Ockokit rest create check method is correctly called', () => {

        githubService.createPullRequestCheck({
            assertions: {
                failed_count: 1
            },
            items: []
        });

        expect(spyCreate).to.have.been.calledWith({
            owner: 'organization',
            repo: 'repo',
            name: 'non-regression-test-1',
            head_sha: '2d58379528f086352820a3f534396728dad4353f',
            conclusion: 'failure',
            output: {
                title: 'NRT execution results',
                summary: ":boom: NRT failed : I wouldn't deploy that if I were you !",
                text: ''
            }
        });
    });

    it('Given checkname not provided when calling createPullRequestCheck then Ockokit rest create check method is correctly called', () => {

        githubService = new GithubService({
            token: "anyToken",
            repo: "organization/repo",
            refCommit: "2d58379528f086352820a3f534396728dad4353f",

        });

        spyCreate = sinon.spy();
        sinon.stub(githubService, 'getOctokitInstance').callsFake(() => ({
            rest: {
                checks: {
                    create: spyCreate
                }
            }
        }));

        githubService.createPullRequestCheck({
            assertions: {
                failed_count: 0
            },
            items: []
        });

        expect(spyCreate).to.have.been.calledWith({
            owner: 'organization',
            repo: 'repo',
            name: 'newman-check',
            head_sha: '2d58379528f086352820a3f534396728dad4353f',
            conclusion: 'success',
            output: {
                title: 'NRT execution results',
                summary: ":trophy: NRT passed : You're good to go !",
                text: ''
            }
        });
    });
});