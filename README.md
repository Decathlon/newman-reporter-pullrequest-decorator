# newman-reporter-pullrequest-decorator


[![NPM Version](https://img.shields.io/npm/v/@decathlon/newman-reporter-pullrequest-decorator.svg?style=flat-square)](https://www.npmjs.com/package/@decathlon/newman-reporter-pullrequest-decorator)
[![Build, test and publish](https://github.com/Decathlon/newman-reporter-pullrequest-decorator/actions/workflows/build-test-publish-workflow.yml/badge.svg?branch=main)](https://github.com/Decathlon/newman-reporter-pullrequest-decorator/actions/workflows/build-test-publish-workflow.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=newman-reporter-pullrequest-decorator&metric=alert_status)](https://sonarcloud.io/dashboard?id=newman-reporter-pullrequest-decorator)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=newman-reporter-pullrequest-decorator&metric=coverage)](https://sonarcloud.io/dashboard?id=newman-reporter-pullrequest-decorator)

## Description

Report [newman](https://github.com/postmanlabs/newman) collection results on an extra check in the Pull Request Checks tab.
If you need a way to export your Postman collection results into Github Pull Request, and you're using github workflow to handle your CI then you're in the right place !  

PullRequest's Check example :  

![PullRequest's Check example](https://user-images.githubusercontent.com/45691655/122566992-768b5e80-d048-11eb-9296-abe3b2086be7.png)

## HIGHLIGHTED FEATURES
  
* Handle deep nested postman folder structure
* Group requests by their folder's name in the generated markdown

## Getting Started

1. Install `newman`
2. Install `@decathlon/newman-reporter-pullrequest-decorator`
3. Run your github workflow and extract from it :
     * GITHUB TOKEN from your running job. Usually, you can get it from ${{ secrets.GITHUB_TOKEN }}.

### Prerequisites

1. `node` and `npm`
2. `newman` - `npm install -g newman`
3. A github token either from :
	* your running github workflow provided as a secret (see above)
	* your own specific Github App (see Notes what issue this option solves)

---

## Installation

```console
npm install -g @decathlon/newman-reporter-pullrequest-decorator
```

> Installation should be done globally if newman is installed globally, otherwise install without `-g` option

---

## Usage

Specify `-r @decathlon/pullrequest-decorator` option while running the collection

In non export mode (it means you actually want to update github pull request) :  

```bash
newman run <collection-url> --environment=<env-url> -r @decathlon/pullrequest-decorator \
  --reporter-pullrequest-decorator-repo <repo> \
  --reporter-pullrequest-decorator-token <github-token> \
  --reporter-pullrequest-decorator-checkname <check-name> \
  --reporter-pullrequest-decorator-refcommit <ref-commit>
```

In export mode :  

```bash
newman run <collection-url> --environment=<env-url> -r @decathlon/pullrequest-decorator \
  --reporter-export <export-path> 
```

### Options:

**Option** | **Remarks**
--- | --- 
`--reporter-pullrequest-decorator-repo` | (Required) Usually you can get it from ${{ github.repository }}. It follows this pattern : "organization/repository"
`--reporter-pullrequest-decorator-token` | (Required) Github token : Usually you can get it from ${{ secrets.GITHUB_TOKEN }} while job is **running**. For more details : https://docs.github.com/en/actions/reference/authentication-in-a-workflow#about-the-github_token-secret
`--reporter-pullrequest-decorator-checkname` | (Optional : Default `newman-check`) Name you want to give to the check name that will be created by the reporter. This parameter is useful if you want to wait for a specific check name to be completed inside your workflow. See, for example, the following github action : fountainhead/action-wait-for-check@v1.0.0
`--reporter-pullrequest-decorator-refcommit` | (Required) Long Commit hash. When you run this reporter from a Pull Request. You should use : ${{ github.event.pull_request.head.sha }}
`--reporter-debug` | (Optional : Default `false`) Reporter debug mode
`--suppress-exit-code` | (Optional) Ensure that asynchronous github API is called before reporter termination.

---

## Notes:

PullRequest's check report can appear on the wrong check suite. This is due to a known github limitation. See here : https://github.community/t/specify-check-suite-when-creating-a-checkrun/118380  
To solve this issue, you can use a token from your own created Github App (and not the one used in the github workflow) so this way, the check run will be automatically created on a specific check suite. 


---

## Development

- `npm pack`
- `npm i -g decathlon-newman-reporter-pullrequest-decorator.<version>.tgz`

---
